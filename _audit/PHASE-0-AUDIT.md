# FUROR — Phase 0 Audit
**Site:** https://furorjeans.com/ · **Date:** 2026-10-10 · **Status:** DELIVERED — awaiting approval (gate before Phase 1)

## Method
No codebase was provided and no rendered browser surface was available. Evidence came from:
- Raw HTML of the homepage (`_audit/home.html`, 300,355 bytes) via curl
- Shopify public JSON endpoints (`_audit/products.json`, `_audit/collections.json`)
- Production theme CSS (`_audit/app.css`)
- Shopify CDN campaign photography downloaded to `_audit/assets/` and visually inspected
- DOM / computed-style / resource-timing extraction via `evaluate_script` on the live origin

## Honest limitation
The in-app browser is hidden with a 0×0 viewport, so `take_screenshot` fails (`NATIVE_BROWSER_VIEWPORT_UNAVAILABLE`). Therefore **rendered layout, responsive behaviour at real breakpoints, colour contrast ratios, and the cart/checkout flow were NOT visually verified.** Everything below is evidence from markup, JSON, CSS, resource timings, and image files — not from observing the rendered page. This is stated rather than papered over.

## Platform & scale
- Shopify Online Store 2.0 (`shopify-section-*` ids, `Shopify.theme` object)
- Theme: `theme_store_id 1762`, schema_name **"FurorJeans" v2.7.0**, authored by **Fuel Themes** (banner in `app.css`; ~35 "flow" string matches), heavily customised
- Catalog: **≥2,750 products** (pages 1–11 of `/products.json` all full at 250), **87 collections**
- Locale/currency: PKR, `en-PK`
- Median price **PKR 4,990**; **27% of variants unavailable**; **19 products sold out**

## Homepage composition (12 sections)
1. Announcement bar with countdown + 3 rotating emoji-led messages
2. Header — **absolute-positioned, non-sticky**
3. Mobile banner sections
4. Hero: `<slide-show class="slideshow main-slideshow carousel custom-dots … transition--fade" data-dots="true" data-autoplay="8000" data-fade="true">` — **5 slides, auto-rotating, fade**, each `text-center content-size-medium` with `style="--overlay-color-rgb: 0,0,0; --overlay-opacity: 0.7;"`, images `class="lazyload"` `data-src="…Slider_1_….webp"` `width="1920" height="900"` `alt=""`, plus a `slideshow__slide-bg` whose `src` is the `_20x9_crop_center.webp` blur placeholder
5–7. Three image galleries
8. Empty spacer section
9. Text-with-icons service row
10. Footer

**Zero product grids on the homepage.** **Zero `<h1>` elements.** The only 8 product links found on the page live in the search drawer's "Trending Now" block (`link.closest('[id^="shopify-section"]')` returned null; cards are `.product-card text-left`).

## Brand strengths to preserve
- **Custom logo wordmark** (`_audit/assets/logo.png`) — strong geometric FUROR mark with diagonal cuts through the F and R. Real brand asset, not a template.
- **Genuinely art-directed campaign photography** already exists:
  - `hero2.webp` — "PROPORTIONS" campaign: beige architecture, model right, clean negative space left. **Best hero candidate.**
  - `hero3.webp` — "NEW KICKS / DROP '26": split duotone footwear
  - `hero5.jpg` — Marvel/Thor **licensed** slides with burned-in callouts (SOFT BOTTOM COMFORT / PREMIUM LEATHERETTE / HIGH-GRIP RUBBER SOLE)
  - `hero4.webp` — "WINTER COLLECTION" with a burned-in white "Explore More" pill over a busy interior
- **Separate mobile crops** of campaigns already exist
- **Real omnichannel business**: store locator, in-store exchange — a genuine differentiator vs. pure online peers

