/* FUROR prototype QA runner — real rendered checks via system Edge (headless).
   Serves nothing itself: expects http://127.0.0.1:8099 (node-repl static server). */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const SITE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../site');
const BASE = 'http://127.0.0.1:8099';
const SHOTS = path.join(path.dirname(fileURLToPath(import.meta.url)), '../_audit/shots');

/* self-contained static server for the site under test */
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.xml': 'text/xml', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.resolve(SITE, '.' + p);
    if (!f.startsWith(SITE)) { res.writeHead(403); res.end(); return; }
    const data = fs.readFileSync(f);
    res.writeHead(200, { 'Content-Type': mime[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch (e) { res.writeHead(404); res.end('not found'); }
});
await new Promise(res => server.listen(8099, '127.0.0.1', res));

const PAGES = [
  ['index.html', 'index'],
  ['collection.html?type=Men%20Denim%20Jeans', 'collection-denim'],
  ['collection.html?view=sale', 'collection-sale'],
  ['collection.html?view=proportions', 'collection-proportions'],
  ['collection.html?cat=Woman', 'collection-women'],
  ['collection.html?types=Men%20Shoes%2CMen%20Slides', 'collection-footwear'],
  ['product.html?handle=loose-fit-jeans-fmbp6-040', 'pdp'],
  ['search.html?q=polo', 'search'],
  ['search.html?q=zzzz', 'search-empty'],
];
const WIDTHS = [1440, 1280, 1024, 768, 390, 320];
const SHOT_PLAN = {
  index: [1440, 768, 390],
  'collection-denim': [1440, 390],
  'collection-sale': [1440],
  pdp: [1440, 390],
  search: [1440],
};

fs.mkdirSync(SHOTS, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--disable-gpu', '--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
});

const results = [];
let consoleErrTotal = 0;

for (const [pagePath, label] of PAGES) {
  const widths = SHOT_PLAN[label] ? WIDTHS.filter(w => SHOT_PLAN[label].includes(w)) : [1440, 390];
  for (const w of widths) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
    const consoleErrs = [];
    page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text().slice(0, 200)); });
    page.on('pageerror', e => consoleErrs.push('PAGEERROR ' + String(e).slice(0, 200)));
    const r = { page: pagePath, label, width: w, issues: [...consoleErrs.map(t => 'console: ' + t)] };
    consoleErrTotal += consoleErrs.length;
    try {
      await page.goto(`${BASE}/${pagePath}`, { waitUntil: 'networkidle2', timeout: 30000 });
      /* scroll through the page so lazy images enter the viewport and load */
      await page.evaluate(async () => {
        await new Promise(res => {
          let y = 0;
          const step = () => {
            y += 700;
            window.scrollTo(0, y);
            if (y < document.documentElement.scrollHeight) setTimeout(step, 60);
            else { window.scrollTo(0, 0); setTimeout(res, 400); }
          };
          step();
        });
      });
      await page.waitForFunction(
        () => [...document.images].every(i => i.complete),
        { timeout: 15000 }
      ).catch(() => {});
      await new Promise(res => setTimeout(res, 400));
      const checks = await page.evaluate((label) => {
        const issues = [];
        const push = m => issues.push(m);
        const overflowX = document.documentElement.scrollWidth - window.innerWidth;
        if (overflowX > 1) push(`horizontal overflow ${overflowX}px`);
        const h1s = [...document.querySelectorAll('h1')];
        if (!h1s.length) push('no h1 at all');
        const visH1 = h1s.filter(h => { const r = h.getBoundingClientRect(); return r.width > 2 && r.height > 2; });
        if (visH1.length > 1) push('duplicate visible h1s: ' + visH1.length);
        document.querySelectorAll('img').forEach(img => {
          if (!img.hasAttribute('alt')) push('img missing alt: ' + (img.getAttribute('src') || '').split('/').pop());
          if (img.complete && img.naturalWidth === 0 && !img.src.startsWith('data:')) push('broken img: ' + img.getAttribute('src'));
        });
        if (!document.querySelector('main')) push('no <main>');
        document.querySelectorAll('a[href="#"]').forEach(() => push('dead href="#"'));
        document.querySelectorAll('button').forEach(b => {
          if (!b.textContent.trim() && !b.getAttribute('aria-label')) push('unlabeled button');
        });
        if (label.startsWith('collection')) {
          const n = document.querySelectorAll('.card').length;
          if (window.innerWidth >= 1024 && !document.querySelector('[data-facets] .facet-group')) push('facets missing');
          if (label === 'collection-denim' && n < 4) push('denim cards: ' + n);
          if (label === 'collection-sale' && n < 4) push('sale cards: ' + n);
          if (label === 'collection-proportions' && n < 1) push('proportions selection empty');
        }
        if (label === 'pdp') {
          if (!document.querySelector('.gallery-main img')) push('gallery missing');
          const chips = document.querySelectorAll('[data-sizes] .opt-chip');
          if (!chips.length) push('size chips missing');
          if (!document.querySelectorAll('[data-sizes] .opt-chip[aria-disabled="true"]').length) push('no sold-out size states');
          if (!document.querySelector('.acc-item')) push('accordions missing');
          if (!document.querySelector('[data-related] .card')) push('related rail empty');
        }
        if (label === 'search' && !document.querySelector('[data-grid] .card')) push('search "polo" empty');
        if (label === 'search-empty') {
          const es = document.querySelector('[data-empty]');
          if (!es || es.hidden) push('empty state not shown');
        }
        if (label === 'index') {
          if (!document.querySelectorAll('[data-new-arrivals] .card').length) push('new arrivals grid empty');
          if (!document.querySelectorAll('[data-special-prices] .card').length) push('special prices grid empty');
          const desktop = getComputedStyle(document.querySelector('.hero-desktop')).display !== 'none';
          const mobile = getComputedStyle(document.querySelector('.hero-mobile')).display !== 'none';
          if (window.innerWidth > 768 && !desktop) push('desktop hero hidden >768px');
          if (window.innerWidth > 768 && mobile) push('mobile hero visible >768px');
          if (window.innerWidth <= 768 && desktop) push('desktop hero visible <=768px');
          if (window.innerWidth <= 768 && !mobile) push('mobile hero hidden <=768px');
        }
        return issues;
      }, label);
      r.issues.push(...checks);
      if (SHOTS && SHOT_PLAN[label] && SHOT_PLAN[label].includes(w)) {
        await page.screenshot({ path: path.join(SHOTS, `${label}-${w}.png`), fullPage: true });
      }
    } catch (e) {
      r.issues.push('FATAL: ' + String(e).slice(0, 300));
    }
    results.push(r);
    await page.close();
  }
}

await browser.close();
server.close();

const fails = results.filter(r => r.issues.length);
const out = [];
out.push(`SUITES ${results.length} · PASS ${results.length - fails.length} · FAIL ${fails.length} · console errors total ${consoleErrTotal}`);
for (const r of results) {
  out.push(`${r.issues.length ? 'FAIL' : 'pass'} ${r.label} @${r.width}`);
  r.issues.forEach(i => out.push('   - ' + i));
}
fs.writeFileSync(path.join(SHOTS, 'report.txt'), out.join('\n'));
console.log(out.join('\n'));
