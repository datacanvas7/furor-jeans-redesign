/* FUROR product detail — gallery, variant chips, accordions, related rail */
(function () {
  'use strict';
  var D = window.FUROR || { products: [] };
  var UI = window.FUROR_UI;
  if (!UI) return;

  var qs = function (s, r) { return (r || document).querySelector(s); };
  var qsa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = UI.esc, money = UI.money;

  var handle = new URLSearchParams(location.search).get('handle');
  var p = UI.byHandle.get(handle) || D.products[0];
  if (!p) return;

  document.title = p.title + ' — FUROR Prototype';

  /* ---------- breadcrumbs ---------- */
  var crumbs = qs('[data-crumbs]');
  if (crumbs) {
    crumbs.innerHTML = '<a href="index.html">Home</a> <span aria-hidden="true">/</span> ' +
      '<a href="collection.html?type=' + encodeURIComponent(p.type) + '">' + esc(p.type) + '</a> <span aria-hidden="true">/</span> <span>' + esc(p.title) + '</span>';
  }

  /* ---------- gallery ---------- */
  var imgs = (p.imgs && p.imgs.length ? p.imgs : [p.img]);
  var gal = qs('[data-gallery]');
  gal.innerHTML =
    '<div class="gallery-main"><img src="' + esc(imgs[0]) + '" alt="' + esc(p.title) + '" width="900" height="1200"></div>' +
    '<div class="gallery-thumbs">' + imgs.map(function (src, i) {
      return '<button type="button" data-thumb="' + i + '" aria-current="' + (i === 0) + '" aria-label="Image ' + (i + 1) + ' of ' + imgs.length + '">' +
        '<img src="' + esc(src) + '" alt="" loading="lazy"></button>';
    }).join('') + '</div>';
  gal.addEventListener('click', function (e) {
    var b = e.target.closest('[data-thumb]');
    if (!b) return;
    var i = Number(b.getAttribute('data-thumb'));
    qs('.gallery-main img', gal).src = imgs[i];
    qsa('[data-thumb]', gal).forEach(function (t) { t.setAttribute('aria-current', String(t === b)); });
  });

  /* ---------- variant state ---------- */
  var colors = p.colors || [];
  var state = { size: null, color: colors[0] || null };
  function variantsFor(size, color) {
    return (p.vs || []).filter(function (v) {
      return (!size || v.s === size) && (!color || v.c === color);
    });
  }
  function sizeAvailable(size) {
    return variantsFor(size, state.color).some(function (v) { return v.a; });
  }

  /* ---------- info column ---------- */
  var off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
  var info = qs('[data-info]');
  info.innerHTML =
    '<p class="pdp-type">' + esc(p.type) + '</p>' +
    '<h1 class="pdp-title">' + esc(p.title) + '</h1>' +
    '<p class="pdp-price"><span class="now">' + money(p.price) + '</span>' +
    (p.compareAt ? '<span class="was">' + money(p.compareAt) + '</span><span class="save">Save ' + off + '%</span>' : '') + '</p>' +
    '<p class="pdp-installments">Installment options via BaadMay appear at checkout on the live store.</p>' +
    (colors.length > 1
      ? '<div class="opt-block"><div class="opt-label"><span class="lbl">Color</span><span class="sel" data-color-label>' + esc(state.color) + '</span></div>' +
        '<div class="opt-chips" data-colors>' + colors.map(function (c, i) {
          return '<button type="button" class="opt-chip" data-color="' + esc(c) + '" aria-pressed="' + (i === 0) + '">' + esc(c) + '</button>';
        }).join('') + '</div></div>'
      : '') +
    '<div class="opt-block"><div class="opt-label"><span class="lbl">Size</span><span class="sel" data-size-label>Select a size</span></div>' +
    '<div class="opt-chips" data-sizes></div>' +
    '<p class="opt-hint" data-size-hint></p></div>' +
    '<div class="pdp-ctas">' +
    '<button type="button" class="btn btn-ink btn-block" data-atb>Add to bag</button>' +
    '<a class="btn btn-paper btn-block" href="https://furorjeans.com/products/' + encodeURIComponent(p.handle) + '" target="_blank" rel="noopener">View on the live store</a>' +
    '</div>' +
    '<div class="pdp-meta">' +
    '<span>SKU ' + esc(p.handle.toUpperCase()) + '</span>' +
    '<span>Availability shown per size — from the live catalog export.</span>' +
    '</div>' +
    '<div class="acc" data-acc></div>';

  function renderSizes() {
    var host = qs('[data-sizes]');
    var label = qs('[data-size-label]');
    var hint = qs('[data-size-hint]');
    var availCount = 0;
    host.innerHTML = (p.sizes || []).map(function (s) {
      var ok = sizeAvailable(s);
      if (ok) availCount++;
      var sel = state.size === s;
      return '<button type="button" class="opt-chip" data-size="' + esc(s) + '" aria-pressed="' + sel + '"' + (ok ? '' : ' aria-disabled="true"') + '>' + esc(s) + '</button>';
    }).join('');
    label.textContent = state.size ? 'Size ' + state.size : 'Select a size';
    hint.textContent = state.size ? '' : (availCount ? 'Pick a size — ' + availCount + ' of ' + (p.sizes || []).length + ' available in ' + (state.color || 'this color') : 'Sold out in ' + (state.color || 'this color'));
  }
  renderSizes();

  info.addEventListener('click', function (e) {
    var c = e.target.closest('[data-color]');
    if (c) {
      state.color = c.getAttribute('data-color');
      var curSize = state.size;
      if (curSize && !sizeAvailable(curSize)) state.size = null;
      qs('[data-color-label]').textContent = state.color;
      qsa('[data-color]', info).forEach(function (b) { b.setAttribute('aria-pressed', String(b === c)); });
      renderSizes();
      return;
    }
    var s = e.target.closest('[data-size]');
    if (s && s.getAttribute('aria-disabled') !== 'true') {
      state.size = s.getAttribute('data-size');
      qsa('[data-size]', info).forEach(function (b) { b.setAttribute('aria-pressed', String(b === s)); });
      renderSizes();
      return;
    }
    if (e.target.closest('[data-atb]')) {
      if (!state.size) {
        qs('[data-size-hint]').textContent = 'Select a size first — tap an available size above.';
        var first = qs('[data-sizes] .opt-chip:not([aria-disabled="true"])');
        if (first) first.focus();
        return;
      }
      UI.cartAdd(p.handle, state.size, state.color, 1);
      UI.toast('Added to bag — ' + p.title + ' · Size ' + state.size);
      UI.openCart();
      return;
    }
    var acc = e.target.closest('.acc-trigger');
    if (acc) {
      var panel = acc.nextElementSibling;
      var open = acc.getAttribute('aria-expanded') === 'true';
      acc.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('open', !open);
    }
  });

  /* ---------- accordions from real product fields ---------- */
  var groups = [];
  if (p.fit && p.fit.length <= 60) groups.push({ t: 'Fit', body: '<p>' + esc(p.fit) + '</p>' });
  if (p.fabric && p.fabric.length <= 60) groups.push({ t: 'Fabric', body: '<p>' + esc(p.fabric) + '</p>' });
  if (p.lines && p.lines.length) {
    var items = [], i = 0;
    while (i < p.lines.length) {
      var k = p.lines[i], v = p.lines[i + 1];
      if (v != null && String(k).slice(-1) === ':' && String(v).slice(-1) !== ':') { items.push([k, v]); i += 2; }
      else { items.push([null, k]); i += 1; }
    }
    groups.push({
      t: 'Details & measurements',
      body: '<ul>' + items.map(function (kv) {
        return '<li>' + (kv[0] ? '<strong>' + esc(kv[0]) + '</strong> ' : '') + esc(kv[1]);
      }).join('') + '</ul>'
    });
  }
  groups.push({
    t: 'Shipping & exchanges',
    body: '<p>Nationwide delivery — see the <a href="https://furorjeans.com/policies/shipping-policy" target="_blank" rel="noopener">shipping policy</a>. ' +
      'In-store exchange nationwide — see the <a href="https://furorjeans.com/policies/refund-policy" target="_blank" rel="noopener">exchange &amp; refund policy</a> on the live store.</p>'
  });
  qs('[data-acc]').innerHTML = groups.map(function (g, idx) {
    return '<div class="acc-item"><h2><button type="button" class="acc-trigger" aria-expanded="' + (idx === 0) + '">' + esc(g.t) +
      '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5"/></svg>' +
      '</button></h2><div class="acc-panel' + (idx === 0 ? ' open' : '') + '">' + g.body + '</div></div>';
  }).join('');

  /* ---------- JSON-LD ---------- */
  var ld = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.title, image: imgs, description: p.type + (p.fit ? ' — ' + p.fit : ''),
    brand: { '@type': 'Brand', name: 'FUROR' },
    offers: {
      '@type': 'Offer', priceCurrency: 'PKR', price: p.price,
      availability: p.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: 'https://furorjeans.com/products/' + p.handle
    }
  };
  var s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);

  /* ---------- related rail ---------- */
  var related = D.products.filter(function (x) { return x.handle !== p.handle && x.type === p.type; }).slice(0, 4);
  if (related.length < 4) {
    var extra = D.products.filter(function (x) { return x.handle !== p.handle && x.type !== p.type && related.indexOf(x) === -1; });
    related = related.concat(extra).slice(0, 4);
  }
  qs('[data-related]').innerHTML = related.map(function (x) { return UI.card(x); }).join('');
})();
