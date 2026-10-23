/* FUROR search results page */
(function () {
  'use strict';
  var UI = window.FUROR_UI;
  if (!UI) return;
  var qs = function (s) { return document.querySelector(s); };

  var q = new URLSearchParams(location.search).get('q') || '';
  var input = qs('#search-input');
  input.value = q;

  var hits = q ? UI.searchProducts(q, 60) : [];
  qs('[data-q]').textContent = '“' + q + '”';
  document.title = 'Search: ' + q + ' — FUROR Prototype';
  qs('[data-count]').textContent = hits.length + ' match' + (hits.length === 1 ? '' : 'es') + ' in the current data export (250 products)';

  var grid = qs('[data-grid]');
  var empty = qs('[data-empty]');
  grid.innerHTML = hits.map(function (p) { return UI.card(p); }).join('');
  grid.hidden = !hits.length;
  empty.hidden = !!hits.length;
})();
