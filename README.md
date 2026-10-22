# OutBid — India's Product Launch Board

A bid-based product leaderboard for Indian products & startups: paste your
product URL or X @handle, set a bid, and **your rank is what you bid**.
A [BrandiQue Web Solutions](https://brandique.in) product.
Inspired by [outbid.lol](https://outbid.lol).

**Planned home:** rank.brandique.in · **Theme:** BrandiQue yellow `#EAB308` on black

## What's built (MVP)

- `index.html` — public board: All-time + Today boards, category tabs, search,
  live stats (products / total bid value / clicks delivered), claim widget with
  amount stepper, How-it-works, FAQ, lead-gen footer.
- Claim flow — URL or @handle → details form (name, tagline, **email = lead
  capture**) → listing goes live at the rank its bid buys. Re-submitting the
  same URL tops up instead of duplicating (www- and protocol-insensitive match).
- Ranking rules — rank = bid amount (high → low), ties go to the earlier
  listing; minimum bid ₹99; taking a rank costs ₹50 above its holder.
  All knobs live in `store.js` → `CONFIG`.
- `admin.html` — moderation (hide/unhide/delete, reset demo data) + **leads
  table with CSV download** (every claim's email — the BrandiQue lead funnel).
  Demo gate password: `brandique` — placeholder only, replace before launch.
- `rules.html` — public listing rules page.
- Seed data (`data.js`) — 8 real BrandiQue projects, so the board never opens
  empty.

## Launch-phase mode

`store.js` → `CONFIG.demoMode = true`: claims are **free**, bid amounts reserve
ranks, and a banner on the board says so. Plan: seed free → build traffic →
switch paid bidding on.

## Before real launch (production checklist)

1. **Payments — Dodo Payments.** Owner signs up (Aadhaar + PAN + sole-prop
   details; ~4% + fee per transaction, no monthly fee; Dodo is Merchant of
   Record, so global tax is handled). Then: create a checkout per claim, mark
   a listing paid only on the payment-success webhook, flip `demoMode` to
   `false`. Top-ups charge only the difference.
2. **Backend — Firestore** (project `brandique-web-solutions`, same as the main
   site). Replace `store.js` load/save with Firestore reads/writes; the listing
   shape stays identical. Server-side amount validation + webhook endpoint are
   required so bids can't be faked from the browser.
3. **Admin auth.** Replace the demo password gate with real auth (Firebase
   Auth, owner account only).
4. **Deploy.** Static files → Cloudflare Pages project on `rank.brandique.in`
   (or GitHub Pages from this repo for a first public link).

## Files

| File | Purpose |
|---|---|
| `index.html` / `app.js` | Public board + claim flow |
| `admin.html` / `admin.js` | Moderation + leads |
| `rules.html` | Listing rules |
| `data.js` | Categories + seed listings |
| `store.js` | Data layer + ranking rules (swap point for Firestore) |
| `styles.css` | Yellow/black theme |
