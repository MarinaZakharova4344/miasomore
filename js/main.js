(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  document.documentElement.classList.add('js');

  const fmt = n => (n > 0 ? Math.round(n).toLocaleString('ru-RU') + ' ₽' : '000 ₽');
  const icon = (id, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Волны ---------- */
  // Сумма синусоид с периодами, кратными 1200 — путь шириной 2400 бесшовно дрейфует на −1200.
  function wavePath(width, base, comps) {
    let d = '';
    for (let x = 0; x <= width; x += 8) {
      let y = base;
      for (const c of comps) y += c.a * Math.sin((x / 1200) * Math.PI * 2 * c.k + c.p);
      d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
    }
    return d;
  }

  function seeded(seed) {
    return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  }

  function buildWaves(el, index) {
    const count = +el.dataset.waves || 5;
    const rnd = seeded(97 + index * 31);
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1200 200');
    svg.setAttribute('preserveAspectRatio', 'none');
    const groups = ['drift-a', 'drift-b'].map(cls => {
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', cls);
      svg.appendChild(g);
      return g;
    });
    for (let i = 0; i < count; i++) {
      const p = document.createElementNS(SVG_NS, 'path');
      const comps = [
        { a: 22 + rnd() * 26, k: 1, p: rnd() * 6.28 },
        { a: 8 + rnd() * 14, k: 2, p: rnd() * 6.28 },
        { a: 3 + rnd() * 6, k: 3, p: rnd() * 6.28 },
      ];
      p.setAttribute('d', wavePath(2400, 100 + (i - count / 2) * 7, comps));
      p.style.opacity = (0.45 + rnd() * 0.55).toFixed(2);
      groups[i % 2].appendChild(p);
    }
    el.appendChild(svg);
  }

  function buildCorner(el, index) {
    const rnd = seeded(211 + index * 17);
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 400');
    // вложенные дуги вокруг угла с лёгким «дыханием», как завитки волн на страницах меню
    for (let i = 0; i < 10; i++) {
      const p = document.createElementNS(SVG_NS, 'path');
      const r = 70 + i * 26 + rnd() * 10;
      const w = (rnd() - 0.5) * 30;
      const sx = 400 - r, ex = 400, ey = r;
      p.setAttribute('d', `M${sx.toFixed(1)} 0 C${(sx + 6 + w).toFixed(1)} ${(r * 0.5).toFixed(1)} ${(400 - r * 0.55).toFixed(1)} ${(r * 0.98 - w).toFixed(1)} ${ex} ${ey.toFixed(1)}`);
      p.style.opacity = (0.4 + rnd() * 0.6).toFixed(2);
      svg.appendChild(p);
    }
    el.appendChild(svg);
  }

  $$('[data-waves]').forEach(buildWaves);
  $$('[data-corner]').forEach(buildCorner);

  /* ---------- Фото: заглушка, пока нет файла ---------- */
  function watchPhoto(img) {
    const fig = img.closest('.photo');
    if (!fig) return;
    const miss = () => fig.classList.add('is-missing');
    if (img.complete && img.naturalWidth === 0) miss();
    img.addEventListener('error', miss);
  }
  $$('.photo img').forEach(watchPhoto);

  /* ---------- Шапка ---------- */
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Блокировка прокрутки и фокус в диалогах ---------- */
  let lockCount = 0;
  const lock = () => { if (lockCount++ === 0) document.body.classList.add('is-locked'); };
  const unlock = () => { if (--lockCount <= 0) { lockCount = 0; document.body.classList.remove('is-locked'); } };

  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', container)
      .filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Мобильное меню ---------- */
  const burger = $('.burger');
  const mobileNav = $('#mobile-nav');

  function setMobileNav(open) {
    if (open === !mobileNav.hidden) return;
    mobileNav.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    header.classList.toggle('is-menu-open', open);
    if (open) { lock(); $('a', mobileNav).focus(); } else { unlock(); }
  }
  burger.addEventListener('click', () => setMobileNav(mobileNav.hidden));
  mobileNav.addEventListener('click', e => { if (e.target.closest('a')) setMobileNav(false); });
  window.matchMedia('(min-width: 1200px)').addEventListener('change', e => { if (e.matches) setMobileNav(false); });

  /* ---------- Подсветка активного пункта меню ---------- */
  const navLinks = $$('.nav__list a, .mobile-nav__list a');
  const sections = [...new Set(navLinks.map(a => a.getAttribute('href')))].map(h => $(h)).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = '#' + entry.target.id;
      navLinks.forEach(a => {
        if (a.getAttribute('href') === id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));
  // над первой секцией — ни один пункт не активен
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) navLinks.forEach(a => a.removeAttribute('aria-current'));
  }, { rootMargin: '-45% 0px -50% 0px' }).observe($('#top'));

  /* ---------- Появление при прокрутке ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Уведомление ---------- */
  const toastEl = $('[data-toast]');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2400);
  }

  /* ---------- Корзина ---------- */
  const STORE_KEY = 'mm-cart-v1';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { cart = []; }
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch { /* приватный режим */ } };

  const lineTotal = it => it.unitPrice * (it.weight || 1) * it.qty;
  const cartTotal = () => cart.reduce((s, it) => s + lineTotal(it), 0);
  const cartCount = () => cart.reduce((s, it) => s + it.qty, 0);

  function addToCart(item) {
    const found = cart.find(it => it.key === item.key);
    if (found) found.qty += item.qty;
    else cart.push(item);
    save();
    renderCart();
    toast(`«${item.name}» в корзине`);
  }

  function changeQty(key, delta) {
    const it = cart.find(i => i.key === key);
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) cart = cart.filter(i => i.key !== key);
    save();
    renderCart();
  }

  const cartEl = $('#cart');
  const overlay = $('[data-overlay]');
  const cartToggle = $('.cart-toggle');
  let lastFocus = null;

  function weightLabel(w) {
    return w < 1 ? `${w * 1000} г` : `${String(w).replace('.', ',')} кг`;
  }

  function renderCart() {
    const list = $('[data-cart-items]');
    const count = cartCount();
    const badge = $('[data-cart-count]');
    badge.textContent = count;
    badge.hidden = count === 0;
    cartToggle.setAttribute('aria-label', `Корзина, товаров: ${count}`);

    list.innerHTML = cart.map(it => `
      <li class="cart-item">
        <div>
          <p class="cart-item__name">${esc(it.name)}</p>
          <p class="cart-item__meta">${it.type === 'shop' ? 'Магазин' : 'Ресторан'}${it.weight ? ' · ≈ ' + weightLabel(it.weight) : it.meta && it.meta !== 'упак.' ? ' · ' + esc(it.meta) : ''}</p>
        </div>
        <p class="cart-item__price">${fmt(lineTotal(it))}</p>
        <div class="cart-item__row">
          <div class="qty">
            <button type="button" data-qty="-1" data-key="${it.key}" aria-label="Уменьшить количество">${icon('i-minus')}</button>
            <output aria-live="polite">${it.qty}</output>
            <button type="button" data-qty="1" data-key="${it.key}" aria-label="Увеличить количество">${icon('i-plus')}</button>
          </div>
          <button class="cart-item__remove" type="button" data-remove="${it.key}">Удалить</button>
        </div>
      </li>`).join('');

    $('[data-cart-empty]').hidden = cart.length > 0;
    $('[data-cart-foot]').hidden = cart.length === 0;
    const byWeight = cart.some(it => it.weight);
    $$('[data-cart-total]').forEach(el => { el.textContent = (byWeight ? '≈ ' : '') + fmt(cartTotal()); });
    $$('[data-cart-note]').forEach(el => { el.hidden = !byWeight; });
  }

  function showView(name) {
    $$('.cart__view', cartEl).forEach(v => { v.hidden = v.dataset.view !== name; });
  }

  function openCart() {
    if (!cartEl.hidden) return;
    lastFocus = document.activeElement;
    setMobileNav(false);
    showView('list');
    overlay.hidden = false;
    cartEl.hidden = false;
    cartEl.classList.remove('is-closing');
    cartToggle.setAttribute('aria-expanded', 'true');
    lock();
    $('[data-cart-close]', cartEl).focus();
  }

  function closeCart() {
    if (cartEl.hidden) return;
    const finish = () => {
      cartEl.hidden = true;
      overlay.hidden = true;
      cartEl.classList.remove('is-closing');
    };
    cartToggle.setAttribute('aria-expanded', 'false');
    unlock();
    if (reduceMotion) finish();
    else {
      cartEl.classList.add('is-closing');
      cartEl.addEventListener('animationend', finish, { once: true });
    }
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  cartToggle.addEventListener('click', openCart);
  overlay.addEventListener('click', closeCart);
  cartEl.addEventListener('click', e => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.matches('[data-cart-close]')) closeCart();
    else if (t.matches('[data-qty]')) changeQty(t.dataset.key, +t.dataset.qty);
    else if (t.matches('[data-remove]')) changeQty(t.dataset.remove, -Infinity);
    else if (t.matches('[data-to-checkout]')) { showView('checkout'); $('#c-name').focus(); }
    else if (t.matches('[data-to-list]')) { showView('list'); $('[data-to-checkout]').focus(); }
  });
  cartEl.addEventListener('keydown', e => trapFocus(cartEl, e));
  mobileNav.addEventListener('keydown', e => trapFocus(mobileNav, e));

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!cartEl.hidden) closeCart();
    else if (!mobileNav.hidden) { setMobileNav(false); burger.focus(); }
  });

  /* ---------- Меню ресторана ---------- */
  const MENU = window.MM_MENU || [];
  const tabsEl = $('[data-menu-tabs]');
  const panel = $('[data-menu-panel]');
  const TAG_ICONS = { meat: ['i-meat', 'мясо'], fish: ['i-fish', 'рыба'], spicy: ['i-spicy', 'острое'], hit: ['i-hit', 'хит'] };

  tabsEl.innerHTML = MENU.map((c, i) => `
    <button class="tab" type="button" role="tab" id="tab-${c.id}" aria-controls="menu-panel"
      aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-cat="${c.id}">${esc(c.title)}</button>`).join('');
  panel.id = 'menu-panel';

  function renderMenu(catId) {
    const cat = MENU.find(c => c.id === catId) || MENU[0];
    if (!cat) return;
    panel.setAttribute('aria-labelledby', 'tab-' + cat.id);
    panel.innerHTML = cat.items.map((d, i) => {
      const tags = d.tags || [];
      const v = d.variants;
      const price = v ? (v.length > 1 ? 'от ' + fmt(Math.min(...v.map(x => x.price))) : fmt(v[0].price)) : fmt(d.price);
      const meta = [
        d.weight ? `<span>${esc(d.weight)}</span>` : '',
        v && v.length > 1 ? `<span>${v.map(x => `${esc(x.label)} — ${fmt(x.price)}`).join(' · ')}</span>` : '',
        v && v.length === 1 ? `<span>${esc(v[0].label)}</span>` : '',
        tags.length ? `<span class="dish__tags">${tags.map(t => TAG_ICONS[t] ? `<span title="${TAG_ICONS[t][1]}">${icon(TAG_ICONS[t][0])}<span class="visually-hidden">${TAG_ICONS[t][1]}</span></span>` : '').join('')}</span>` : '',
      ].join('');
      return `
      <article class="dish${d.img ? '' : ' dish--text'}" style="animation-delay:${Math.min(i, 10) * 50}ms">
        ${d.img ? `<button class="dish__photo photo" type="button" data-zoom="${d.img.replace('.webp', '-lg.webp')}" data-title="${esc(d.name)}" aria-label="Фото крупно: ${esc(d.name)}"><img src="${d.img}" alt="" loading="lazy" decoding="async" width="360" height="360"></button>` : ''}
        <div class="dish__body">
        <div class="dish__line">
          <h3 class="dish__name">${esc(d.name)}</h3>
          <span class="dots" aria-hidden="true"></span>
          <span class="dish__price">${price}</span>
        </div>
        ${d.desc ? `<p class="dish__desc">${esc(d.desc)}</p>` : ''}
        ${meta ? `<div class="dish__meta">${meta}</div>` : ''}
        <div class="dish__add">
          ${v && v.length > 1 ? `<label class="visually-hidden" for="dv-${d.id}">Вариант</label>
          <select class="dish__select" id="dv-${d.id}" data-variant>${v.map((x, j) => `<option value="${j}">${esc(x.label)}</option>`).join('')}</select>` : ''}
          <button class="add-btn" type="button" data-dish="${d.id}" aria-label="Добавить в корзину: ${esc(d.name)}">${icon('i-plus')}В корзину</button>
        </div>
        </div>
      </article>`;
    }).join('');
    $$('.dish__photo img', panel).forEach(watchPhoto);
  }

  function selectTab(btn, focus) {
    $$('.tab', tabsEl).forEach(t => {
      const on = t === btn;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    if (focus) btn.focus();
    btn.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    renderMenu(btn.dataset.cat);
  }

  tabsEl.addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (btn) selectTab(btn, false);
  });
  tabsEl.addEventListener('keydown', e => {
    const tabs = $$('.tab', tabsEl);
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    if (n !== null) { e.preventDefault(); selectTab(tabs[n], true); }
  });

  /* ---------- Просмотр фото блюда ---------- */
  const lightbox = $('#lightbox');
  const lbImg = $('img', lightbox);
  const lbCap = $('figcaption', lightbox);

  function openLightbox(src, title) {
    lbImg.src = src;
    lbImg.alt = title;
    lbCap.textContent = title;
    lightbox.showModal();
    lock();
  }
  lightbox.addEventListener('close', () => { unlock(); lbImg.removeAttribute('src'); });
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target.closest('[data-lb-close]')) lightbox.close();
  });

  panel.addEventListener('click', e => {
    const zoom = e.target.closest('[data-zoom]');
    if (zoom) { openLightbox(zoom.dataset.zoom, zoom.dataset.title); return; }
    const btn = e.target.closest('[data-dish]');
    if (!btn) return;
    let dish;
    for (const c of MENU) { dish = c.items.find(d => d.id === btn.dataset.dish); if (dish) break; }
    if (!dish) return;
    if (dish.variants) {
      const sel = $('[data-variant]', btn.closest('.dish'));
      const v = dish.variants[sel ? +sel.value : 0];
      addToCart({ key: `${dish.id}@${v.label}`, id: dish.id, type: 'menu', name: dish.name, meta: v.label, unitPrice: v.price, qty: 1 });
    } else {
      addToCart({ key: dish.id, id: dish.id, type: 'menu', name: dish.name, meta: dish.weight, unitPrice: dish.price, qty: 1 });
    }
    flash(btn);
  });

  function flash(btn) {
    btn.classList.add('is-added');
    setTimeout(() => btn.classList.remove('is-added'), 900);
  }

  if (MENU.length) renderMenu(MENU[0].id);

  /* ---------- Магазин ---------- */
  const SHOP = window.MM_SHOP || [];
  const CATS = window.MM_SHOP_CATS || [];
  const BADGES = { chilled: 'Охлаждённое', frozen: 'Замороженное', new: 'Новинка' };
  const KG_OPTIONS = [0.3, 0.5, 1, 1.5, 2];
  const QTY_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];
  const PAGE = 12;
  const filtersEl = $('[data-shop-filters]');
  const grid = $('[data-shop-grid]');
  const moreBtn = $('[data-shop-more]');
  let shopFilter = 'all';
  let shopShown = PAGE;

  filtersEl.innerHTML = [{ id: 'all', title: 'Все' }, ...CATS].map((c, i) =>
    `<button class="filter" type="button" aria-pressed="${i === 0}" data-filter="${c.id}">${esc(c.title)}</button>`).join('');

  const perLabel = g => (g >= 1000 ? `${g / 1000} кг` : g === 500 ? '0,5 кг' : `${g} г`);

  function productPrice(p) {
    if (p.unit === 'kg') {
      const per = p.per || 100;
      return `<p class="product__price">${fmt(p.priceKg * per / 1000)} <small>за ${perLabel(per)}</small></p>
        <p class="product__sub">${fmt(p.priceKg)} за кг${p.note ? ' · ' + esc(p.note) : ''}</p>`;
    }
    const v = p.variants;
    if (v.length > 1) {
      return `<p class="product__price">от ${fmt(Math.min(...v.map(x => x.price)))}</p>
        <p class="product__sub">${v.map(x => `${esc(x.label)} — ${fmt(x.price)}`).join(' · ')}</p>`;
    }
    return `<p class="product__price">${fmt(v[0].price)} <small>${v[0].label === 'упак.' ? 'за упаковку' : 'за ' + esc(v[0].label)}</small></p>`;
  }

  function productOptions(p) {
    if (p.unit === 'kg') {
      return { label: 'Примерный вес', html: KG_OPTIONS.map(v => `<option value="${v}"${v === 0.5 ? ' selected' : ''}>≈ ${weightLabel(v)}</option>`).join('') };
    }
    if (p.variants.length > 1) {
      return { label: 'Фасовка', html: p.variants.map((x, i) => `<option value="v${i}">${esc(x.label)}</option>`).join('') };
    }
    return { label: 'Количество упаковок', html: QTY_OPTIONS.map(v => `<option value="${v}">${v} уп.</option>`).join('') };
  }

  function renderShop() {
    const all = shopFilter === 'all' ? SHOP : SHOP.filter(p => p.cat === shopFilter);
    const items = all.slice(0, shopShown);
    grid.innerHTML = items.map((p, i) => {
      const cat = CATS.find(c => c.id === p.cat);
      const opt = productOptions(p);
      return `
      <article class="product${p.img ? '' : ' product--text'}" style="animation-delay:${Math.min(i % PAGE, 8) * 50}ms">
        ${p.img ? `<figure class="photo photo--1x1" data-label="${esc(cat ? cat.title : '')}">
          ${p.badge ? `<span class="product__badge${p.badge === 'new' ? ' product__badge--new' : ''}">${BADGES[p.badge]}</span>` : ''}
          <img src="${p.img}" alt="${esc(p.name)}" loading="lazy" decoding="async">
        </figure>` : `<div class="product__top">
          <span class="product__cat">${esc(cat ? cat.title : '')}</span>
          ${p.badge ? `<span class="product__tag">${p.badge === 'frozen' ? '❄ ' : ''}${BADGES[p.badge]}</span>` : ''}
        </div>`}
        <div class="product__body">
          <h3 class="product__name">${esc(p.name)}</h3>
          <div class="product__prices">${productPrice(p)}</div>
          <div class="product__controls">
            <label class="visually-hidden" for="opt-${p.id}">${opt.label}</label>
            <select id="opt-${p.id}" data-opt>${opt.html}</select>
            <button class="add-btn" type="button" data-product="${p.id}" aria-label="Добавить в корзину: ${esc(p.name)}">${icon('i-plus')}В корзину</button>
          </div>
        </div>
      </article>`;
    }).join('');
    $$('.photo img', grid).forEach(watchPhoto);
    moreBtn.hidden = all.length <= shopShown;
    moreBtn.textContent = `Показать ещё (${all.length - shopShown})`;
  }

  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    $$('[data-filter]', filtersEl).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    shopFilter = btn.dataset.filter;
    shopShown = PAGE;
    renderShop();
  });

  moreBtn.addEventListener('click', () => {
    const first = shopShown;
    shopShown += PAGE;
    renderShop();
    const next = $$('.product', grid)[first];
    if (next) $('select, button', next).focus();
  });

  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-product]');
    if (!btn) return;
    const p = SHOP.find(x => x.id === btn.dataset.product);
    if (!p) return;
    const val = $('[data-opt]', btn.closest('.product')).value;
    if (p.unit === 'kg') {
      const w = parseFloat(val);
      addToCart({ key: `${p.id}@${w}`, id: p.id, type: 'shop', name: p.name, weight: w, unitPrice: p.priceKg, qty: 1 });
    } else if (p.variants.length > 1) {
      const v = p.variants[+val.slice(1)];
      addToCart({ key: `${p.id}@${v.label}`, id: p.id, type: 'shop', name: p.name, meta: v.label, unitPrice: v.price, qty: 1 });
    } else {
      const v = p.variants[0];
      addToCart({ key: p.id, id: p.id, type: 'shop', name: p.name, meta: v.label, unitPrice: v.price, qty: +val });
    }
    flash(btn);
  });

  renderShop();

  /* ---------- Маска телефона ---------- */
  function formatPhone(raw) {
    let d = raw.replace(/\D/g, '');
    if (!d) return '';
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') d = '7' + d;
    const p = d.slice(1, 11);
    let out = '+7';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length > 3) out += ') ' + p.slice(3, 6);
    if (p.length > 6) out += '-' + p.slice(6, 8);
    if (p.length > 8) out += '-' + p.slice(8, 10);
    return out;
  }
  const phoneDigits = v => v.replace(/\D/g, '').length;

  $$('[data-phone]').forEach(input => {
    input.addEventListener('input', () => { input.value = formatPhone(input.value); });
    input.addEventListener('focus', () => { if (!input.value) input.value = '+7 ('; });
    input.addEventListener('blur', () => { if (phoneDigits(input.value) <= 1) input.value = ''; });
  });

  /* ---------- Проверка форм ---------- */
  function setError(input, msg) {
    const err = $('#' + input.id + '-err');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg || '';
    return !msg;
  }

  function validateField(input) {
    const v = input.value.trim();
    switch (input.name) {
      case 'name':
        return setError(input, v.length < 2 ? 'Укажите имя' : '');
      case 'phone':
        return setError(input, phoneDigits(v) !== 11 ? 'Введите номер в формате +7 (___) ___-__-__' : '');
      case 'date': {
        if (!v) return setError(input, 'Выберите дату');
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return setError(input, new Date(v + 'T00:00') < today ? 'Дата не может быть в прошлом' : '');
      }
      case 'time':
        return setError(input, !v ? 'Выберите время' : '');
      case 'guests': {
        const n = +v;
        return setError(input, !Number.isInteger(n) || n < 1 || n > 20 ? 'От 1 до 20 гостей. Для больших компаний позвоните нам' : '');
      }
      case 'address':
        return setError(input, v.length < 5 ? 'Укажите адрес доставки' : '');
      default:
        return true;
    }
  }

  function bindLiveValidation(form) {
    $$('input[aria-describedby]', form).forEach(input => {
      input.addEventListener('blur', () => { if (input.value) validateField(input); });
      input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') validateField(input); });
    });
  }

  function validateForm(inputs) {
    let firstBad = null;
    inputs.forEach(i => { if (!validateField(i) && !firstBad) firstBad = i; });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  // Общие проверки полей — их использует и бронирование по схеме зала (js/booking.js)
  window.MM_FORM = { validateField, setError, bindLiveValidation, validateForm };

  // Оформление заказа
  const checkoutForm = $('#checkout-form');
  const addressField = $('[data-address]', checkoutForm);
  bindLiveValidation(checkoutForm);

  checkoutForm.addEventListener('change', e => {
    if (e.target.name !== 'method') return;
    addressField.hidden = e.target.value === 'pickup';
  });

  checkoutForm.addEventListener('submit', e => {
    e.preventDefault();
    const fields = [$('#c-name'), $('#c-phone')];
    if (!addressField.hidden) fields.push($('#c-address'));
    if (!validateForm(fields)) return;
    // TODO: отправка заказа на сервер
    cart = [];
    save();
    renderCart();
    checkoutForm.reset();
    addressField.hidden = false;
    showView('done');
    $('.cart__done .btn', cartEl).focus();
  });

  /* ---------- Прочее ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  renderCart();
})();
