// OutBid seed data — the owner's own projects seed the board (launch phase).
(function () {
  var now = Date.now();
  function daysAgo(n, h) { return new Date(now - n * 864e5 - (h || 0) * 36e5).toISOString(); }
  function fav(d) { return "https://www.google.com/s2/favicons?domain=" + d + "&sz=128"; }

  window.RK_CATEGORIES = [
    "Leaderboards", "Marketing", "SEO", "Productivity", "Agents", "Developer",
    "Crypto", "Games", "Health", "Business", "Ecommerce", "Directories",
    "Travel", "Agencies", "AI Media", "Social", "EdTech", "Education",
    "Design", "Hiring", "News", "Analytics", "Other"
  ];

  window.RK_SEED = [
    {
      id: "seed-shaalix", name: "Shaalix", tagline: "School & college ERP with LMS and parent app for Indian schools",
      desc: "Shaalix is a complete school & college ERP — admissions, fees, attendance, exams, LMS and a parent app — built for CBSE, State, ICSE, IB and Cambridge institutions.",
      url: "https://www.shaalix.com", logo: fav("shaalix.com"), category: "EdTech", email: "",
      amount: 4999, todayBid: 4999, clicks: 212, raised: 3, claimedAt: daysAgo(6, 2), status: "live", seed: true
    },
    {
      id: "seed-tools", name: "BrandiQue Tools", tagline: "40+ free online tools — converters, generators, calculators & more",
      desc: "A growing collection of 40+ free browser tools across 8 collections — text, image, developer, finance and everyday utilities. No sign-up, no uploads to a server.",
      url: "https://tools.brandique.in", logo: fav("tools.brandique.in"), category: "Productivity", email: "",
      amount: 3499, todayBid: 0, clicks: 486, raised: 2, claimedAt: daysAgo(9, 5), status: "live", seed: true
    },
    {
      id: "seed-creatorprompts", name: "Creator Prompts", tagline: "Ready-to-use AI prompt library for creators and marketers",
      desc: "Hand-tested AI prompts for content creators, marketers and freelancers — copy, paste, and create faster.",
      url: "https://brandique.in", logo: fav("brandique.in"), category: "Agents", email: "",
      amount: 2999, todayBid: 1200, clicks: 158, raised: 1, claimedAt: daysAgo(4, 1), status: "live", seed: true
    },
    {
      id: "seed-brandique", name: "BrandiQue Web Solutions", tagline: "Web development, AI agents & automations, graphic design — from ₹1,999/mo",
      desc: "BrandiQue Web Solutions is a Visakhapatnam-based studio offering web development, AI agents & automations, and graphic design on monthly plans starting at ₹1,999.",
      url: "https://brandique.in", logo: fav("brandique.in"), category: "Agencies", email: "",
      amount: 2499, todayBid: 2499, clicks: 341, raised: 4, claimedAt: daysAgo(12, 7), status: "live", seed: true
    },
    {
      id: "seed-jjh", name: "JJH Global Solutions", tagline: "Global business solutions and consulting services",
      desc: "JJH Global Solutions provides business consulting and global services for growing companies.",
      url: "https://brandique.in", logo: fav("brandique.in"), category: "Business", email: "",
      amount: 1999, todayBid: 0, clicks: 97, raised: 0, claimedAt: daysAgo(3, 4), status: "live", seed: true
    },
    {
      id: "seed-deals", name: "BrandiQue Deals", tagline: "Curated deals and offers platform",
      desc: "BrandiQue Deals curates genuine offers and discounts across popular categories.",
      url: "https://brandique.in", logo: fav("brandique.in"), category: "Ecommerce", email: "",
      amount: 1499, todayBid: 600, clicks: 88, raised: 1, claimedAt: daysAgo(2, 3), status: "live", seed: true
    },
    {
      id: "seed-jjhinteriors", name: "JJH Interiors", tagline: "Interior design studio — homes and commercial spaces",
      desc: "JJH Interiors designs homes and commercial spaces end to end — concept, 3D, and execution.",
      url: "https://brandique.in", logo: fav("brandique.in"), category: "Design", email: "",
      amount: 999, todayBid: 0, clicks: 64, raised: 0, claimedAt: daysAgo(5, 6), status: "live", seed: true
    },
    {
      id: "seed-3dportfolio", name: "3D Portfolio", tagline: "Interactive 3D portfolio experience built with Three.js",
      desc: "An interactive 3D portfolio website with cinematic scenes, built with Three.js.",
      url: "https://brandique.in", logo: fav("brandique.in"), category: "Design", email: "",
      amount: 499, todayBid: 0, clicks: 41, raised: 0, claimedAt: daysAgo(1, 2), status: "live", seed: true
    }
  ];
})();
