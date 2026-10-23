# FUROR — Phase 1: Art Direction and Visual Research
**Date:** 2026-10-11 · **Status:** DELIVERED — awaiting approval (gate before Phase 2)

Grounded in: Phase 0 audit (`_audit/PHASE-0-AUDIT.md`), the actual downloaded campaign photography (`_audit/assets/`), the real 87-collection catalog (`_audit/collections.json`), and verified brand facts (est. 2017, Karachi → nationwide; mission *"defy the norms and celebrate individuality"*; name from *"furore"* — intense excitement; voice: *"Where ordinary becomes FUROR."*).

---

## 1. Brand personality

**FUROR is the uniform of Pakistan's restless generation.** Not luxury, not ethnic-wear heritage, not a discount bin — a youth-centric western-wear brand (median PKR 4,990) whose name literally means *intense excitement*.

Five personality anchors, all evidenced:
- **Defiant** — "defy the norms" is the stated mission. The design should break category conventions (which in PK e-commerce means: promo clutter on stock themes).
- **Energetic but disciplined** — drop-culture velocity (real language: "NEW KICKS / DROP '26") executed with grid discipline, not chaos.
- **Democratic** — mass-premium pricing, nationwide stores, BaadMay installments. Confidence without gatekeeping.
- **Karachi-born, nationwide** — urban energy, direct voice, no fake-British luxury affectation.
- **Fashion-literate** — the PROPORTIONS shoot proves the team can produce real editorial photography. The site must honour that standard, not drag it down.

## 2. Photography direction

Existing assets are better than the site suggests. The audit found five campaigns in five visual registers; the direction is to **unify the register, not flatten the work**:

