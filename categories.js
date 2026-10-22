// OutBid categories grid.
(function () {
  var S = window.RKStore, R = window.RK;
  function init() {
    var listings = S.load();
    var cards = window.RK_CATEGORIES.map(function (c) {
      var rows = S.categoryBoard(listings, c);
      var top = rows[0];
      return { name: c, count: rows.length, top: top };
    }).sort(function (a, b) { return b.count - a.count; });

    document.getElementById("catGrid").innerHTML = cards.map(function (c) {
      return '<a class="cat-card" href="index.html?cat=' + encodeURIComponent(c.name) + '"><h3>' + R.esc(c.name) + "</h3>" +
        "<p>" + c.count + " claim" + (c.count === 1 ? "" : "s") + "</p>" +
        (c.top ? '<div class="cat-top">🏆 #1: <b>' + R.esc(c.top.name) + "</b> · " + R.inr(c.top.amount) + "</div>"
               : '<div class="cat-top">No claims yet — take #1 for ' + R.inr(S.CONFIG.minBid) + "</div>") +
        "</a>";
    }).join("");
  }
  document.addEventListener("DOMContentLoaded", init);
})();
