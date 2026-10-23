// FUROR redesign — data preparation.
// Reads the real Shopify products.json captured in Phase 0 and emits:
//   site/js/data.js                  — window.FUROR catalog (250 real products, compact)
//   _tmp-hires/download-manifest.json — list of {url, dest} product images to fetch locally
// Run via Qoder node-repl: await import('file:///…/_tools/prep-data.mjs')
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:/my-files/MY ETP FILES/Personal Documents/Roadmap_2025-26/Qoder-websites';
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, '_audit/products.json'), 'utf8'));
const ps = raw.products;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripHtml = h => String(h || '').replace(/<[^>]*>/g, '\n').split('\n').map(s => s.trim()).filter(Boolean);
const fnum = v => Math.round(parseFloat(v) * 100) / 100;

function sized(url, w) {
  // Shopify CDN transform: insert `_{w}x` before the file extension, keep query.
  if (!url) return url;
  const q = url.indexOf('?');
  const base = q === -1 ? url : url.slice(0, q);
  const query = q === -1 ? '' : url.slice(q);
  const dot = base.lastIndexOf('.');
  if (dot === -1) return url;
  return base.slice(0, dot) + '_' + w + 'x' + base.slice(dot) + query;
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
const sizeRank = s => {
  const i = SIZE_ORDER.indexOf(String(s).toUpperCase());
  if (i !== -1) return 100 + i;
  const n = parseFloat(s);
  return isNaN(n) ? 1000 : n;
};

const featured = new Map(); // handle -> {imgs: n} n = number of local images to fetch
const want = (p, n) => {
  if (!p) return;
  const cur = featured.get(p.handle);
  if (!cur || cur.imgs < n) featured.set(p.handle, { imgs: Math.max(n, p.images.length >= n ? n : p.images.length) });
};

// --- select featured sets (all real records) ---
const byCreated = [...ps].sort((a, b) => b.created_at.localeCompare(a.created_at));
const newArrivals = byCreated.slice(0, 8);
newArrivals.forEach(p => want(p, 1));

const withDiscount = ps
  .map(p => {
    const best = p.variants.reduce((m, v) => {
      if (v.compare_at_price && parseFloat(v.compare_at_price) > parseFloat(v.price)) {
        const d = (parseFloat(v.compare_at_price) - parseFloat(v.price)) / parseFloat(v.compare_at_price);
        return Math.max(m, d);
      }
      return m;
    }, 0);
    return { p, d: best };
  })
  .filter(x => x.d > 0)
  .sort((a, b) => b.d - a.d);
const specialPrices = withDiscount.slice(0, 4).map(x => x.p);
specialPrices.forEach(p => want(p, 1));

const denim = ps.filter(p => p.product_type === 'Men Denim Jeans');
const denimGrid = [...denim].sort((a, b) => Number(b.variants.some(v => v.available)) - Number(a.variants.some(v => v.available))).slice(0, 12);
denimGrid.forEach(p => want(p, 1));

// PDP candidate pinned deliberately: Loose Fit Jeans FMBP6-040 — 6 gallery images, on sale,
// and 5 of 6 sizes sold out, so variant states (available/sold-out) are honestly demonstrable.
const pdp = ps.find(p => p.handle === 'loose-fit-jeans-fmbp6-040');
want(pdp, Math.min(4, pdp.images.length));

const related = ps.filter(p => p.product_type === pdp.product_type && p.handle !== pdp.handle).slice(0, 4);
related.forEach(p => want(p, 1));

// tile-linked types: first 4 available each (real product_type strings present in the data)
const tileTypes = ['Men Shirts', 'Men Polo Shirts', 'Men Jogger Pants', 'Men Graphic Tees'];
const tilePicks = {};
for (const t of tileTypes) {
  const picks = ps.filter(p => p.product_type === t && p.variants.some(v => v.available)).slice(0, 4);
  tilePicks[t] = picks.map(p => p.handle);
  picks.forEach(p => want(p, 1));
}

// --- build compact records ---
const products = ps.map(p => {
  const optNames = (p.options || []).map(o => (o.name || '').toLowerCase());
  const sizeIdx = optNames.findIndex(n => /size/.test(n));
  const colIdx = optNames.findIndex(n => /colou?r/.test(n));

  const vs = p.variants.map(v => {
    const size = sizeIdx === -1 ? (colIdx === 0 ? null : v.option1) : v['option' + (sizeIdx + 1)];
    const color = colIdx === -1 ? null : v['option' + (colIdx + 1)];
    const o = { s: size, c: color, a: !!v.available, p: fnum(v.price) };
    if (v.compare_at_price && parseFloat(v.compare_at_price) > parseFloat(v.price)) o.cp = fnum(v.compare_at_price);
    return o;
  });

  const prices = vs.map(v => v.p);
  const price = Math.min(...prices);
  const compareAt = vs.reduce((m, v) => Math.max(m, v.cp || 0), 0) || null;
  const sizes = [...new Set(vs.map(v => v.s).filter(Boolean))].sort((a, b) => sizeRank(a) - sizeRank(b));
  const colors = [...new Set(vs.map(v => v.c).filter(Boolean))];
  const lines = stripHtml(p.body_html);
  const fit = (lines.find(l => /fit/i.test(l)) || '').replace(/men'?s|women'?s/i, '').trim() || null;
  const fabric = (lines.find(l => /material|fabric/i.test(l)) || '').replace(/material/i, '').trim() || null;
  const feat = featured.get(p.handle);

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    type: p.product_type,
    tags: p.tags,
    price,
    compareAt,
    onSale: !!(compareAt && compareAt > price),
    available: vs.some(v => v.a),
    sizes,
    colors,
    vs,
    img: feat ? `assets/products/${p.handle}_1.${ext(p.images[0].src)}` : sized(p.images[0].src, 600),
    imgs: p.images.map((im, i) => feat && i < feat.imgs
      ? `assets/products/${p.handle}_${i + 1}.${ext(im.src)}`
      : sized(im.src, 1200)),
    lines,
    fit,
    fabric,
    createdAt: p.created_at.slice(0, 10)
  };
});

