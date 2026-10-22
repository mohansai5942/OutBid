// OutBid shared helpers (all pages).
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function inr(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }
  function ago(iso) {
    var secs = (Date.now() - new Date(iso).getTime()) / 1000;
    if (secs < 90) return "just now";
    if (secs < 3600) return Math.floor(secs / 60) + "m ago";
    if (secs < 86400) return Math.floor(secs / 3600) + " hours ago";
    var d = Math.floor(secs / 86400);
    if (d < 30) return d + (d === 1 ? " day ago" : " days ago");
    var m = Math.floor(d / 30);
    return m <= 1 ? "last month" : m + " months ago";
  }
  function domainOf(url) {
    var u = String(url || "").replace(/^https?:\/\//, "").replace(/^www\./, "");
    return u.split("/")[0] || u;
  }
  function faviconFor(url) {
    return "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(domainOf(url)) + "&sz=128";
  }
  function iconHorseFor(url) {
    return "https://icon.horse/icon/" + encodeURIComponent(domainOf(url));
  }
  // Original-logo cascade: the site's own logo/icon first (stored logo, then
  // icon.horse which serves the site's best apple-touch-icon/logo), then the
  // Google favicon, then a letter tile. Each step fires on image error.
  function logoSources(l) {
    var out = [];
    function add(u) { if (u && out.indexOf(u) < 0) out.push(u); }
    add(l.logo);
    add(iconHorseFor(l.url));
    add(faviconFor(l.url));
    return out;
  }
  window.RKLogoStep = function (img) {
    var list = (img.getAttribute("data-fb") || "").split("|").filter(Boolean);
    var idx = parseInt(img.getAttribute("data-fbi") || "0", 10) + 1;
    if (idx < list.length) {
      img.setAttribute("data-fbi", String(idx));
      img.src = list[idx];
    } else {
      img.style.display = "none";
      if (img.nextElementSibling) img.nextElementSibling.style.display = "flex";
    }
  };
  function logoHTML(l, size) {
    var srcs = logoSources(l);
    var letter = esc((l.name || "?").trim().charAt(0).toUpperCase() || "?");
    return '<span class="logo-box" style="width:' + size + "px;height:" + size + 'px">' +
      '<img src="' + esc(srcs[0]) + '" data-fb="' + esc(srcs.join("|")) + '" data-fbi="0" alt="" loading="lazy" onerror="RKLogoStep(this)">' +
      '<span class="logo-letter" style="display:none">' + letter + "</span></span>";
  }
  function qs(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
  }
  // Header live pill: small simulated online count + real local visitor counter.
  function initLivePill() {
    var el = document.getElementById("livePill");
    if (!el || !window.RKStore) return;
    function paint() {
      var v = window.RKStore.visitorsToday();
      var online = 3 + Math.floor(Math.abs(Math.sin(Date.now() / 47000)) * 7);
      el.innerHTML = '<span class="dot"></span>' + online + " online · " + v.toLocaleString("en-IN") + " visitors today · stats→";
    }
    paint();
    setInterval(paint, 20000);
  }
  document.addEventListener("DOMContentLoaded", initLivePill);

  window.RK = { esc: esc, inr: inr, ago: ago, domainOf: domainOf, faviconFor: faviconFor, iconHorseFor: iconHorseFor, logoSources: logoSources, logoHTML: logoHTML, qs: qs };
})();
