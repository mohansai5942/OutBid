// OutBid search results.
(function () {
  var S = window.RKStore, R = window.RK;
  function init() {
    var q = (R.qs("q") || "").trim();
    var listings = S.load();
    var results = [];
    if (q) {
      var needle = q.toLowerCase();
      results = S.live(listings).filter(function (l) {
        return (l.name + " " + l.tagline + " " + l.category + " " + R.domainOf(l.url)).toLowerCase().indexOf(needle) >= 0;
      }).slice(0, 40);
    }
    document.title = (q || "Search") + " · Search · OutBid";
    document.getElementById("searchSummary").textContent =
      q ? results.length + ' result' + (results.length === 1 ? "" : "s") + ' for "' + q + '".' : "Type a product or category name in the search box on the board.";
    document.getElementById("searchResults").innerHTML = results.map(function (l) {
      return '<a class="search-card" href="product.html?u=' + encodeURIComponent(R.domainOf(l.url)) + '">' + R.logoHTML(l, 52) +
        '<div class="listing-main"><div class="listing-name">' + R.esc(l.name) + '</div>' +
        '<div class="listing-tag">' + R.esc(l.tagline) + '</div>' +
        '<div class="listing-meta"><b>' + R.esc(l.category) + "</b> · " + R.esc(R.domainOf(l.url)) + "</div></div>" +
        '<div class="listing-amt">' + R.inr(l.amount) + "</div></a>";
    }).join("") || '<p class="board-empty">No matches. <a href="index.html">Claim this rank instead →</a></p>';
    if (results.length) {
      document.getElementById("searchResults").innerHTML += '<p class="board-empty" style="padding:14px 0">Showing the top ' + results.length + " product matches.</p>";
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
