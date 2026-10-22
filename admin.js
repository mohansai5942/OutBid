// OutBid admin — moderation + leads. Demo gate only; production needs real auth (README).
(function () {
  var S = window.RKStore;
  var DEMO_PASSWORD = "brandique";
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function inr(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }

  function render() {
    var listings = S.load();
    var sorted = listings.slice().sort(function (a, b) {
      if (b.amount !== a.amount) return b.amount - a.amount;
      return new Date(a.claimedAt) - new Date(b.claimedAt);
    });
    $("listingsTable").querySelector("tbody").innerHTML = sorted.map(function (l, i) {
      return "<tr><td>" + (i + 1) + "</td>" +
        "<td><strong>" + esc(l.name) + "</strong><br><span style='color:var(--muted)'>" + esc(l.url) + "</span></td>" +
        "<td>" + esc(l.category) + "</td><td>" + inr(l.amount) + "</td><td>" + (l.clicks || 0) + "</td>" +
        "<td class='" + (l.status === "live" ? "status-live" : "status-hidden") + "'>" + esc(l.status) + "</td>" +
        "<td><button class='btn-mini' data-toggle='" + esc(l.id) + "'>" + (l.status === "live" ? "Hide" : "Unhide") + "</button>" +
        "<button class='btn-mini danger' data-del='" + esc(l.id) + "'>Delete</button></td></tr>";
    }).join("") || "<tr><td colspan='7'>No listings.</td></tr>";

    var leads = listings.filter(function (l) { return l.email; });
    $("leadsTable").querySelector("tbody").innerHTML = leads.map(function (l) {
      return "<tr><td>" + esc(l.name) + "</td><td class='lead-mail'>" + esc(l.email) + "</td><td>" +
        inr(l.amount) + "</td><td>" + new Date(l.claimedAt).toLocaleDateString("en-IN") + "</td></tr>";
    }).join("") || "<tr><td colspan='4'>No claims yet — leads will appear here.</td></tr>";

    Array.prototype.forEach.call(document.querySelectorAll("[data-toggle]"), function (b) {
      b.addEventListener("click", function () {
        var ls = S.load();
        ls.forEach(function (l) { if (l.id === b.getAttribute("data-toggle")) l.status = l.status === "live" ? "hidden" : "live"; });
        S.save(ls); render();
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-del]"), function (b) {
      b.addEventListener("click", function () {
        if (!confirm("Delete this listing permanently?")) return;
        var ls = S.load().filter(function (l) { return l.id !== b.getAttribute("data-del"); });
        S.save(ls); render();
      });
    });
  }

  function unlock() {
    if ($("gatePass").value === DEMO_PASSWORD) {
      $("gate").hidden = true;
      $("adminPanel").hidden = false;
      render();
    } else {
      $("gateErr").hidden = false;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("gateBtn").addEventListener("click", unlock);
    $("gatePass").addEventListener("keydown", function (e) { if (e.key === "Enter") unlock(); });
    $("resetBtn").addEventListener("click", function () {
      if (!confirm("Reset all data back to the seed listings?")) return;
      localStorage.removeItem(S.KEY);
      localStorage.removeItem(S.EVENTS_KEY);
      S.load(); render();
    });
    $("csvBtn").addEventListener("click", function () {
      var leads = S.load().filter(function (l) { return l.email; });
      var csv = "product,url,email,bid_inr,claimed_at\n" + leads.map(function (l) {
        return [l.name, l.url, l.email, l.amount, l.claimedAt].map(function (v) {
          return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
        }).join(",");
      }).join("\n");
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = "outbid-leads.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  });
})();
