/* Renders the 3-slide Instagram carousel at exact 1080x1350 via headless Edge. */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLS, '..');
const OUT = path.join(ROOT, '_design/instagram');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 8098;

const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.resolve(ROOT, '.' + p);
    if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    const data = fs.readFileSync(f);
    res.writeHead(200, { 'Content-Type': mime[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch (e) { res.writeHead(404); res.end('not found'); }
});
await new Promise(r => server.listen(PORT, '127.0.0.1', r));

const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--hide-scrollbars', '--font-render-hinting=none'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 1400, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${PORT}/_design/instagram/carousel.html`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0), { timeout: 20000 });

for (let n = 1; n <= 3; n++) {
  const el = await page.$('#slide-' + n);
  const file = path.join(OUT, `slide-${n}.png`);
  await el.screenshot({ path: file });
  const { width, height } = await el.boundingBox();
  console.log(`slide-${n}.png  ${width}x${height}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}

await browser.close();
server.close();
console.log('done');