## Visual weaknesses
1. Uniform **70% black scrim** on every hero slide flattens five distinct campaigns into one grey look
2. **Typography is burned into JPGs/WebP**, so five slides carry **five conflicting type treatments**; none is live HTML, none is accessible or editable
3. Burned-in CTAs (`hero4.webp` "Explore More" pill) compete with the real HTML CTA
4. **Promo message inconsistency**: "FREEDOM SALE flat 50% & 30%" vs "Final Call – Season end sale" vs "SEASON END SALE UPTO 60% OFF" — plus the typo **"UPTO"** in `hero1.webp`
5. **No type scale** — single family at 15–20px, no display face, no hierarchy
6. Thin palette: `#151515` / `#fff` / `#E04129` / `#FF0000`
7. **Asset governance**: `cat-caps.webp` is sourced from `Homepage_Banner_Caps…` but actually shows a hoodie labelled "Winter Collection" — filename/content mismatch

## UX & conversion problems
1. No product merchandising on the homepage — a shopper must navigate away to see anything buyable
2. No `<h1>`; heading structure gives search engines and screen readers nothing
3. Header is absolute-positioned and non-sticky — navigation lost on scroll
4. Auto-rotating 5-slide carousel with 8s interval: content a user cannot control or read reliably
5. Announcement bar carries three conflicting sale stories with emoji
6. Empty spacer section shipped to production
7. Leftover third-party remnants (WeChat, Vimeo) in markup

## Technical constraints & defects
- Payload ~**2.1 MB**, ~**280 requests**, **886 KB JS**, **96 `<script>` tags**, **16 render-blocking CSS**, load ~**7.4 s**
- **Legacy Universal Analytics** (`analytics.js`, UA-91378644-1) running alongside GA4/GTM/FB Pixel
- **LCP anti-pattern**: hero image is lazy-loaded with a blur placeholder, no `fetchpriority` or `preload`
- **Production CSS minification is broken.** `app.css` opens with:
  `/** Shopify CDN: Minification failed  Line 2638:0 Unexpected "{"  Line 2644:0 Unexpected "{" **/`
  Cause at lines ~2636–2644 — a comment inside a comma-separated selector list:
  `.shopify-payment-button__more-options:before, .spr-summary-actions-newreview:before, /* .text-button:before */ {`

## Accessibility gaps
- No `<main>` landmark
- **0 aria-labels** on landmarks
- **22 missing alt attributes** (including hero images with `alt=""`)
- No skip link; focus-visible styles not verified

### Two near-false claims caught before publishing
A stray `-->` in the footer and `.baadmay-price.jk{ display:` inside the price element were **verified via `document.body.innerText` to be NOT user-visible** (they sit inside HTML comments / an injected `<style>` tag). Downgraded to code hygiene and **excluded from user-facing defect claims.**

## Working commerce plumbing to preserve (do not break)
Cart drawer · predictive search · Shopify native filters (**Discount, Special Price, Fit Type, Fabric, Product Type, Color, Sizes, Price**) · sort · pagination · sticky toolbar · size guide · BNPL (**BaadMay** installments) · **da-restock** back-in-stock · Shopify-hosted checkout and customer accounts. **No reviews app installed.**

## Prioritised change list

### P0
- Add a product grid to the homepage
- Replace the carousel with a **single art-directed hero** built from the PROPORTIONS asset: remove the 70% scrim, set type in live HTML
- Tell **one consistent sale story**; fix "UPTO"
- Add a real `<h1>` and heading hierarchy; correct `<title>`/meta description

### P1
- Remove legacy UA analytics; JS audit (96 scripts); eager hero with `fetchpriority`/`preload`; cut render-blocking CSS
- Fix the CSS minification error (move the comment out of the selector list)
- Alt text across imagery
- Introduce a display typeface, a real type scale, and an extended palette

### P2
- `<main>` landmark + aria-labels; skip link
- Asset governance: text-free master photography so type is always HTML
- Decide on reviews; wire sold-outs to da-restock
- Remove leftover WeChat/Vimeo remnants

## Gate status
**Not started, per the gate:** no hero, no homepage, no design system, no code.
**Next phase on approval:** Phase 1 — art direction and visual research (brand personality, photography/typography/colour direction, layout principles, image ratios, navigation character, product-grid treatment, interaction principles, mobile art direction, what to avoid; reference analysis; two genuinely distinct concepts; one recommendation).
