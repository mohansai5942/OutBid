// OutBid store — data layer.
// MVP: localStorage. Production swap: replace load/save with Firestore calls
// (same listing shape) — see README.md.
(function () {
  var KEY = "outbid_listings_v3";
  var EVENTS_KEY = "outbid_events_v3";
  var VISITORS_KEY = "outbid_visitors_v2";

  var CONFIG = {
    demoMode: true,        // Launch phase: claims are free; flip to false when Dodo Payments is connected
    minBid: 99,            // ₹ minimum bid
    increment: 50,         // ₹ needed above a listing to take its rank
    topIncrement: 250,     // ₹ needed above the current #1 to take #1
    currency: "₹"
  };

  /* ---------- listings ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) { /* fall through to seed */ }
    var seed = JSON.parse(JSON.stringify(window.RK_SEED || []));
    save(seed);
    return seed;
  }

  function save(listings) {
    try { localStorage.setItem(KEY, JSON.stringify(listings)); } catch (e) { /* storage blocked */ }
  }

  function byRank(a, b) {
    if (b.amount !== a.amount) return b.amount - a.amount;
    return new Date(a.claimedAt) - new Date(b.claimedAt); // ties: earlier listing wins
  }

  function live(listings) {
    return listings.filter(function (l) { return l.status === "live"; }).sort(byRank);
  }

  function todayBoard(listings) {
    return live(listings)
      .filter(function (l) { return (l.todayBid || 0) > 0; })
      .sort(function (a, b) {
        if (b.todayBid !== a.todayBid) return b.todayBid - a.todayBid;
        return new Date(a.claimedAt) - new Date(b.claimedAt);
      });
  }

  function rankForAmount(listings, amount) {
    var board = live(listings);
    var rank = 1;
    for (var i = 0; i < board.length; i++) if (board[i].amount >= amount) rank++;
    return rank;
  }

  function rankForTodayAmount(listings, amount) {
    var board = todayBoard(listings);
    var rank = 1;
    for (var i = 0; i < board.length; i++) if ((board[i].todayBid || 0) >= amount) rank++;
    return rank;
  }

  function categoryBoard(listings, category) {
    return live(listings).filter(function (l) { return l.category === category; });
  }

  function rankInCategory(listings, listing) {
    var board = categoryBoard(listings, listing.category);
    for (var i = 0; i < board.length; i++) if (board[i].id === listing.id) return i + 1;
    return null;
  }

  function overallRank(listings, listing) {
    var board = live(listings);
    for (var i = 0; i < board.length; i++) if (board[i].id === listing.id) return i + 1;
    return null;
  }

  function amountToTakeRank(listings, rank) {
    var board = live(listings);
    if (!board.length) return CONFIG.minBid;
    if (rank > board.length) return CONFIG.minBid;
    if (rank === 1) return board[0].amount + CONFIG.topIncrement;
    return Math.max(CONFIG.minBid, board[rank - 1].amount + CONFIG.increment);
  }

  function topAmount(listings) {
    var board = live(listings);
    return board.length ? board[0].amount : 0;
  }

  function topTodayAmount(listings) {
    var board = todayBoard(listings);
    return board.length ? (board[0].todayBid || 0) : 0;
  }

  function normTarget(s) {
    return (s || "").trim().toLowerCase()
      .replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  }

  function findByTarget(listings, target) {
    var t = normTarget(target);
    for (var i = 0; i < listings.length; i++) {
      if (normTarget(listings[i].url) === t && t) return listings[i];
    }
    return null;
  }

  /* ---------- activity events ---------- */
  function loadEvents(listings) {
    try {
      var raw = localStorage.getItem(EVENTS_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* seed below */ }
    var evts = (listings || load()).map(function (l) {
      return { type: "claim", name: l.name, amount: l.amount, at: l.claimedAt, url: l.url };
    }).sort(function (a, b) { return new Date(b.at) - new Date(a.at); });
    saveEvents(evts);
    return evts;
  }

  function saveEvents(evts) {
    try { localStorage.setItem(EVENTS_KEY, JSON.stringify(evts.slice(0, 60))); } catch (e) { /* ignore */ }
  }

  function pushEvent(evt) {
    var evts = loadEvents();
    evts.unshift(evt);
    saveEvents(evts);
  }

  /* ---------- visitors (local demo counter) ---------- */
  function visitorsToday() {
    var today = new Date().toISOString().slice(0, 10);
    var rec = { date: today, count: 128 };
    try {
      var raw = localStorage.getItem(VISITORS_KEY);
      if (raw) rec = JSON.parse(raw);
      if (rec.date !== today) rec = { date: today, count: 128 };
      var counted = false;
      try { counted = !!sessionStorage.getItem("outbid_counted"); } catch (e2) { /* ignore */ }
      if (!counted) {
        rec.count += 1;
        try { sessionStorage.setItem("outbid_counted", "1"); } catch (e3) { /* ignore */ }
      }
      localStorage.setItem(VISITORS_KEY, JSON.stringify(rec));
    } catch (e) { /* ignore */ }
    return rec.count;
  }

  window.RKStore = {
    CONFIG: CONFIG, KEY: KEY, EVENTS_KEY: EVENTS_KEY,
    load: load, save: save, live: live, todayBoard: todayBoard,
    rankForAmount: rankForAmount, rankForTodayAmount: rankForTodayAmount,
    categoryBoard: categoryBoard, rankInCategory: rankInCategory, overallRank: overallRank,
    amountToTakeRank: amountToTakeRank, topAmount: topAmount, topTodayAmount: topTodayAmount,
    findByTarget: findByTarget, normTarget: normTarget,
    loadEvents: loadEvents, pushEvent: pushEvent, visitorsToday: visitorsToday
  };
})();
