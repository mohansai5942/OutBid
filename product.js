// OutBid product detail page.
(function () {
  var S = window.RKStore, R = window.RK;
  var $ = function (id) { return document.getElementById(id); };

  function init() {
    var listings = S.load();
    var u = R.qs("u");
    var l = u ? S.findByTarget(listings, u) : null;
    if (!l) {
      $("productBody").innerHTML = '<p class="board-empty">This product is not on the board (yet). <a href="index.html">Claim a rank →</a></p>';
      return;
    }
    var live = S.live(listings);
    var overall = S.overallRank(listings, l);
    var catBoard = S.categoryBoard(listings, l.category);
    var catRank = S.rankInCategory(listings, l);
    var takeRankAmt = S.amountToTakeRank(listings, overall);
    document.title = R.domainOf(l.url) + " · " + l.name + " · #" + overall + " on OutBid";
    $("crumbCat").textContent = l.category;

    var also = catBoard.filter(function (x) { return x.id !== l.id; }).slice(0, 4);
    $("productBody").innerHTML =
      '<div class="product-card">' +
        '<div class="product-head">' + R.logoHTML(l, 84) +
          '<div><h1>' + R.esc(l.name) + '</h1>' +
          '<div class="listing-meta"><b>' + R.esc(l.category) + "</b> · " + R.ago(l.claimedAt) + " · <b>" + R.esc(R.domainOf(l.url)) + "</b> · " + (l.clicks || 0) + " clicks</div></div>" +
        "</div>" +
        '<p class="product-desc">' + R.esc(l.desc || l.tagline) + "</p>" +
        '<div class="product-actions">' +
          '<a class="btn-dark" id="visitBtn" href="' + R.esc(l.url) + '" target="_blank" rel="noopener">Visit ›</a>' +
          '<button class="btn-outline" id="copyBtn" type="button">Copy link</button>' +
          '<a class="btn-outline" href="index.html">Claim this rank for ' + R.inr(takeRankAmt) + "</a>" +
        "</div>" +
      "</div>" +
      '<div class="stat-cards">' +
        '<div class="stat-card"><div class="confirm-label">Category rank</div><div class="confirm-big">#' + catRank + " of " + catBoard.length + '</div><div class="confirm-small">in ' + R.esc(l.category) + ' · <a href="index.html?cat=' + encodeURIComponent(l.category) + '">See category ranking</a></div></div>' +
        '<div class="stat-card"><div class="confirm-label">Overall</div><div class="confirm-big">#' + overall + " of " + live.length + '</div><div class="confirm-small">on the board · <a href="index.html">See overall ranking</a></div></div>' +
      "</div>" +
      '<div class="about-rank"><h3 style="margin-bottom:10px">About this ranking</h3>' +
        "<p>The listing has been raised <b>" + (l.raised || 0) + " times</b>, most recently " + R.ago(l.claimedAt) + ". <b>" + (l.clicks || 0) + " visitors</b> have opened " + R.esc(R.domainOf(l.url)) + " from OutBid.</p>" +
        "<p>What rank does " + R.esc(l.name) + " hold? <b>#" + overall + " overall, #" + catRank + " in " + R.esc(l.category) + ".</b></p>" +
        "<p>How do I outrank it? Anyone can take this rank for <b>" + R.inr(takeRankAmt) + "</b> on the board.</p>" +
      "</div>" +
      (also.length ? '<h3 style="margin:26px 0 6px">Also in ' + R.esc(l.category) + "</h3>" + also.map(function (x, i) {
        return '<div class="mini-row" style="border-bottom:1px solid var(--line)"><span class="rank-num">#' + (S.overallRank(listings, x)) + "</span>" + R.logoHTML(x, 30) +
          '<span class="mini-name"><a href="product.html?u=' + encodeURIComponent(R.domainOf(x.url)) + '">' + R.esc(x.name) + '</a></span><span class="mini-amt">' + R.inr(x.amount) + "</span></div>";
      }).join("") + '<p style="margin-top:10px"><a href="index.html?cat=' + encodeURIComponent(l.category) + '">See all ›</a></p>' : "");

    $("visitBtn").addEventListener("click", function () {
      listings.forEach(function (x) { if (x.id === l.id) x.clicks = (x.clicks || 0) + 1; });
      S.save(listings);
    });
    $("copyBtn").addEventListener("click", function () {
      var link = window.location.href;
      if (navigator.clipboard) navigator.clipboard.writeText(link);
      $("copyBtn").textContent = "Copied ✓";
      setTimeout(function () { $("copyBtn").textContent = "Copy link"; }, 1600);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
