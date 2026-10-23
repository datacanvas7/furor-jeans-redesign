# FUROR redesign — Phase 2–8 build notes

Concept: **SIGNAL** (approved direction, `_design/PHASE-1-ART-DIRECTION.md`).
Deliverable: static front-end prototype in `site/` — vanilla HTML/CSS/JS, no build step, no dependencies.
Data: `site/js/data.js` = 250 real products exported from furorjeans.com `/products.json` (page 1 of ~2,750), generated 2026-10-14 by `_tools/prep-data.mjs`.
Imagery: brand's own Shopify CDN assets, width-scaled (`_800x`/`_1200x`) or downloaded locally; campaign masters in `site/assets/campaign/`.
Verification: rendered QA via `_tools/qa.mjs` (project-local Node + headless Edge), screenshots in `_audit/shots/`.

---

## Phase 2 — responsive hero

**Finding that changed the plan:** the PROPORTIONS campaign master (`proportions-hero`, 21:9) carries **baked-in headline typography** ("PROPORTIONS / Wide-Leg / Relaxed / Gurkha Pants") in the left third. Overlaying live HTML type there produced a doubled headline (caught in the first rendered screenshot).

**Resolution (desktop >768px):** the campaign image is the headline. The HTML `<h1>` is screen-reader-only ("FUROR PROPORTIONS — the wide-leg denim capsule"); a `.hero-cta-bar` (white button + on-dark text link) anchors the empty dark floor area bottom-left. No scrim, no gradient — per the anti-slop rule.

