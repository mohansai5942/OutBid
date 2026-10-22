// OutBid daily boards — today (live) + past days derived from listing claim dates.
(function () {
  var S = window.RKStore, R = window.RK;

  function dayKey(iso) { return String(iso).slice(0, 10); }
  function dayLabel(key) {
    var d = new Date(key + "T00:00:00Z");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  }
  function miniRows(rows, amtOf) {
    return rows.map(function (l, i) {
      return '<div class="mini-row"><span class="rank-num">#' + (i + 1) + "</span>" + R.logoHTML(l, 30) +
        '<span class="mini-name"><a href="product.html?u=' + encodeURIComponent(R.domainOf(l.url)) + '">' + R.esc(l.name) + '</a></span>' +
        '<span class="mini-amt">' + R.inr(amtOf(l)) + "</span></div>";
    }).join("");
  }

  function init() {
    var listings = S.load();
    var today = new Date().toISOString().slice(0, 10);
    var todayRows = S.todayBoard(listings);
    var html = "";

    html += '<div class="day-card"><h3>' + dayLabel(today) + ' <span class="live-pill-tag">Live</span></h3>' +
      '<p style="color:var(--muted);font-size:14px;margin:6px 0 10px">This day is still open for claims. It closes at midnight UTC.</p>';
    html += todayRows.length ? miniRows(todayRows.slice(0, 3), function (l) { return l.todayBid || 0; })
      : '<p class="side-empty">Nobody claimed a rank this day.</p>';
    html += '<p style="margin-top:14px"><a class="btn-claim" style="display:inline-block;text-decoration:none" href="index.html?board=today">Claim a rank</a> ' +
      '<a class="btn-outline" href="index.html?board=today">Show all ranks</a></p></div>';

    var byDay = {};
    S.live(listings).forEach(function (l) {
      var k = dayKey(l.claimedAt);
      if (k === today) return;
      (byDay[k] = byDay[k] || []).push(l);
    });
    Object.keys(byDay).sort().reverse().forEach(function (k) {
      var rows = byDay[k].slice().sort(function (a, b) { return b.amount - a.amount; });
      html += '<div class="day-card"><h3>' + dayLabel(k) + "</h3>" +
        '<p style="color:var(--muted);font-size:14px;margin:6px 0 10px">' + rows.length + " listing" + (rows.length === 1 ? "" : "s") + "</p>" +
        miniRows(rows.slice(0, 3), function (l) { return l.amount; }) + "</div>";
    });

    document.getElementById("dailyBody").innerHTML = html;
  }

  document.addEventListener("DOMContentLoaded", init);
})();
