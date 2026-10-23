/* FUROR homepage — renders New Arrivals + Special Prices from real catalog data */
(function () {
  'use strict';
  var D = window.FUROR || { products: [] };
  var UI = window.FUROR_UI;
  if (!UI) return;

  function byDateDesc(a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); }
  function byDiscountDesc(a, b) {
    var da = a.compareAt ? 1 - a.price / a.compareAt : 0;
    var db = b.compareAt ? 1 - b.price / b.compareAt : 0;
    return db - da || a.price - b.price;
  }

  var newArrivals = D.products.slice().sort(byDateDesc).slice(0, 8);
  var specialPrices = D.products.filter(function (p) { return p.onSale && p.compareAt; }).sort(byDiscountDesc).slice(0, 4);

  var naGrid = document.querySelector('[data-new-arrivals]');
  if (naGrid) naGrid.innerHTML = newArrivals.map(function (p) { return UI.card(p, { badge: 'New' }); }).join('');

  var spGrid = document.querySelector('[data-special-prices]');
  if (spGrid) spGrid.innerHTML = specialPrices.map(function (p) { return UI.card(p); }).join('');
})();