**Resolution (mobile ≤768px):** 4:5 crop of the same master with `object-position: 72% 18%`, which crops the baked type out and frames the model on the staircase; live HTML eyebrow/title/sub/CTAs sit below the image in flow (the brand's own mobile crop has baked type, so it is not used).

Verified at 1440/1280/1024/768/390/320: exactly one hero variant visible per breakpoint, no horizontal overflow.

## Phase 3 — design system

Tokens in `site/css/styles.css`: Paper `#F4F0E9`, Ink `#141414`, Surface white, Hairline `#E3DDD2`, Muted `#6B675F`, Signal `#E04129`, Signal Deep `#B02E1C`, Denim `#2E4A6B`.
Measured contrast (documented in the stylesheet header): Ink/Paper 16.9:1; Muted/Paper 4.8:1; Signal Deep/Paper 5.7:1 (accent text only); white/Signal Deep 6.5:1 (filled badges/CTAs); raw Signal 3.7:1 → graphics and borders only, never small text.
Type: Archivo Black (display), Archivo 500–900 (headings/UI emphasis), Inter (body/UI), Space Mono (micro-labels, prices, meta). Fluid scale via `clamp()`.
Geometry: 2px radius, 150/250ms durations, 1280px container, 64px header (56px mobile).
Components: announce bar, sticky header + dropdowns, mobile menu (accordion, injected), hero (2 variants), category tiles, product card (badges, hover quick-add with per-size sold-out states), editorial break with Signal Deep panel, story band, services row, newsletter, footer, cart drawer, modal, toast, PLP facets/chips/sort, PDP gallery/opt-chips/accordions, search page, drawers/scrim, reduced-motion + focus-visible + skip-link + sr-only utilities.

## Phase 4 — homepage (index.html)

- **4A header:** slim sticky header; logo PNG on Paper via `mix-blend-mode: multiply` (inverted in footer). Nav from real catalog: New In, Men (dropdown of real product types), Women (honest sparse-data note + live-store link), Footwear (`?types=Men Shoes,Men Slides`), Accessories (`?types=Men Caps,Bags`), Sale. Predictive search (debounced, top-5 + view-all). Account icon → live store `/account` (labeled by aria-label). Bag with live count (hidden at 0).
- **4B category rail:** 4 tiles (Shirts, Polos, Joggers, Graphic Tees) using real campaign/product imagery; the mislabeled caps asset was relabeled honestly as a Hoodies tile candidate and ultimately not used on the homepage (no Men Hoodies products exist in the page-1 export).
- **4C New arrivals:** 8 newest by real `created_at`, rendered client-side from `data.js`, "New" badges.
- **4D NEW KICKS editorial:** the campaign master's baked center type is masked by the Signal Deep panel (desktop); mobile stacks image then panel. CTA → footwear type view.
- **4E Special prices:** 4 deepest real discounts + sale badges; PROPORTIONS capsule reachable from hero and mobile menu (`?view=proportions` filters real loose/relaxed/baggy/wide titles).
- **4F story band:** verified facts only — established 2017, Karachi; mission quote "Defy the norms and celebrate individuality"; "Quality · Style · Experience".
- **Services:** store locator, BaadMay installments (live-store checkout), in-store exchange, nationwide delivery — each linking to a verified live route.
- **Newsletter:** validates and saves locally; success copy explicitly states delivery is a labeled integration point, not connected.
- **Footer:** verified routes only (`/pages/{about-us,faqs,store-locator}`, `/policies/{refund,shipping,privacy}`, `/collections/women`, `/cart`, `/account`), verified socials (FB/IG/TikTok/YT). No app-store badges (none exist on the live store).

## Phase 5 — collection + product templates

**collection.html** — scope from URL (`view=new|sale|proportions`, `type`, `types`, `cat`); facets derived from the scoped products only: Size, Color, Fit, Fabric, Price buckets, On-sale; sort (featured/new/price±/discount); active-filter chips + clear-all; 12-per-page load-more with count; empty state; mobile filter bottom-sheet (cloned facets, kept in sync); all state URL-synced via `replaceState`. Noisy source values filtered (e.g. `fit`/`fabric` fields containing marketing sentences or stray colons).
**product.html** — gallery + thumbnails; size chips with **real per-variant sold-out states** (`aria-disabled`, struck through) computed from variant availability; color chips when >1 color; add-to-bag validation with focus-to-first-available-size; price with compare-at + save chip; BaadMay note; accordions built from real spec `lines` (label/value pairing heuristic), fit/fabric, and verified policy links; related rail (same type first); "View on the live store" → real `/products/{handle}`; Product JSON-LD.

## Phase 6 — search, cart, checkout handoff

- Header predictive search on every page; `search.html?q=` results page with count, empty state linking to live-store search.
- Cart in `localStorage` (`furor_cart_v1`), drawer with qty/remove/subtotal; focus traps + Esc on drawer/modal/menu.
- **Checkout is an honest handoff:** a modal explains the prototype ends at the bag and links to the live store cart. Nothing simulates a real order.

## Phase 7 — QA

Tooling: `_tools/qa.mjs` — project-local Node v24.18.0 (`_tools/node/`, user-approved download) + puppeteer-core driving system Edge headless. The script self-serves `site/` on :8099, runs 17 suites across 1440/1280/1024/768/390/320, asserts: no horizontal overflow, single meaningful `<h1>`, alt coverage, no broken images (after forced lazy-load scroll + completion wait), landmarks, no dead `href="#"`, no unlabeled buttons, plus page-specific assertions (facets, sold-out chips, related rail, empty states, hero variant per breakpoint). Console/page errors captured.
**Result: 17/17 pass, 0 console errors** (`_audit/shots/report.txt`).
Fixes made from QA/screenshot review: 13 product images were JPEG bytes under `.webp` names (Shopify served originals) → renamed to `.jpg` + `data.js` refs updated; logo path corrected; hero type collision resolved (Phase 2 note); bag badge hidden at zero; mobile menu gained a search form; PLP sort right-anchored.
**Known limitation:** headless Edge's full-page capture composites some below-fold lazy images as grey placeholders even when they are fully loaded (proven loaded by element-level captures, e.g. `_audit/shots/probe-special.png`). DOM assertions are the source of truth; full-page shots are directional.
**Environment:** the in-app browser MCP adapter drops tool arguments and has a 0×0 viewport — unusable; node-repl is flaky after resets. The `_tools` Node + Edge path is the dependable QA route.

## Phase 8 — SEO, performance, launch prep

**In the prototype:** title/description/canonical/OG/Twitter + Organization JSON-LD on the homepage; Product JSON-LD on PDP; `noindex` on prototype collection/product/search pages (they are review artifacts, not production URLs); favicon with MIME type; font preconnects; `loading="lazy"` + width/height attrs on imagery; `fetchpriority="high"` on hero.
**Launch drafts (not served by the prototype):** `_design/launch/robots.txt` and `_design/launch/sitemap.xml` (262 real URLs: home, 5 verified collections, 250 real product handles, verified pages/policies; generated by `_tools/gen-sitemap.mjs`).
**Performance posture:** zero dependencies, no build step; one 40KB stylesheet; 20KB shared runtime; 384KB data file (gzip-friendly, would split per-page in production); images width-scaled at the CDN; local assets 4.9MB total for 54 files. Contrast: live store measured ~2.1MB payload / ~280 requests / 7.4s load (Phase 0) vs this prototype's ~6 requests of first-party HTML/CSS/JS before imagery.
**Production TODOs at launch:** absolute OG image URLs (prototype uses relative paths); split `data.js` per template or fetch from Shopify Storefront API; wire newsletter, checkout, BaadMay eligibility, da-restock back-in-stock; add reviews if desired; serve webp/avif originals (current locals include JPEGs under corrected names); add `srcset` for the hero at 1x/2x.

## Launch checklist & blockers

- [x] Design system + all templates built and rendered-verified
- [x] Real data/assets only; every control works or is labeled pending
- [x] QA suite green (17/17), screenshots archived
- [x] robots/sitemap drafts prepared
- [ ] **Deployment: NOT PERFORMED and not authorized** — this workspace contains no FUROR codebase or Shopify access; the prototype is a design artifact
- [ ] Integration wiring (checkout, newsletter, BNPL, restock) requires live-store access
- [ ] Housekeeping: delete stray empty tree `D:\my-files\MY%20ETP%20FILES\...` (percent-named, from an early path bug); `_tools/node/` (~120MB) removable after QA; `_tmp-hires/` retained as source-of-truth evidence for the audit
