// OutBid seed data — the owner's own projects seed the board (Phase 1: free launch).
// claimedDaysAgo spreads listings over recent days; todayBid > 0 puts a listing on the Today board.
(function () {
  var now = Date.now();
  function daysAgo(n, h) { return new Date(now - n * 864e5 - (h || 0) * 36e5).toISOString(); }

  window.RK_CATEGORIES = [
    "SaaS", "AI", "EdTech", "Productivity", "Agencies", "Design",
    "Business", "Ecommerce", "Developer", "Marketing", "Other"
  ];

  window.RK_SEED = [
    {
      id: "seed-shaalix", name: "Shaalix", tagline: "School & college ERP with LMS and parent app for Indian schools",
      url: "https://www.shaalix.com", category: "EdTech", email: "",
      amount: 4999, todayBid: 4999, clicks: 212, claimedAt: daysAgo(6, 2), status: "live", seed: true
    },
    {
      id: "seed-tools", name: "BrandiQue Tools", tagline: "40+ free online tools — converters, generators, calculators & more",
      url: "https://tools.brandique.in", category: "Productivity", email: "",
      amount: 3499, todayBid: 0, clicks: 486, claimedAt: daysAgo(9, 5), status: "live", seed: true
    },
    {
      id: "seed-creatorprompts", name: "Creator Prompts", tagline: "Ready-to-use AI prompt library for creators and marketers",
      url: "https://brandique.in", category: "AI", email: "",
      amount: 2999, todayBid: 1200, clicks: 158, claimedAt: daysAgo(4, 1), status: "live", seed: true
    },
    {
      id: "seed-brandique", name: "BrandiQue Web Solutions", tagline: "Web development, AI agents & automations, graphic design — from ₹1,999/mo",
      url: "https://brandique.in", category: "Agencies", email: "",
      amount: 2499, todayBid: 2499, clicks: 341, claimedAt: daysAgo(12, 7), status: "live", seed: true
    },
    {
      id: "seed-jjh", name: "JJH Global Solutions", tagline: "Global business solutions and consulting services",
      url: "https://brandique.in", category: "Business", email: "",
      amount: 1999, todayBid: 0, clicks: 97, claimedAt: daysAgo(3, 4), status: "live", seed: true
    },
    {
      id: "seed-deals", name: "BrandiQue Deals", tagline: "Curated deals and offers platform",
      url: "https://brandique.in", category: "Ecommerce", email: "",
      amount: 1499, todayBid: 600, clicks: 88, claimedAt: daysAgo(2, 3), status: "live", seed: true
    },
    {
      id: "seed-jjhinteriors", name: "JJH Interiors", tagline: "Interior design studio — homes and commercial spaces",
      url: "https://brandique.in", category: "Design", email: "",
      amount: 999, todayBid: 0, clicks: 64, claimedAt: daysAgo(5, 6), status: "live", seed: true
    },
    {
      id: "seed-3dportfolio", name: "3D Portfolio", tagline: "Interactive 3D portfolio experience built with Three.js",
      url: "https://brandique.in", category: "Design", email: "",
      amount: 499, todayBid: 0, clicks: 41, claimedAt: daysAgo(1, 2), status: "live", seed: true
    }
  ];
})();
