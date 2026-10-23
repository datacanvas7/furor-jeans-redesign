/* Generates a production sitemap draft for furorjeans.com from the real catalog export.
   Output: _design/launch/sitemap.xml — a launch-prep artifact, NOT served by the prototype. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const raw = fs.readFileSync(path.join(root, 'site/js/data.js'), 'utf8')
  .replace(/^[^=]*=/, '').replace(/;\s*$/, '');
const data = JSON.parse(raw);

const LIVE = 'https://furorjeans.com';
const urls = [];
const add = (loc, prio, changefreq) => urls.push({ loc, prio, changefreq });

add(LIVE + '/', '1.0', 'daily');
/* collections verified live during the Phase 0 audit */
['men-denim-jeans', 'proportions-wide-leg', 'special-price', 'sale', 'women'].forEach(h =>
  add(`${LIVE}/collections/${h}`, '0.8', 'daily'));
/* product handles come from the live store's own products.json export */
data.products.forEach(p => add(`${LIVE}/products/${p.handle}`, '0.7', 'weekly'));
/* verified static pages */
['about-us', 'faqs', 'store-locator'].forEach(h => add(`${LIVE}/pages/${h}`, '0.5', 'monthly'));
['refund-policy', 'shipping-policy', 'privacy-policy'].forEach(h => add(`${LIVE}/policies/${h}`, '0.3', 'yearly'));

const today = new Date().toISOString().slice(0, 10);
const xml = ['<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.prio}</priority></url>`),
  '</urlset>', ''].join('\n');

const out = path.join(root, '_design/launch/sitemap.xml');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, xml);
console.log('wrote ' + out + ' with ' + urls.length + ' urls');
