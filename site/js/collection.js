/* FUROR collection page — scope from URL params, facets, sort, load-more */
(function () {
  'use strict';
  var D = window.FUROR || { products: [] };
  var UI = window.FUROR_UI;
  if (!UI) return;

  var qs = function (s, r) { return (r || document).querySelector(s); };
  var qsa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- scope from URL ---------- */
  var params = new URLSearchParams(location.search);
  var scope = { kind: 'all', title: 'Shop all', note: null };

  if (params.get('view') === 'new') {
    scope = { kind: 'new', title: 'New In', note: 'The latest 250-product export from the live catalog, newest first.' };
  } else if (params.get('view') === 'sale') {
    scope = { kind: 'sale', title: 'Sale', note: 'Every marked-down product in the current data export.' };
  } else if (params.get('view') === 'proportions') {
    scope = { kind: 'proportions', title: 'Proportions', note: 'Campaign selection — wide-leg, loose, relaxed and baggy fits from the live denim range.' };
  } else if (params.get('types')) {
    var tl = params.get('types').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    scope = { kind: 'types', types: tl, title: tl.join(' & ') };
  } else if (params.get('type')) {
    scope = { kind: 'type', type: params.get('type'), title: params.get('type') };
  } else if (params.get('cat')) {
    scope = { kind: 'cat', cat: params.get('cat'), title: params.get('cat') === 'Woman' ? 'Women' : params.get('cat') };
  }

  function scoped(list) {
    if (scope.kind === 'new') return list.slice().sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });
    if (scope.kind === 'sale') return list.filter(function (p) { return p.onSale; });
    if (scope.kind === 'proportions') return list.filter(function (p) { return /wide|loose|relaxed|baggy|gurkha/i.test(p.title); });
    if (scope.kind === 'types') return list.filter(function (p) { return scope.types.indexOf(p.type) !== -1; });
    if (scope.kind === 'type') return list.filter(function (p) { return p.type === scope.type; });
    if (scope.kind === 'cat') {
      var w = scope.cat === 'Woman';
      return list.filter(function (p) { return w ? p.type.indexOf('Woman') === 0 : p.type.indexOf('Men') === 0 || p.type === 'Bags'; });
    }
    return list.slice();
  }

  document.title = scope.title + ' — FUROR Prototype';
  var titleEl = qs('[data-plp-title]');
  if (titleEl) titleEl.textContent = scope.title;
  var crumb = qs('[data-crumb]');
  if (crumb) crumb.textContent = scope.title;

  /* ---------- filter state ---------- */
  var state = {
    size: (params.get('size') || '').split(',').filter(Boolean),
    color: (params.get('color') || '').split(',').filter(Boolean),
    fit: (params.get('fit') || '').split(',').filter(Boolean),
    fabric: (params.get('fabric') || '').split(',').filter(Boolean),
    price: (params.get('price') || '').split(',').filter(Boolean),
    sale: params.get('sale') === '1',
    sort: params.get('sort') || 'featured',
    page: 1
  };
  var PER_PAGE = 12;
  var PRICE_BUCKETS = [
    { id: 'u2000', label: 'Under Rs 2,000', test: function (p) { return p.price < 2000; } },
    { id: 'm2000', label: 'Rs 2,000 – 4,999', test: function (p) { return p.price >= 2000 && p.price < 5000; } },
    { id: 'm5000', label: 'Rs 5,000 – 7,999', test: function (p) { return p.price >= 5000 && p.price < 8000; } },
    { id: 'p8000', label: 'Rs 8,000+', test: function (p) { return p.price >= 8000; } }
  ];

  var base = scoped(D.products);

  /* facet option values derived from the scoped products */
  function facetValues(key) {
    var map = {}, out = [];
    base.forEach(function (p) {
      var vals = [];
      if (key === 'size') vals = p.sizes || [];
      else if (key === 'color') vals = p.colors || [];
      else if (key === 'fit') vals = (p.fit && p.fit.length <= 20 && p.fit.indexOf(':') === -1) ? [p.fit] : [];
      else if (key === 'fabric') vals = (p.fabric && p.fabric.length <= 24 && p.fabric.indexOf(':') === -1 && p.fabric.trim().length > 2) ? [p.fabric] : [];
      vals.forEach(function (v) { if (!map[v]) { map[v] = true; out.push(v); } });
    });
    return out.sort();
  }

  function renderFacets() {
    var host = qs('[data-facets]');
    if (!host) return;
    var groups = [
      { key: 'size', label: 'Size', values: facetValues('size') },
      { key: 'color', label: 'Color', values: facetValues('color') },
      { key: 'fit', label: 'Fit', values: facetValues('fit') },
      { key: 'fabric', label: 'Fabric', values: facetValues('fabric') }
    ];
    var html = groups.map(function (g) {
      if (!g.values.length) return '';
      var chips = g.values.map(function (v) {
        var on = state[g.key].indexOf(v) !== -1;
        return '<button type="button" class="facet-chip" data-facet="' + g.key + '" data-value="' + UI.esc(v) + '" aria-pressed="' + on + '">' + UI.esc(v) + '</button>';
      }).join('');
      return '<div class="facet-group"><h2>' + g.label + '</h2><div class="facet-opts">' + chips + '</div></div>';
    }).join('');
    var priceChips = PRICE_BUCKETS.map(function (b) {
      var on = state.price.indexOf(b.id) !== -1;
      return '<button type="button" class="facet-chip" data-facet="price" data-value="' + b.id + '" aria-pressed="' + on + '">' + b.label + '</button>';
    }).join('');
    html += '<div class="facet-group"><h2>Price</h2><div class="facet-opts">' + priceChips + '</div></div>';
    html += '<div class="facet-group"><h2>Offers</h2>' +
      '<label class="facet-check"><input type="checkbox" data-facet="sale" ' + (state.sale ? 'checked' : '') + '> On sale only</label>' +
      '</div>';
    host.innerHTML = html;
  }

  /* ---------- filtering + sorting ---------- */
  function applyFilters(list) {
    return list.filter(function (p) {
      if (state.sale && !p.onSale) return false;
      if (state.size.length && !(p.sizes || []).some(function (s) { return state.size.indexOf(s) !== -1; })) return false;
      if (state.color.length && !(p.colors || []).some(function (c) { return state.color.indexOf(c) !== -1; })) return false;
      if (state.fit.length && state.fit.indexOf(p.fit) === -1) return false;
      if (state.fabric.length && state.fabric.indexOf(p.fabric) === -1) return false;
      if (state.price.length) {
        var ok = state.price.some(function (id) {
          var b = PRICE_BUCKETS.filter(function (x) { return x.id === id; })[0];
          return b && b.test(p);
        });
        if (!ok) return false;
      }
      return true;
    });
  }
  function applySort(list) {
    var l = list.slice();
    if (state.sort === 'price-asc') l.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === 'price-desc') l.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === 'new') l.sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });
    else if (state.sort === 'discount') l.sort(function (a, b) {
      var da = a.compareAt ? 1 - a.price / a.compareAt : 0, db = b.compareAt ? 1 - b.price / b.compareAt : 0;
      return db - da;
    });
    else l.sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });
    return l;
  }

  var filtered = [];
  function render() {
    filtered = applySort(applyFilters(base));
    var grid = qs('[data-grid]');
    var empty = qs('[data-empty]');
    var moreWrap = qs('[data-more-wrap]');
    var shown = filtered.slice(0, state.page * PER_PAGE);
    grid.innerHTML = shown.map(function (p) { return UI.card(p); }).join('');
    empty.hidden = filtered.length > 0;
    grid.hidden = filtered.length === 0;
    moreWrap.style.display = filtered.length > shown.length ? '' : 'none';
    var mc = qs('[data-more-count]');
    if (mc) mc.textContent = 'Showing ' + shown.length + ' of ' + filtered.length;
    var countEl = qs('[data-count]');
    if (countEl) countEl.textContent = filtered.length + ' product' + (filtered.length === 1 ? '' : 's') + (scope.note ? ' · ' + scope.note : '');
    renderChips();
    syncURL();
  }

  function renderChips() {
    var host = qs('[data-chips]');
    if (!host) return;
    var chips = [];
    function add(key, label) {
      chips.push('<span class="af-chip">' + UI.esc(label) +
        '<button type="button" data-unfacet="' + key + '" aria-label="Remove filter ' + UI.esc(label) + '">' +
        '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.4"/></svg>' +
        '</button></span>');
    }
    state.size.forEach(function (v) { add('size:' + v, 'Size ' + v); });
    state.color.forEach(function (v) { add('color:' + v, v); });
    state.fit.forEach(function (v) { add('fit:' + v, v); });
    state.fabric.forEach(function (v) { add('fabric:' + v, v); });
    state.price.forEach(function (id) {
      var b = PRICE_BUCKETS.filter(function (x) { return x.id === id; })[0];
      if (b) add('price:' + id, b.label);
    });
    if (state.sale) add('sale', 'On sale');
    host.innerHTML = chips.length
      ? chips.join('') + '<button type="button" class="af-chip" data-unfacet="all">Clear all</button>'
      : '';
  }

  function syncURL() {
    var p = new URLSearchParams(location.search);
    ['size', 'color', 'fit', 'fabric', 'price'].forEach(function (k) {
      if (state[k].length) p.set(k, state[k].join(',')); else p.delete(k);
    });
    if (state.sale) p.set('sale', '1'); else p.delete('sale');
    if (state.sort !== 'featured') p.set('sort', state.sort); else p.delete('sort');
    var url = location.pathname + (p.toString() ? '?' + p.toString() : '');
    history.replaceState(null, '', url);
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var chip = e.target.closest('.facet-chip');
    if (chip) {
      var key = chip.getAttribute('data-facet'), val = chip.getAttribute('data-value');
      var i = state[key].indexOf(val);
      if (i === -1) state[key].push(val); else state[key].splice(i, 1);
      state.page = 1;
      renderFacets(); render(); syncSheet();
      return;
    }
    var un = e.target.closest('[data-unfacet]');
    if (un) {
      var what = un.getAttribute('data-unfacet');
      if (what === 'all') {
        state.size = []; state.color = []; state.fit = []; state.fabric = []; state.price = []; state.sale = false;
      } else {
        var parts = what.split(':'), k = parts[0], v = parts.slice(1).join(':');
        if (k === 'sale') state.sale = false;
        else { var j = state[k].indexOf(v); if (j !== -1) state[k].splice(j, 1); }
      }
      state.page = 1;
      renderFacets(); render();
      return;
    }
    if (e.target.closest('[data-clear-all]')) {
      state.size = []; state.color = []; state.fit = []; state.fabric = []; state.price = []; state.sale = false;
      state.page = 1;
      renderFacets(); render();
      return;
    }
    if (e.target.closest('[data-more]')) { state.page += 1; render(); return; }
    if (e.target.closest('[data-open-filters]')) { openSheet(); return; }
    if (e.target.closest('[data-close-filters]')) { closeSheet(); return; }
  });
  document.addEventListener('change', function (e) {
    var cb = e.target.closest('input[data-facet="sale"]');
    if (cb) { state.sale = cb.checked; state.page = 1; renderFacets(); render(); syncSheet(); }
  });
  var sortSel = qs('[data-sort]');
  if (sortSel) {
    sortSel.value = state.sort;
    sortSel.addEventListener('change', function () { state.sort = sortSel.value; state.page = 1; render(); });
  }

  /* ---------- mobile filter sheet ---------- */
  var sheet = null, sheetScrim = null;
  function syncSheet() {
    if (sheet) qs('[data-sheet-facets]', sheet).innerHTML = qs('[data-facets]').innerHTML;
  }
  function openSheet() {
    if (!sheet) {
      sheetScrim = document.createElement('div');
      sheetScrim.className = 'scrim';
      sheetScrim.setAttribute('data-close-filters', '');
      sheet = document.createElement('div');
      sheet.className = 'facets-sheet';
      var aside = document.createElement('aside');
      aside.className = 'drawer';
      aside.setAttribute('role', 'dialog');
      aside.setAttribute('aria-modal', 'true');
      aside.setAttribute('aria-label', 'Filters');
      aside.innerHTML = '<div class="drawer-head"><h2>Filters</h2>' +
        '<button class="icon-btn" data-close-filters aria-label="Close filters">' +
        '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" stroke-width="1.6"/></svg>' +
        '</button></div><div class="drawer-body" data-sheet-facets></div>';
      sheet.appendChild(aside);
      document.body.appendChild(sheetScrim);
      document.body.appendChild(sheet);
      sheetScrim.addEventListener('click', closeSheet);
    }
    qs('[data-sheet-facets]', sheet).innerHTML = qs('[data-facets]').innerHTML;
    sheet.querySelector('.drawer').classList.add('open');
    sheetScrim.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    if (!sheet) return;
    sheet.querySelector('.drawer').classList.remove('open');
    sheetScrim.classList.remove('show');
    document.body.style.overflow = '';
  }

  renderFacets();
  render();
})();
