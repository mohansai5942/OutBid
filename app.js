// OutBid board UI — boards, claim flow with metadata auto-fetch, sidebar, activity.
(function () {
  var S = window.RKStore, R = window.RK;
  var listings = S.load();
  var board = R.qs("board") === "today" ? "today" : "alltime";
  var category = R.qs("cat") || "All";
  var fetchedMeta = null;   // {title, description, logo} from Microlink
  var fetchFor = "";        // target string the meta belongs to
  var pendingClaim = null;

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- target parsing ---------- */
  function normalizeTarget(raw) {
    var t = (raw || "").trim();
    if (!t) return null;
    if (t.charAt(0) === "@") {
      var handle = t.slice(1).replace(/[^a-zA-Z0-9_.]/g, "");
      if (!handle) return null;
      return { url: "https://x.com/" + handle, label: "@" + handle, handle: handle };
    }
    var u = t.replace(/\s+/g, "");
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    try {
      var parsed = new URL(u);
      if (!parsed.hostname || parsed.hostname.indexOf(".") < 0) return null;
      return { url: parsed.href, label: parsed.hostname.replace(/^www\./, "") };
    } catch (e) { return null; }
  }

  /* ---------- category bar + select ---------- */
  function buildCategories() {
    var cats = ["All"].concat(window.RK_CATEGORIES);
    $("catBar").innerHTML = cats.map(function (c) {
      var href = "index.html?" + (board === "today" ? "board=today&" : "") + (c === "All" ? "" : "cat=" + encodeURIComponent(c));
      return '<a class="cat-tab' + (c === category ? " active" : "") + '" href="' + href + '">' + R.esc(c) + "</a>";
    }).join("") + '<a class="cat-tab explore" href="categories.html">Explore ›</a>';

    var sel = $("claimCategory");
    sel.innerHTML = '<option value="">Choose a category</option>' + window.RK_CATEGORIES.map(function (c) {
      return '<option value="' + R.esc(c) + '">' + R.esc(c) + "</option>";
    }).join("");
  }

  /* ---------- hero / claim widget ---------- */
  function claimAmount() {
    var v = parseInt($("bidAmount").value, 10);
    return isNaN(v) ? 0 : v;
  }
  function defaultAmount() {
    if (board === "today") {
      var t = S.topTodayAmount(listings);
      return t > 0 ? t + S.CONFIG.topIncrement : S.CONFIG.minBid;
    }
    var top = S.topAmount(listings);
    return top > 0 ? top + S.CONFIG.topIncrement : S.CONFIG.minBid;
  }
  function updateHero() {
    $("h1Prefix").textContent = board === "today" ? "Claim today's #1 for" : "Claim #1 for";
    $("tabAlltime").classList.toggle("active", board === "alltime");
    $("tabToday").classList.toggle("active", board === "today");
    $("todayCountdown").hidden = board !== "today";
    $("sideTitle").textContent = board === "today" ? "All-time ranking" : "Today's ranking";
    $("sideSeeAll").href = board === "today" ? "index.html" : "index.html?board=today";
    $("sideSeeAll").textContent = "See all ›";
  }
  function updateHelper() {
    var amt = claimAmount();
    var cat = $("claimCategory").value;
    var target = normalizeTarget($("claimTarget").value);
    var valid = !!target && amt >= S.CONFIG.minBid && !!cat;
    $("claimBtn").disabled = !valid;
    if (!target) {
      $("claimHelper").innerHTML = "Enter your product URL — we'll fetch its logo &amp; details automatically.";
      return;
    }
    if (amt < S.CONFIG.minBid) {
      $("claimHelper").textContent = "Minimum bid is " + R.inr(S.CONFIG.minBid) + ".";
      return;
    }
    var rAll = S.rankForAmount(listings, amt);
    var rToday = S.rankForTodayAmount(listings, amt);
    var txt = "Places you <strong>#" + rAll + " overall</strong> and <strong>#" + rToday + " today</strong>";
    if (cat) {
      var catBoard = S.categoryBoard(listings, cat);
      var rc = 1;
      catBoard.forEach(function (l) { if (l.amount >= amt) rc++; });
      txt += " · <strong>#" + rc + " in " + R.esc(cat) + "</strong>";
    }
    $("claimHelper").innerHTML = txt;
  }

  /* ---------- metadata auto-fetch (Microlink, free) ---------- */
  var CAT_KEYWORDS = [
    ["EdTech", ["school", "college", "education", "learn", "course", "erp"]],
    ["Ecommerce", ["shop", "store", "deal", "buy", "cart", "price"]],
    ["Agents", ["ai ", " ai", "agent", "prompt", "gpt", "chatbot"]],
    ["Design", ["design", "portfolio", "interior", "logo", "brand"]],
    ["Marketing", ["marketing", "seo", "ads", "campaign", "growth"]],
    ["SEO", ["seo", "rank", "keyword", "backlink"]],
    ["Productivity", ["tool", "convert", "calculator", "generator", "editor"]],
    ["Crypto", ["crypto", "bitcoin", "web3", "token"]],
    ["Games", ["game", "play", "gaming"]],
    ["Health", ["health", "fitness", "yoga", "clinic", "doctor"]],
    ["Agencies", ["agency", "studio", "services", "solutions", "web development"]],
    ["Travel", ["travel", "hotel", "flight", "tour", "trip"]],
    ["News", ["news", "blog", "magazine"]],
    ["Analytics", ["analytics", "data", "dashboard", "metrics"]],
    ["Hiring", ["job", "hiring", "career", "recruit"]],
    ["Developer", ["code", "developer", "api", "devtool", "software"]],
    ["AI Media", ["video", "image", "photo", "media", "audio"]],
    ["Social", ["social", "community", "chat", "network"]],
    ["Directories", ["directory", "listing", "catalog"]],
    ["Business", ["business", "consult", "company", "enterprise"]]
  ];
  function guessCategory(text) {
    var t = " " + String(text || "").toLowerCase() + " ";
    for (var i = 0; i < CAT_KEYWORDS.length; i++) {
      var kws = CAT_KEYWORDS[i][1];
      for (var j = 0; j < kws.length; j++) if (t.indexOf(kws[j]) >= 0) return CAT_KEYWORDS[i][0];
    }
    return "";
  }

  function fetchMeta(target) {
    if (!target || target.handle) return;
    if (fetchFor === target.url) return;
    fetchFor = target.url;
    fetchedMeta = null;
    $("urlIco").innerHTML = '<span class="spinner"></span>';
    var ctrl = ("AbortController" in window) ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 7000) : null;
    fetch("https://api.microlink.io?url=" + encodeURIComponent(target.url), ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (timer) clearTimeout(timer);
        $("urlIco").textContent = "🌐";
        if (j && j.data) {
          fetchedMeta = {
            title: j.data.title || "",
            description: j.data.description || "",
            logo: (j.data.logo && j.data.logo.url) || ""
          };
          var guessed = guessCategory(fetchedMeta.title + " " + fetchedMeta.description + " " + target.label);
          if (guessed && !$("claimCategory").value) {
            $("claimCategory").value = guessed;
          }
          updateHelper();
        }
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        $("urlIco").textContent = "🌐";
      });
  }

  /* ---------- board rendering ---------- */
  function rowHTML(l, i) {
    var amt = board === "today" ? (l.todayBid || 0) : l.amount;
    var claimAmt = l.amount + (i === 0 ? S.CONFIG.topIncrement : S.CONFIG.increment);
    return '<article class="listing' + (i < 3 ? " top3" : "") + '">' +
      '<div class="rank-num">#' + (i + 1) + "</div>" +
      R.logoHTML(l, 64) +
      '<div class="listing-main">' +
        '<div class="listing-name"><a href="' + R.esc(l.url) + '" target="_blank" rel="noopener" data-click="' + R.esc(l.id) + '">' + R.esc(l.name) + "</a>" +
        (l.demo ? '<span class="demo-tag">LAUNCH CLAIM</span>' : "") + "</div>" +
        '<div class="listing-tag">' + R.esc(l.tagline) + "</div>" +
        '<div class="listing-meta"><b>' + R.esc(l.category) + "</b> · " + R.ago(l.claimedAt) + " · <b>" + R.esc(R.domainOf(l.url)) + "</b> · " + (l.clicks || 0) + ' clicks · <a href="product.html?u=' + encodeURIComponent(R.domainOf(l.url)) + '">see details</a></div>' +
      "</div>" +
      '<div class="listing-side"><div class="listing-amt">' + R.inr(amt) + "</div></div>" +
      '<button type="button" class="row-claim" data-outbid="' + R.esc(l.id) + '" data-amt="' + claimAmt + '">claim this rank for ' + R.inr(claimAmt) + "</button>" +
    "</article>" + (i === 9 ? '<div class="end-label">End of top 10</div>' : "");
  }

  function renderBoard() {
    var rows = board === "today" ? S.todayBoard(listings) : S.live(listings);
    if (category !== "All") rows = rows.filter(function (l) { return l.category === category; });
    $("boardEmpty").hidden = rows.length > 0;
    $("boardList").innerHTML = rows.map(rowHTML).join("");

    Array.prototype.forEach.call(document.querySelectorAll("[data-click]"), function (a) {
      a.addEventListener("click", function () {
        var id = a.getAttribute("data-click");
        listings.forEach(function (l) { if (l.id === id) l.clicks = (l.clicks || 0) + 1; });
        S.save(listings);
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-outbid]"), function (b) {
      b.addEventListener("click", function () {
        var l = listings.filter(function (x) { return x.id === b.getAttribute("data-outbid"); })[0];
        if (!l) return;
        $("bidAmount").value = b.getAttribute("data-amt");
        $("claimTarget").value = l.url.replace(/^https?:\/\//, "");
        $("claimCategory").value = l.category;
        fetchFor = ""; fetchMeta(null);
        updateHelper();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function renderSidebar() {
    var rows = board === "today" ? S.live(listings).slice(0, 5) : S.todayBoard(listings).slice(0, 5);
    if (!rows.length) {
      $("sideList").innerHTML = '<p class="side-empty">Nobody has claimed a rank since midnight UTC.</p>';
    } else {
      $("sideList").innerHTML = rows.map(function (l, i) {
        var amt = board === "today" ? l.amount : (l.todayBid || 0);
        return '<div class="mini-row"><span class="rank-num">#' + (i + 1) + "</span>" + R.logoHTML(l, 30) +
          '<span class="mini-name"><a href="product.html?u=' + encodeURIComponent(R.domainOf(l.url)) + '">' + R.esc(l.name) + '</a></span>' +
          '<span class="mini-amt">' + R.inr(amt) + "</span></div>";
      }).join("");
    }
    var evts = S.loadEvents(listings).slice(0, 8);
    $("activityList").innerHTML = evts.map(function (e) {
      var l = S.findByTarget(listings, e.url);
      var rank = e.rank || (l ? S.overallRank(listings, l) : "–");
      return '<li><a href="product.html?u=' + encodeURIComponent(R.domainOf(e.url)) + '">' + R.esc(e.name) + "</a>" +
        ' <span class="act-meta">at #' + rank + " · " + R.inr(e.amount) + " " + R.ago(e.at) + "</span></li>";
    }).join("") || '<li class="side-empty">No activity yet.</li>';
  }

  function renderStats() {
    var live = S.live(listings);
    $("statVisitors").textContent = S.visitorsToday().toLocaleString("en-IN");
    $("statBids").textContent = R.inr(live.reduce(function (s, l) { return s + (l.amount || 0); }, 0));
    $("statProducts").textContent = live.length.toLocaleString("en-IN");
    $("statsSub").textContent = "since its launch · " + live.reduce(function (s, l) { return s + (l.clicks || 0); }, 0).toLocaleString("en-IN") + " clicks delivered so far";
  }

  function renderAll() { renderBoard(); renderSidebar(); renderStats(); }

  /* ---------- countdown (Today board) ---------- */
  function tickCountdown() {
    if (board !== "today") return;
    var now = new Date();
    var mid = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    var s = Math.max(0, Math.floor((mid - now.getTime()) / 1000));
    var hh = String(Math.floor(s / 3600)).padStart(2, "0");
    var mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    var ss = String(s % 60).padStart(2, "0");
    $("countdownLeft").textContent = hh + ":" + mm + ":" + ss;
  }

  /* ---------- claim flow ---------- */
  function openClaim(ev) {
    ev.preventDefault();
    var target = normalizeTarget($("claimTarget").value);
    var amt = claimAmount();
    var cat = $("claimCategory").value;
    if (!target || amt < S.CONFIG.minBid || !cat) return;
    var existing = S.findByTarget(listings, target.url);
    pendingClaim = { url: target.url, label: target.label, handle: target.handle, amount: amt, category: cat, existingId: existing ? existing.id : null };

    $("confirmRank").textContent = "#" + S.rankForAmount(listings, amt);
    $("confirmCat").textContent = cat;
    $("confirmPrice").textContent = R.inr(amt);
    $("confirmDue").textContent = S.CONFIG.demoMode ? "Free during launch phase" : "Due now";

    var meta = (fetchFor === target.url) ? fetchedMeta : null;
    var name = existing ? existing.name : (meta && meta.title) ? meta.title : "";
    var tagline = existing ? existing.tagline : (meta && meta.description) ? meta.description : "";
    var logo = existing ? (existing.logo || "") : (meta && meta.logo) ? meta.logo : R.faviconFor(target.url);
    if (target.handle) { name = "@" + target.handle; logo = "https://unavatar.io/x/" + target.handle; }

    $("fpLogo").innerHTML = R.logoHTML({ name: name || target.label, logo: logo, url: target.url }, 44);
    $("fpName").textContent = name || target.label;
    $("fpTag").textContent = tagline || "Details fetched from your website — you can edit them below.";
    $("fName").value = name;
    $("fTagline").value = tagline;
    $("fEmail").value = existing ? (existing.email || "") : "";
    $("fTerms").checked = false;
    $("confirmBtn").disabled = true;
    $("formErr").hidden = true;
    pendingClaim.logo = logo;
    pendingClaim.desc = (meta && meta.description) || tagline;
    $("claimModal").hidden = false;
  }

  function submitClaim(ev) {
    ev.preventDefault();
    var name = $("fName").value.trim();
    var tagline = $("fTagline").value.trim();
    var email = $("fEmail").value.trim();
    var err = $("formErr");
    if (!name || !tagline || !/^\S+@\S+\.\S+$/.test(email)) {
      err.textContent = "Fill all fields with a valid email — rank alerts go there.";
      err.hidden = false;
      return;
    }
    var nowIso = new Date().toISOString();
    var rank;
    if (pendingClaim.existingId) {
      listings.forEach(function (l) {
        if (l.id === pendingClaim.existingId) {
          l.amount = Math.max(l.amount, pendingClaim.amount);
          l.todayBid = l.amount;
          l.name = name; l.tagline = tagline; l.email = email;
          l.category = pendingClaim.category; l.logo = pendingClaim.logo || l.logo;
          l.raised = (l.raised || 0) + 1; l.status = "live";
        }
      });
      var ex = listings.filter(function (l) { return l.id === pendingClaim.existingId; })[0];
      rank = S.overallRank(listings, ex);
      S.pushEvent({ type: "raise", name: name, amount: pendingClaim.amount, at: nowIso, url: pendingClaim.url, rank: rank });
    } else {
      var nl = {
        id: "ob-" + Date.now().toString(36), name: name, tagline: tagline,
        desc: pendingClaim.desc || tagline,
        url: pendingClaim.url, logo: pendingClaim.logo, category: pendingClaim.category,
        email: email, amount: pendingClaim.amount, todayBid: pendingClaim.amount,
        clicks: 0, raised: 0, claimedAt: nowIso, status: "live", demo: S.CONFIG.demoMode
      };
      listings.push(nl);
      rank = S.overallRank(listings, nl);
      S.pushEvent({ type: "claim", name: name, amount: pendingClaim.amount, at: nowIso, url: pendingClaim.url, rank: rank });
    }
    S.save(listings);
    $("claimModal").hidden = true;
    board = "alltime"; category = "All";
    buildCategories(); updateHero(); updateHelper(); renderAll();
    document.getElementById("boardList").scrollIntoView({ behavior: "smooth" });
  }

  /* ---------- init ---------- */
  function init() {
    buildCategories();
    if (category !== "All") $("claimCategory").value = category;
    $("bidAmount").value = defaultAmount();
    updateHero(); updateHelper(); renderAll();
    tickCountdown();
    setInterval(tickCountdown, 1000);
    if (!S.CONFIG.demoMode) $("launchBanner").hidden = true;

    $("amtMinus").addEventListener("click", function () {
      var v = Math.max(S.CONFIG.minBid, claimAmount() - 10);
      $("bidAmount").value = v;
      $("amtMinus").disabled = v <= S.CONFIG.minBid;
      updateHelper();
    });
    $("amtPlus").addEventListener("click", function () {
      $("bidAmount").value = claimAmount() + 10;
      $("amtMinus").disabled = false;
      updateHelper();
    });
    $("bidAmount").addEventListener("input", updateHelper);
    $("claimTarget").addEventListener("input", function () {
      updateHelper();
      var t = normalizeTarget($("claimTarget").value);
      if (t) fetchMeta(t);
    });
    $("claimCategory").addEventListener("change", updateHelper);
    $("claimFormTop").addEventListener("submit", openClaim);
    $("claimForm").addEventListener("submit", submitClaim);
    $("fTerms").addEventListener("change", function () { $("confirmBtn").disabled = !$("fTerms").checked; });
    $("modalClose").addEventListener("click", function () { $("claimModal").hidden = true; });
    $("modalCancel").addEventListener("click", function () { $("claimModal").hidden = true; });
    $("claimModal").addEventListener("click", function (e) { if (e.target === $("claimModal")) $("claimModal").hidden = true; });
    $("searchToggle").addEventListener("click", function () {
      var bar = $("searchBar");
      bar.hidden = !bar.hidden;
      if (!bar.hidden) $("searchInput").focus();
    });
    $("searchForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var q = $("searchInput").value.trim();
      if (q) window.location.href = "search.html?q=" + encodeURIComponent(q);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