- **Campaign imagery** (PROPORTIONS, NEW KICKS, Winter, licensed capsules): full-bleed editorial moments. **Type is never burned in again** — masters must be text-free so live HTML type sits in real negative space (PROPORTIONS' left third is genuinely empty and stays empty at 21:9).
- **Product imagery**: keep the current neutral seamless (warm beige/grey studio), but mandate **one consistent background tone and one crop (3:4)** across the catalog so grids read as one system. This is a governance request to the photography team, documented as a gap, not assumed fixed.
- **Hero selection**: PROPORTIONS (`hero2.webp`) is the anchor asset — warm architecture, model right, usable negative space left, ties to a **real shoppable collection** (`PROPORTIONS` in `collections.json`).
- **Every campaign ships two crops**: 21:9 (desktop) + 4:5 (mobile), per campaign. Mobile crops already exist for current campaigns; mandate continues.
- No stock photography, ever. If a campaign asset is missing, the gap is flagged and a clearly-labelled temporary asset is used — never passed off as FUROR photography.

## 3. Typography direction

The wordmark is a heavy geometric sans with diagonal cuts. The type system should feel like it came from the same hand.

- **Display:** **Archivo** (Google Fonts, OFL) — variable, with Expanded and Black widths. It carries campaign headlines at 60–120px, left-aligned, sentence case or caps with tight tracking. It rhymes with the logo's industrial geometry without imitating it.
- **Text / UI:** **Inter** (Google Fonts, OFL) — 13–16px, sizes the whole store's UI. Neutral, excellent at small sizes, huge glyph coverage.
- **Micro-labels (Concept A signature):** **Space Mono** (Google Fonts, OFL) — 11–12px for prices, filter counts, product codes, size runs. Gives the catalog a technical, instrument-like voice and aligns figures in columns.
- **Editorial accent (Concept B signature):** **Fraunces** (Google Fonts, OFL) — used for campaign pull-quotes and story headlines only, never for UI or prices.
- One scale, applied everywhere (8pt grid): 11 / 12 / 13 / 15 / 18 / 24 / 32 / 48 / 64 / 96. No more five conflicting campaign type treatments.

## 4. Color palette

The current palette (#151515 / #fff / #E04129 / #FF0000) is thin and the pure red is unmanaged. Extension, not reinvention:

| Token | Hex | Use |
|---|---|---|
| Ink | `#141414` | Primary text, dark sections, footer |
| Paper | `#F4F0E9` | Site background — warm bone, matches PROPORTIONS set and product seamless |
| Surface | `#FFFFFF` | Menus, drawers, and product-focus moments only — never as section cards |
| Hairline | `#E3DDD2` | Borders, dividers on Paper |
| Text-muted | `#6B675F` | Secondary text (contrast to be measured in Phase 3) |
| Signal Red | `#E04129` | The one accent: sale states, badges, primary CTA hover, active filters |
| Signal Deep | `#B02E1C` | Red for text-on-light where `#E04129` fails AA (ratios verified in Phase 3) |
| Denim | `#2E4A6B` | Optional support for fit/utility tags — a nod to the category |

Rules: one accent, never two; promo chrome uses Signal Red, catalog chrome stays neutral; dark sections (footer, select campaign breaks) invert to Ink with Paper type. No gold, no gradients, no pure #FF0000.

## 5. Layout principles

- 12-column grid; 1280px max content width; 24px gutters; 64–96px section rhythm.
- **Campaigns break the grid; commerce sits inside it.** Full-bleed photography is the change-of-pace; product grids are perfectly aligned, never decorated.
- Hierarchy from type size/weight contrast and spacing — never from cards, shadows, or badges.
- Page rhythm alternates density and air like a lookbook: hero (air) → category rail (density) → product grid (density) → campaign break (air) → story/service (calm). Rhythm comes from spacing and background tone shifts (Paper ↔ Ink), not boxes.
- Left-aligned as default. Centre only for deliberate, rare moments.

## 6. Image ratios

| Slot | Ratio | Notes |
|---|---|---|
| Hero, desktop | 21:9 full-bleed (~1920×900) | Matches existing asset; type in negative space, no scrim |
| Hero, mobile | 4:5 portrait | Separate crop per campaign; type below image or in clear zone |
| Product card | 3:4 | Fixed-ratio slot (zero CLS); consistent seamless tone |
| Category tile | 4:5 | Model-forward crops; label as HTML chip, not burned-in |
| Campaign/editorial | 21:9 or 16:9; 4:5 mobile | |
| PDP gallery | 3:4 primary; thumbs 1:1 | |

## 7. Navigation character

Grounded in the real catalog (Men / Women, both with Tops, Bottoms, Outerwear, Footwear, Accessories; campaign capsules incl. PROPORTIONS; universal New Arrivals / Best Sellers / Sale).

- **Slim sticky header** (64px desktop) replacing the absolute, non-sticky bar. Announcement bar sits above it, separate, single message, dismissible.
- Desktop dropdowns for Men and Women mirror the actual collection tree (Tops → Tees · Polos · Casual Shirts · Hoodies · Sweatshirts…; Bottoms → Jeans · Chinos · Joggers · Tailored…), plus a campaign slot for active capsules.
- Right cluster: search (prominent input on wide screens, icon below 1024px), account, bag with count.
- **Sale is styled, not shouted**: Signal Red text, no blink, no emoji, one sale story at a time sitewide.
- Mobile: full-screen overlay menu, accordion category tree, large touch targets; sticky add-to-cart lives on PDP, not in the header.

## 8. Product-grid treatment

- **4 columns desktop / 2 columns mobile** (1024px: 3), 3:4 images, fixed-ratio slots.
- Card anatomy: image → name (one line, ellipsized) → price + compare-at when discounted → state chip (SALE −n% / SOLD OUT) → hover reveals size run + quick-add.
- Prices in Space Mono (Concept A) so columns align; BaadMay installment line under price where the real integration applies.
- No card borders, no shadows, no rounding on product tiles — separation by whitespace and hairlines only.
- Grid sections get a real header: 24–32px display line + a "View all" text link, not a decorative banner.

## 9. Interaction principles

- Motion is feedback, not decoration: 150–250ms ease-out; drawers slide; images crossfade on hover; buttons invert. Nothing else by default.
- **No auto-rotating hero.** One campaign, one message. Countdown only while a sale is genuinely live.
- Everything must work with `prefers-reduced-motion` and with animations off — composition first.
- Buttons are sharp rectangles (2px radius max), solid Ink or Signal Red — never pill pairs.
- Hover states reveal commerce (sizes, quick-add); they never hide information.

## 10. Mobile art direction

- Designed at 390px, verified at 320–768px (Phase 2 validates the hero at 320/390/768/1024/1280/1440).
- Hero: 4:5 image, type left-aligned below or in the image's clear zone; CTA within thumb reach; header collapses to logo + search + bag.
- Product grids: 2 columns, 3:4, same card anatomy; quick-add via tap, not hover.
- Filters open as bottom sheet; size selector is a full-width row of tappable chips.
- Performance is a mobile feature: first grid row eager, rest lazy; no CLS from ratio shifts; target hero LCP < 2.5s on 4G.

## 11. What the design deliberately avoids

From the anti-slop manifesto + Phase 0 findings, the standing ban list: centered generic heroes; pill button pairs; gradient overlays and scrims on photography; burned-in typography; auto-playing carousels; emoji in commerce chrome; card-everywhere section styling; decorative badges and shadows; fake-luxury serifs/gold/thin borders; "Elevate your everyday" filler copy; stock imagery; decorative non-functional controls; #FF0000; the word "UPTO".

## 12. Reference analysis

| Reference | Principle to learn | Why relevant to FUROR |
|---|---|---|
| **SSENSE** | The grid IS the brand: minimal chrome, dense product, micro-labels | FUROR has 2,750 products and constant promos — density handled with discipline reads premium where decoration would read cheap |
| **END. Clothing** | Drop-culture merchandising, bold display type, sneaker energy | FUROR already speaks this language ("NEW KICKS / DROP '26", licensed capsules) — a native fit, not an affectation |
| **Jacquemus** | Warm architectural sets, negative space, proportion play | PROPORTIONS already exists in this register — the photography budget and eye are there; the site just doesn't honour it |
| **Carhartt WIP** | Workwear catalog clarity: functional type, honest product info | Denim/workwear utility heritage; supports the size-run, fit-data, mono-label treatment |
| **Local peers** (Outfitters on stock Dawn theme; promo-led category norms) | The market default is undifferentiated | Verified differentiation opportunity: a disciplined art-directed flagship stands out in PK youth e-commerce almost by default |

No reference is copied; each contributes one principle the audit shows FUROR needs.

---

## 13. Two concepts

### Concept A — "SIGNAL" (recommended)
The denim utility standard. Sharp, fast, catalog-dense.
- **Composition:** left-aligned type in real negative space; hard-edged promo strips; strict 12-col commerce grid.
- **Typography:** Archivo Expanded/Black display + Inter UI + Space Mono micro-labels and prices.
- **Imagery:** PROPORTIONS anchor; NEW KICKS energy for footwear capsules; clean seamless product shots.
- **Color:** Paper ground, Ink type, Signal Red as the single loud voice.
- **Character:** the best-run denim catalog in Pakistan with drop-culture signal — survives daily promos and 2,750 SKUs without visual decay.

### Concept B — "FURORE"
The warm editorial lookbook. Slower, bigger, magazine-like.
- **Composition:** full-bleed campaign spreads, oversized whitespace, 3-column loose product grid, overlay menu navigation.
- **Typography:** Fraunces display serif for campaign headlines/pull-quotes + Inter UI.
- **Imagery:** PROPORTIONS and Winter campaigns as lookbook spreads with shop-the-look storytelling.
- **Color:** Ink-forward with cream; red-orange sparing and warm.
- **Character:** FUROR as a fashion annual — beautiful, but it needs museum-like air and constant high-production assets, and it fights the discount-driven PLP/PDP reality the business actually runs.

The concepts differ in composition, typography, imagery, density, and character — not background colour.

## 14. Recommendation

**Proceed with Concept A — SIGNAL.** Strongest fit because:
1. **It matches the verified brand** — "defy the norms", drop language, youth utility. B's quiet register contradicts "furore = intense excitement".
2. **The catalog is the business.** Median PKR 4,990, constant sales, BaadMay installments: a system that makes dense merchandising look disciplined beats one that needs editorial air to survive.
3. **The assets already support it.** PROPORTIONS' negative space, NEW KICKS' saturation, the seamless product studio — all native to A.
4. **It is performance-resilient.** Bone/ink/red with grotesque type is lightweight, CLS-safe, and fully tokenisable in CSS.
5. **Differentiation is nearly free.** No PK peer runs a disciplined utility-editorial system; the category bar is low.

B is not discarded — its one true instinct (campaigns deserve breathing room) becomes a rule inside A: **campaign sections get air, commerce sections get density.** A is the system; B's instinct is the seasoning.

## 15. Unresolved issues
- **Product-image consistency** beyond the sample tiles is unverified — full-catalog crop/background audit happens when the first real product grid is built (Phase 4C).
- **PROPORTIONS mobile crop (4:5)** must be confirmed from existing CDN assets or requested; if absent, a clearly-labelled temporary crop is used and flagged.
- **Accent text contrast** (Signal Red variants) will be measured, not assumed, in Phase 3.
- **Sale governance** is a business decision: design provides slots for one active sale story; marketing must stop running three at once.
- **Reviews**: no app installed — remains a Phase 5 business decision (documented in Phase 0, P2).

## 16. Next phase (on approval)
**Phase 2 — Responsive hero:** build only the hero + minimal supporting header. PROPORTIONS anchor asset, 21:9 desktop / 4:5 mobile, left-aligned live-HTML type, no scrim, sticky slim header — validated at 1440 / 1280 / 1024 / 768 / 390 / 320.
