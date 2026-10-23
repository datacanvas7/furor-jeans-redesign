/* FUROR storefront — shared runtime (header, menus, search, cart, overlays)
   Vanilla JS, no dependencies. Cart persists in localStorage only. */
(function () {
  'use strict';

  var D = window.FUROR || { products: [], generated: null };
  var byHandle = new Map(D.products.map(function (p) { return [p.handle, p]; }));
  var qs = function (s, r) { return (r || document).querySelector(s); };
  var qsa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function money(n) { return 'Rs ' + Math.round(Number(n) || 0).toLocaleString('en-US'); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }

  /* ---------------- toast ---------------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) { toastEl = el('<div class="toast" role="status" aria-live="polite"></div>'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    requestAnimationFrame(function () { toastEl.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ---------------- modal ---------------- */
  var modalWrap = null, lastFocusModal = null;
  function openModal(title, bodyHTML) {
    if (!modalWrap) {
      modalWrap = el(
        '<div class="modal-wrap">' +
        '  <div class="scrim2" data-close></div>' +
        '  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
        '    <button class="icon-btn modal-x" data-close aria-label="Close dialog">' +
        '      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" stroke-width="1.6"/></svg>' +
        '    </button>' +
        '    <h2 id="modal-title"></h2><div class="modal-body"></div>' +
        '  </div>' +
        '</div>'
      );
      document.body.appendChild(modalWrap);
      modalWrap.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeModal(); });
    }
    qs('#modal-title', modalWrap).textContent = title;
    qs('.modal-body', modalWrap).innerHTML = bodyHTML;
    lastFocusModal = document.activeElement;
    modalWrap.classList.add('open');
    document.body.style.overflow = 'hidden';
    var x = qs('.modal-x', modalWrap); if (x) x.focus();
  }
  function closeModal() {
    if (!modalWrap) return;
    modalWrap.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocusModal && lastFocusModal.focus) lastFocusModal.focus();
  }

  /* ---------------- cart ---------------- */
  var CART_KEY = 'furor_cart_v1';
  function cartRead() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } }
  function cartWrite(lines) { localStorage.setItem(CART_KEY, JSON.stringify(lines)); renderCartBadge(); renderDrawer(); }
  function cartCount() { return cartRead().reduce(function (n, l) { return n + l.qty; }, 0); }
  function cartSubtotal() {
    return cartRead().reduce(function (sum, l) {
      var p = byHandle.get(l.handle);
      return p ? sum + (p.price * l.qty) : sum;
    }, 0);
  }
  function cartAdd(handle, size, color, qty) {
    var p = byHandle.get(handle);
    if (!p) return;
    var lines = cartRead();
    var key = function (l) { return l.handle + '|' + l.size + '|' + l.color; };
    var incoming = { handle: handle, size: size || null, color: color || null, qty: qty || 1 };
    var found = lines.filter(function (l) { return key(l) === key(incoming); })[0];
    if (found) found.qty += incoming.qty; else lines.push(incoming);
    cartWrite(lines);
  }
  function renderCartBadge() {
    var n = cartCount();
    qsa('.bag-count').forEach(function (b) { b.textContent = n; b.setAttribute('data-empty', n === 0 ? 'true' : 'false'); });
    qsa('.bag-btn').forEach(function (b) { b.setAttribute('aria-label', 'Open shopping bag, ' + n + ' item' + (n === 1 ? '' : 's')); });
  }

  /* drawer markup (injected once) */
  var drawer = null, scrim = null, lastFocusDrawer = null;
  function ensureDrawer() {
    if (drawer) return;
    scrim = el('<div class="scrim" aria-hidden="true"></div>');
    drawer = el(
      '<aside class="drawer" role="dialog" aria-modal="true" aria-label="Shopping bag">' +
      '  <div class="drawer-head">' +
      '    <h2>Bag<span class="drawer-count" data-cart-count></span></h2>' +
      '    <button class="icon-btn" data-close-drawer aria-label="Close bag">' +
      '      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '    </button>' +
      '  </div>' +
      '  <div class="drawer-body" data-cart-body></div>' +
      '  <div class="drawer-foot" data-cart-foot></div>' +
      '</aside>'
    );
    document.body.appendChild(scrim);
    document.body.appendChild(drawer);
    scrim.addEventListener('click', closeCart);
    drawer.addEventListener('click', function (e) {
      var t = e.target;
      var closeBtn = t.closest('[data-close-drawer]'); if (closeBtn) { closeCart(); return; }
      var qtyBtn = t.closest('[data-qty]');
      if (qtyBtn) {
        var idx = Number(qtyBtn.getAttribute('data-line'));
        var lines = cartRead();
        if (!lines[idx]) return;
        lines[idx].qty += Number(qtyBtn.getAttribute('data-qty'));
        if (lines[idx].qty <= 0) lines.splice(idx, 1);
        cartWrite(lines);
        return;
      }
      var rm = t.closest('[data-remove]');
      if (rm) {
        var lines2 = cartRead();
        lines2.splice(Number(rm.getAttribute('data-remove')), 1);
        cartWrite(lines2);
        toast('Removed from bag');
        return;
      }
      if (t.closest('[data-checkout]')) {
        openModal(
          'Checkout',
          '<p>This prototype ends at the bag. On the live store, this button hands you over to Shopify’s secure checkout with your items, BaadMay installment options, and delivery details.</p>' +
          '<p class="mono" style="font-size:12px;color:#6B675F">Prototype note: the bag is stored locally in your browser only — no order is placed and no data leaves this page.</p>' +
          '<a class="btn btn-ink" href="https://furorjeans.com/cart" target="_blank" rel="noopener">Open the live FUROR store cart</a>'
        );
      }
    });
  }
  function renderDrawer() {
    if (!drawer) return;
    var lines = cartRead();
    var body = qs('[data-cart-body]', drawer);
    var foot = qs('[data-cart-foot]', drawer);
    var countEl = qs('[data-cart-count]', drawer);
    if (countEl) countEl.textContent = lines.length ? ' — ' + cartCount() + ' item' + (cartCount() === 1 ? '' : 's') : '';

    if (!lines.length) {
      body.innerHTML =
        '<div class="cart-empty">' +
        '  <p class="eyebrow">Your bag is empty</p>' +
        '  <p>New drops, denim, and the Proportions capsule are one tap away.</p>' +
        '  <a class="btn btn-ink" href="index.html#new-arrivals">Continue shopping</a>' +
        '</div>';
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = '<ul class="cart-lines">' + lines.map(function (l, i) {
      var p = byHandle.get(l.handle); if (!p) return '';
      return '<li class="cart-line">' +
        '<a href="product.html?handle=' + encodeURIComponent(p.handle) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(p.img) + '" alt="" loading="lazy"></a>' +
        '<div>' +
        '  <div class="cl-title"><a href="product.html?handle=' + encodeURIComponent(p.handle) + '">' + esc(p.title) + '</a></div>' +
        '  <div class="cl-meta">' + (l.color ? esc(l.color) + ' / ' : '') + (l.size ? 'Size ' + esc(l.size) : '') + '</div>' +
        '  <div class="cl-row">' +
        '    <span class="qty">' +
        '      <button type="button" data-qty="-1" data-line="' + i + '" aria-label="Decrease quantity">−</button>' +
        '      <span aria-live="polite">' + l.qty + '</span>' +
        '      <button type="button" data-qty="1" data-line="' + i + '" aria-label="Increase quantity">+</button>' +
        '    </span>' +
        '    <span class="cl-price">' + money(p.price * l.qty) + '</span>' +
        '  </div>' +
        '  <button type="button" class="cl-remove" data-remove="' + i + '">Remove</button>' +
        '</div>' +
        '</li>';
    }).join('') + '</ul>';

    foot.innerHTML =
      '<div class="cart-total-row"><span class="lbl">Subtotal</span><span class="val">' + money(cartSubtotal()) + '</span></div>' +
      '<p class="cart-note">Shipping calculated at checkout · Installment options via BaadMay on the live store.</p>' +
      '<button type="button" class="btn btn-ink btn-block" data-checkout>Checkout</button>';
  }
  function openCart() {
    ensureDrawer(); renderDrawer();
    lastFocusDrawer = document.activeElement;
    drawer.classList.add('open'); scrim.classList.add('show');
    document.body.style.overflow = 'hidden';
    var c = qs('[data-close-drawer]', drawer); if (c) c.focus();
  }
  function closeCart() {
    if (!drawer) return;
    drawer.classList.remove('open');
    if (scrim) scrim.classList.remove('show');
    document.body.style.overflow = '';
    if (lastFocusDrawer && lastFocusDrawer.focus) lastFocusDrawer.focus();
  }

  /* focus trap + Esc for open overlays */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeCart(); closeModal();
    closeMobileMenu();
    qsa('.nav-item.open').forEach(function (n) { n.classList.remove('open'); var t = qs('.nav-trigger', n); if (t) t.setAttribute('aria-expanded', 'false'); });
    var pred = qs('.predictive.open'); if (pred) pred.classList.remove('open');
  });
  function trapTab(container, e) {
    var f = qsa('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', container)
      .filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    if (drawer && drawer.classList.contains('open')) trapTab(drawer, e);
    else if (modalWrap && modalWrap.classList.contains('open')) trapTab(modalWrap, e);
    else if (mobileMenu && mobileMenu.classList.contains('open')) trapTab(mobileMenu, e);
  });

  /* ---------------- desktop nav dropdowns ---------------- */
  qsa('.nav-item').forEach(function (item) {
    var trigger = qs('.nav-trigger', item);
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !item.classList.contains('open');
      qsa('.nav-item.open').forEach(function (n) { n.classList.remove('open'); qs('.nav-trigger', n).setAttribute('aria-expanded', 'false'); });
      item.classList.toggle('open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-item')) {
      qsa('.nav-item.open').forEach(function (n) { n.classList.remove('open'); qs('.nav-trigger', n).setAttribute('aria-expanded', 'false'); });
    }
  });

  /* ---------------- mobile menu (injected) ---------------- */
  var mobileMenu = null;
  function ensureMobileMenu() {
    if (mobileMenu) return;
    var nav = qs('#mobile-menu-src');
    mobileMenu = el(
      '<div class="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">' +
      '  <div class="mobile-menu-head">' +
      '    <span class="mono" style="font-weight:700;letter-spacing:.14em">FUROR</span>' +
      '    <button class="icon-btn" data-close-mm aria-label="Close menu">' +
      '      <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '    </button>' +
      '  </div>' +
      '  <nav aria-label="Mobile">' + (nav ? nav.innerHTML : '') + '</nav>' +
      '</div>'
    );
    document.body.appendChild(mobileMenu);
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('[data-close-mm]')) { closeMobileMenu(); return; }
      var trg = e.target.closest('.acc-trigger');
      if (trg) {
        var panel = trg.nextElementSibling;
        var open = trg.getAttribute('aria-expanded') === 'true';
        trg.setAttribute('aria-expanded', String(!open));
        if (panel) panel.style.display = open ? 'none' : 'block';
      }
    });
  }
  function openMobileMenu() {
    ensureMobileMenu();
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    var c = qs('[data-close-mm]', mobileMenu); if (c) c.focus();
  }
  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
  qsa('.nav-toggle').forEach(function (b) { b.addEventListener('click', openMobileMenu); });

  /* ---------------- predictive search ---------------- */
  function searchProducts(q, limit) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    var words = q.split(/\s+/);
    return D.products.map(function (p) {
      var hay = (p.title + ' ' + p.type).toLowerCase();
      var score = 0;
      words.forEach(function (w) {
        if (hay.indexOf(w) === 0) score += 3;
        else if (hay.indexOf(' ' + w) !== -1) score += 2;
        else if (hay.indexOf(w) !== -1) score += 1;
      });
      return { p: p, score: score };
    }).filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score || a.p.price - b.p.price; })
      .slice(0, limit || 5).map(function (x) { return x.p; });
  }
  qsa('.search-form').forEach(function (form) {
    var input = qs('input[type="search"]', form);
    var panel = qs('.predictive', form);
    if (!input || !panel) return;
    var deb = null;
    input.addEventListener('input', function () {
      clearTimeout(deb);
      deb = setTimeout(function () {
        var q = input.value;
        if (q.trim().length < 2) { panel.classList.remove('open'); return; }
        var hits = searchProducts(q, 5);
        panel.innerHTML = hits.length
          ? hits.map(function (p) {
            return '<a class="p-item" href="product.html?handle=' + encodeURIComponent(p.handle) + '">' +
              '<img src="' + esc(p.img) + '" alt="" loading="lazy">' +
              '<span><span class="p-title">' + esc(p.title) + '</span><br><span class="p-type">' + esc(p.type) + '</span></span>' +
              '<span class="p-price">' + money(p.price) + '</span></a>';
          }).join('') + '<a class="p-all" href="search.html?q=' + encodeURIComponent(q.trim()) + '">View all results</a>'
          : '<p class="p-none">No matches for “' + esc(q.trim()) + '”. Try “jeans” or “polo”.</p>';
        panel.classList.add('open');
      }, 160);
    });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') panel.classList.remove('open'); });
    document.addEventListener('click', function (e) { if (!form.contains(e.target)) panel.classList.remove('open'); });
  });

  /* ---------------- bag buttons ---------------- */
  qsa('.bag-btn').forEach(function (b) { b.addEventListener('click', openCart); });

  /* ---------------- newsletter (labeled pending integration) ---------------- */
  qsa('[data-newsletter]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = qs('input[type="email"]', form);
      var msg = qs('.form-msg', form) || (function () { var m = el('<p class="form-msg" role="status"></p>'); form.appendChild(m); return m; })();
      var v = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        msg.textContent = 'Enter a valid email address.';
        msg.className = 'form-msg err';
        input.focus();
        return;
      }
      msg.textContent = 'Saved locally for this prototype — newsletter delivery is a labeled integration point, not yet connected.';
      msg.className = 'form-msg ok';
      form.reset();
    });
  });

  renderCartBadge();

  /* card quick-add delegation (works for any grid rendered on the page) */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.qa-size');
    if (!b) return;
    e.preventDefault();
    if (b.getAttribute('aria-disabled') === 'true') return;
    cartAdd(b.getAttribute('data-handle'), b.getAttribute('data-size'), b.getAttribute('data-color') || null, 1);
    toast('Added to bag — ' + b.getAttribute('data-size'));
    openCart();
  });

  /* product card — shared by home, collection, search and related rails */
  function card(p, opts) {
    opts = opts || {};
    var href = 'product.html?handle=' + encodeURIComponent(p.handle);
    var badges = '';
    if (p.onSale && p.compareAt) badges += '<span class="badge badge-sale">-' + Math.round((1 - p.price / p.compareAt) * 100) + '%</span>';
    if (opts.badge) badges += '<span class="badge badge-new">' + esc(opts.badge) + '</span>';
    if (!p.available) badges += '<span class="badge badge-out">Sold out</span>';
    var avail = {};
    (p.vs || []).forEach(function (v) { if (v.a) avail[v.s] = true; });
    var anySize = false;
    var sizes = (p.sizes || []).map(function (s) {
      var out = !avail[s];
      if (!out) anySize = true;
      return '<button type="button" class="qa-size" data-handle="' + esc(p.handle) + '" data-size="' + esc(s) + '"' + (out ? ' aria-disabled="true"' : '') + '>' + esc(s) + '</button>';
    }).join('');
    var price = '<span class="price-now">' + money(p.price) + '</span>';
    if (p.compareAt) price += '<span class="price-was">' + money(p.compareAt) + '</span><span class="price-save">Save ' + Math.round((1 - p.price / p.compareAt) * 100) + '%</span>';
    return '<article class="card" data-handle="' + esc(p.handle) + '">' +
      '<div class="card-media">' +
      '<a class="card-link" href="' + href + '" aria-label="' + esc(p.title) + '" tabindex="-1">' +
      '<img src="' + esc(p.img) + '" alt="' + esc(p.title) + '" loading="lazy" width="600" height="800"></a>' +
      (badges ? '<div class="card-badges">' + badges + '</div>' : '') +
      (anySize ? '<div class="quick-add"><p class="qa-label">Quick add — select size</p><div class="qa-sizes">' + sizes + '</div></div>' : '') +
      '</div>' +
      '<div class="card-info">' +
      '<p class="card-type">' + esc(p.type) + '</p>' +
      '<h3 class="card-title"><a href="' + href + '">' + esc(p.title) + '</a></h3>' +
      '<p class="card-price">' + price + '</p>' +
      '</div></article>';
  }

  window.FUROR_UI = {
    money: money, esc: esc, byHandle: byHandle, products: D.products, card: card,
    cartAdd: cartAdd, cartRead: cartRead, cartWrite: cartWrite, cartCount: cartCount, cartSubtotal: cartSubtotal,
    toast: toast, openModal: openModal, closeModal: closeModal, openCart: openCart, closeCart: closeCart,
    searchProducts: searchProducts, renderCartBadge: renderCartBadge
  };
})();