function ext(url) { const m = /\.(jpg|jpeg|png|webp)/i.exec(url || ''); return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'webp'; }

// --- download manifest ---
const manifest = [];
for (const [handle, cfg] of featured) {
  const p = ps.find(x => x.handle === handle);
  if (!p) continue;
  for (let i = 0; i < Math.min(cfg.imgs, p.images.length); i++) {
    const src = p.images[i].src;
    manifest.push({ url: sized(src, i === 0 ? 800 : 1200), dest: `site/assets/products/${handle}_${i + 1}.${ext(src)}` });
  }
}

const out = `// FUROR storefront data — generated 2026-10-14 from furorjeans.com/products.json (page 1).
// ${products.length} real products. The live store serves 2,750+; this prototype ships the first 250.
// Prices in PKR. Images: local for featured sets, Shopify CDN (width-scaled) for the rest.
window.FUROR = ${JSON.stringify({
  generated: '2026-10-14',
  count: products.length,
  products
}, null, 0)};\n`;

fs.mkdirSync(path.join(ROOT, 'site/js'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'site/js/data.js'), out);
fs.writeFileSync(path.join(ROOT, '_tmp-hires/download-manifest.json'), JSON.stringify({
  pdp: pdp.handle,
  pdpTitle: pdp.title,
  pdpImages: pdp.images.length,
  newArrivals: newArrivals.map(p => p.handle),
  specialPrices: specialPrices.map(p => p.handle),
  tilePicks,
  files: manifest
}, null, 2));

nodeRepl.write({
  products: products.length,
  pdp: pdp.handle + ' — ' + pdp.title + ' (' + pdp.images.length + ' images)',
  featuredImages: manifest.length,
  newArrivals: newArrivals.length,
  specialPrices: specialPrices.length,
  denim: denim.length,
  onSale: products.filter(p => p.onSale).length,
  soldOut: products.filter(p => !p.available).length,
  types: [...new Set(products.map(p => p.type))].length
});
