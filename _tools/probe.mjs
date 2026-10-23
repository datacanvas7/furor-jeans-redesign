import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../site');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.resolve(SITE, '.' + p);
    const data = fs.readFileSync(f);
    res.writeHead(200, { 'Content-Type': mime[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch (e) { res.writeHead(404); res.end('nf'); }
});
await new Promise(res => server.listen(8099, '127.0.0.1', res));

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
page.on('requestfailed', r => console.log('REQ FAIL:', r.url().slice(-60)));
page.on('response', r => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url().slice(-60)); });
await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle2' });
await page.evaluate(async () => { window.scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 1500)); window.scrollTo(0, 0); });
await new Promise(r => setTimeout(r, 1500));
const probe = await page.evaluate(() => {
  return [...document.querySelectorAll('[data-special-prices] img')].map(i => {
    const r = i.getBoundingClientRect();
    const cs = getComputedStyle(i);
    return { src: i.src.split('/').pop(), nw: i.naturalWidth, nh: i.naturalHeight, complete: i.complete, rect: [r.width | 0, r.height | 0], disp: cs.display, op: cs.opacity, vis: cs.visibility, objFit: cs.objectFit, currentSrc: i.currentSrc.split('/').pop() };
  });
});
console.log(JSON.stringify(probe, null, 1));
const el = await page.$('[data-special-prices]');
await el.screenshot({ path: '../_audit/shots/probe-special.png' });
await browser.close();
server.close();
