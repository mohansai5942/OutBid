// OutBid board UI.
(function () {
  var S = window.RKStore;
  var listings = S.load();
  var board = "alltime";
  var category = "All";
  var query = "";

  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function inr(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }
  function ago(iso) {
    var secs = (Date.now() - new Date(iso).getTime()) / 1000;
    if (secs < 3600) return Math.max(1, Math.floor(secs / 60)) + "m ago";
    if (secs < 86400) return Math.floor(secs / 3600) + "h ago";
    return Math.floor(secs / 86400) + "d ago";
  }
  function domainOf(url) {
    var u = String(url || "").replace(/^https?:\/\//, "").replace(/^www\./, "");
    return u.split("/")[0] || u;
  }

  /* ---------- categories ---------- */
  function buildCategories() {
    var sel = $("claimCategory");
    sel.innerHTML = window.RK_CATEGORIES.map(function (c) {
      return '<option value="' + esc(c) + '">' + esc(c) + "</option>";
    }).join("");
    var tabs = ["All"].concat(window.RK_CATEGORIES);
    $("catTabs").innerHTML = tabs.map(function (c) {
      return '<button type="button" class="cat-tab' + (c === category ? " active" : "") +
        '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
    }).join("");
    Array.prototype.forEach.call(document.querySelectorAll(".cat-tab"), function (b) {
      b.addEventListener("click", function () { category = b.getAttribute("data-cat"); buildCategories(); render(); });
    });
  }

  /* ---------- stats ---------- */
  function renderStats() {
    var live = S.live(listings);
    $("statProducts").textContent = live.length.toLocaleString("en-IN");
    $("statBids").textContent = inr(live.reduce(function (s, l) { return s + (l.amount || 0); }, 0));
    $("statClicks").textContent = live.reduce(function (s, l) { return s + (l.clicks || 0); }, 0).toLocaleString("en-IN");
  }

  /* ---------- board ---------- */
  function currentBoard() {
    var rows = board === "today" ? S.todayBoard(listings) : S.live(listings);
    if (category !== "All") rows = rows.filter(function (l) { return l.category === category; });
    if (query) {
      var q = query.toLowerCase();
      rows = rows.filter(function (l) {
        return (l.name + " " + l.tagline + " " + domainOf(l.url)).toLowerCase().indexOf(q) >= 0;
      });
    }
    return rows;
  }

  function render() {
    var rows = currentBoard();
    $("boardEmpty").hidden = rows.length > 0;
    $("boardList").innerHTML = rows.map(function (l, i) {
      var amt = board === "today" ? (l.todayBid || 0) : l.amount;
      var outbidAmt = (l.amount || 0) + S.CONFIG.increment;
      return '<article class="listing' + (i === 0 ? " top1" : "") + '">' +
        '<div class="rank-num">' + (i === 0 ? '<span class="rank-crown">👑</span>' : "") + "#" + (i + 1) + "</div>" +
        '<div class="listing-main">' +
          '<div class="listing-name"><a href="' + esc(l.url) + '" target="_blank" rel="noopener" data-click="' + esc(l.id) + '">' + esc(l.name) + "</a>" +
          (l.demo ? '<span class="demo-tag">LAUNCH CLAIM</span>' : "") + "</div>" +
          '<div class="listing-tag">' + esc(l.tagline) + "</div>" +
          '<div class="listing-meta"><span class="chip">' + esc(l.category) + "</span>" + esc(domainOf(l.url)) + " · listed " + ago(l.claimedAt) + "</div>" +
        "</div>" +
        '<div class="listing-side">' +
          '<div class="listing-amt">' + inr(amt) + "</div>" +
          '<div class="listing-clicks">' + (l.clicks || 0) + " clicks</div>" +
          '<button type="button" class="btn-outbid" data-outbid="' + esc(l.id) + '" data-amt="' + outbidAmt + '">Claim this rank for ' + inr(outbidAmt) + "</button>" +
        "</div>" +
      "</article>";
    }).join("");

    Array.prototype.forEach.call(document.querySelectorAll("[data-click]"), function (a) {
      a.addEventListener("click", function () {
        var id = a.getAttribute("data-click");
        for (var i = 0; i < listings.length; i++) if (listings[i].id === id) listings[i].clicks = (listings[i].clicks || 0) + 1;
        S.save(listings);
        setTimeout(renderStats, 300);
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-outbid]"), function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-outbid");
        var l = listings.filter(function (x) { return x.id === id; })[0];
        if (!l) return;
        $("bidAmount").value = b.getAttribute("data-amt");
        $("claimTarget").value = l.url.replace(/^https?:\/\//, "");
        $("claimCategory").value = l.category;
        updateClaimNote();
        document.getElementById("claim").scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
    renderStats();
  }

  /* ---------- claim widget ---------- */
  function claimAmount() {
    var v = parseInt($("bidAmount").value, 10);
    return isNaN(v) ? 0 : v;
  }
  function updateClaimNote() {
    var amt = claimAmount();
    if (amt < S.CONFIG.minBid) {
      $("claimNote").textContent = "Minimum bid is " + inr(S.CONFIG.minBid) + ".";
      return;
    }
    var rank = S.rankForAmount(listings, amt);
    $("claimNote").textContent = inr(amt) + " buys you rank #" + rank + " right now · Launch phase: free to claim · Taking a rank later costs ₹50 more than its holder";
  }

  function normalizeTarget(raw) {
    var t = (raw || "").trim();
    if (!t) return null;
    if (t.charAt(0) === "@") {
      var handle = t.slice(1).replace(/[^a-zA-Z0-9_.]/g, "");
      if (!handle) return null;
      return { url: "https://x.com/" + handle, label: "@" + handle };
    }
    var u = t.replace(/\s+/g, "");
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    try {
      var parsed = new URL(u);
      if (!parsed.hostname || parsed.hostname.indexOf(".") < 0) return null;
      return { url: parsed.href, label: parsed.hostname.replace(/^www\./, "") };
    } catch (e) { return null; }
  }

  var pendingClaim = null;

  function openClaim() {
    var amt = claimAmount();
    var target = normalizeTarget($("claimTarget").value);
    var err = $("formErr");
    if (!target) { alert("Enter a valid product URL (like myproduct.in) or an @handle."); return; }
    if (amt < S.CONFIG.minBid) { alert("Minimum bid is " + inr(S.CONFIG.minBid) + "."); return; }
    var existing = S.findByTarget(listings, target.url);
    pendingClaim = {
      url: target.url, amount: amt, category: $("claimCategory").value,
      existingId: existing ? existing.id : null
    };
    var rank = S.rankForAmount(listings, amt);
    $("modalRankInfo").textContent = (existing ? "Topping up " : "Claiming ") + target.label +
      " at rank #" + rank + " for " + inr(amt) + " · Category: " + pendingClaim.category;
    $("payAmount").textContent = inr(amt);
    if (existing) {
      $("fName").value = existing.name || "";
      $("fTagline").value = existing.tagline || "";
      $("fEmail").value = existing.email || "";
    }
    err.hidden = true;
    $("claimModal").hidden = false;
  }

  function submitClaim(ev) {
    ev.preventDefault();
    var name = $("fName").value.trim();
    var tagline = $("fTagline").value.trim();
    var email = $("fEmail").value.trim();
    var err = $("formErr");
    if (!name || !tagline || !/^\S+@\S+\.\S+$/.test(email)) {
      err.textContent = "Fill all fields with a valid email — the email is where your rank alerts go.";
      err.hidden = false;
      return;
    }
    var nowIso = new Date().toISOString();
    if (pendingClaim.existingId) {
      for (var i = 0; i < listings.length; i++) {
        if (listings[i].id === pendingClaim.existingId) {
          listings[i].amount = Math.max(listings[i].amount, pendingClaim.amount);
          listings[i].todayBid = listings[i].amount;
          listings[i].name = name; listings[i].tagline = tagline;
          listings[i].email = email; listings[i].category = pendingClaim.category;
          listings[i].status = "live";
        }
      }
    } else {
      listings.push({
        id: "rk-" + Date.now().toString(36), name: name, tagline: tagline,
        url: pendingClaim.url, category: pendingClaim.category, email: email,
        amount: pendingClaim.amount, todayBid: pendingClaim.amount,
        clicks: 0, claimedAt: nowIso, status: "live", demo: S.CONFIG.demoMode
      });
    }
    S.save(listings);
    $("claimModal").hidden = true;
    $("claimForm").reset();
    board = "alltime"; category = "All"; query = ""; $("searchBox").value = "";
    buildCategories();
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (t) {
      t.classList.toggle("active", t.getAttribute("data-board") === "alltime");
    });
    render();
    document.getElementById("board").scrollIntoView({ behavior: "smooth" });
  }

  /* ---------- wire up ---------- */
  function init() {
    buildCategories();
    $("bidAmount").value = Math.max(S.CONFIG.minBid, S.topAmount(listings) + S.CONFIG.increment);
    updateClaimNote();
    render();

    $("amtMinus").addEventListener("click", function () {
      $("bidAmount").value = Math.max(S.CONFIG.minBid, claimAmount() - S.CONFIG.increment);
      updateClaimNote();
    });
    $("amtPlus").addEventListener("click", function () {
      $("bidAmount").value = claimAmount() + S.CONFIG.increment;
      updateClaimNote();
    });
    $("bidAmount").addEventListener("input", updateClaimNote);
    $("claimBtn").addEventListener("click", openClaim);
    $("modalClose").addEventListener("click", function () { $("claimModal").hidden = true; });
    $("claimModal").addEventListener("click", function (e) { if (e.target === $("claimModal")) $("claimModal").hidden = true; });
    $("claimForm").addEventListener("submit", submitClaim);
    $("searchBox").addEventListener("input", function () { query = $("searchBox").value.trim(); render(); });
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (t) {
      t.addEventListener("click", function () {
        board = t.getAttribute("data-board");
        Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (x) { x.classList.toggle("active", x === t); });
        render();
      });
    });
    if (!S.CONFIG.demoMode) $("launchBanner").hidden = true;
  }

  document.addEventListener("DOMContentLoaded", init);
})();
