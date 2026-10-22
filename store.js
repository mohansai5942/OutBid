// OutBid store — data layer.
// MVP: localStorage. Production swap: replace load/save with Firestore calls
// (same listing shape) — see README.md.
(function () {
  var KEY = "outbid_listings_v1";

  var CONFIG = {
    demoMode: true,        // Launch phase: claims are free; flip to false when Dodo Payments is connected
    minBid: 99,            // ₹ minimum bid
    increment: 50,         // ₹ needed above a listing to take its rank
    currency: "₹"
  };

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
    try { localStorage.setItem(KEY, JSON.stringify(listings)); } catch (e) { /* storage full/blocked */ }
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

  // 1-based rank a new bid of `amount` would take on the all-time board.
  function rankForAmount(listings, amount) {
    var board = live(listings);
    var rank = 1;
    for (var i = 0; i < board.length; i++) {
      if (board[i].amount >= amount) rank++;
    }
    return rank;
  }

  // Amount needed to take `rank` (1-based) on the all-time board.
  function amountToTakeRank(listings, rank) {
    var board = live(listings);
    if (!board.length) return CONFIG.minBid;
    if (rank > board.length) return CONFIG.minBid;
    var target = board[rank - 1];
    return Math.max(CONFIG.minBid, target.amount + CONFIG.increment);
  }

  function topAmount(listings) {
    var board = live(listings);
    return board.length ? board[0].amount : 0;
  }

  function normTarget(s) {
    return (s || "").trim().toLowerCase()
      .replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  }

  function findByTarget(listings, target) {
    var t = normTarget(target);
    for (var i = 0; i < listings.length; i++) {
      var u = normTarget(listings[i].url);
      if (u && u === t) return listings[i];
    }
    return null;
  }

  window.RKStore = {
    CONFIG: CONFIG,
    load: load,
    save: save,
    live: live,
    todayBoard: todayBoard,
    rankForAmount: rankForAmount,
    amountToTakeRank: amountToTakeRank,
    topAmount: topAmount,
    findByTarget: findByTarget
  };
})();
