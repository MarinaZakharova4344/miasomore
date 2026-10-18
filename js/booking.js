/*
 * Бронирование по схеме зала.
 * Гость выбирает дату и время, затем места на схеме. Стол бронируется целиком,
 * места у стоек — по одному. Занятость приходит с сервера (worker/booking-worker.js),
 * а окончательную проверку «не занято ли» делает база — двойной брони не будет.
 */
(() => {
  'use strict';

  const form = document.getElementById('booking-form');
  if (!form) return;

  const API = ((window.MM_CONFIG || {}).bookingEndpoint || '').replace(/\/+$/, '');
  const PHONE = '+7 905 222-62-72';
  const F = window.MM_FORM;
  const $ = (s, r = document) => r.querySelector(s);
  const SVG = 'http://www.w3.org/2000/svg';

  // Правила по умолчанию (сервер присылает актуальные вместе с занятостью)
  let rules = { open: 600, close: 1320, step: 30, duration: 180, lastStart: 1260, lateMinutes: 15, horizonDays: 30 };

  /* ---------- Схема зала (координаты в системе 830×560, по плану ресторана) ---------- */
  const RES = {
    T1: { kind: 'table', seats: 4, label: 'Стол 1', full: 'Стол 1 (круглый)', shape: 'round', x: 220, y: 331,
          chairs: [[176, 296], [256, 286], [278, 351], [190, 386]] },
    T2: { kind: 'table', seats: 4, label: 'Стол 2', full: 'Стол 2 (у дивана)', shape: 'rect', x: 225, y: 489,
          chairs: [[163, 493], [287, 493], [225, 443]], sofa: [178, 527, 94, 28] },
    T3: { kind: 'table', seats: 4, label: 'Стол 3', full: 'Стол 3 (у дивана)', shape: 'rect', x: 453, y: 489,
          chairs: [[391, 493], [515, 493], [453, 443]], sofa: [406, 527, 94, 28] },
    A1: { kind: 'stool', seats: 1, label: 'А1', full: 'место А1 у аквариума', x: 546, y: 292 },
    A2: { kind: 'stool', seats: 1, label: 'А2', full: 'место А2 у аквариума', x: 617, y: 292 },
    A3: { kind: 'stool', seats: 1, label: 'А3', full: 'место А3 у аквариума', x: 688, y: 292 },
    O1: { kind: 'stool', seats: 1, label: 'О1', full: 'место О1 у окна', x: 740, y: 89 },
    O2: { kind: 'stool', seats: 1, label: 'О2', full: 'место О2 у окна', x: 740, y: 144 },
    O3: { kind: 'stool', seats: 1, label: 'О3', full: 'место О3 у окна', x: 740, y: 347 },
    O4: { kind: 'stool', seats: 1, label: 'О4', full: 'место О4 у окна', x: 740, y: 437 },
  };
  const TOTAL_SEATS = Object.values(RES).reduce((s, r) => s + r.seats, 0);

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  };
  const text = (parent, x, y, str, cls, rot) => {
    const t = el('text', { x, y, class: cls, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, parent);
    if (rot) t.setAttribute('transform', `rotate(${rot} ${x} ${y})`);
    t.textContent = str;
    return t;
  };

  function buildFloor(host) {
    const svg = el('svg', { viewBox: '-14 -14 858 588', class: 'floor__svg' });
    const pat = el('pattern', { id: 'fl-hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, el('defs', {}, svg));
    el('rect', { width: 6, height: 6, fill: 'rgba(140,155,176,.08)' }, pat);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: 'rgba(140,155,176,.45)', 'stroke-width': 2 }, pat);
    // помещение и интерьер (не кликаются)
    const room = el('g', { class: 'floor__room', 'aria-hidden': 'true' }, svg);
    el('rect', { x: 0, y: 0, width: 830, height: 560, class: 'fl-floor' }, room);
    el('path', { d: 'M495 0H0V560H830V0H627', class: 'fl-wall' }, room);
    el('path', { d: 'M830 48V183M830 263V495', class: 'fl-window' }, room);
    el('rect', { x: 0, y: 0, width: 86, height: 435, class: 'fl-service' }, room);
    text(room, 40, 20, 'служебная', 'fl-label fl-label--xs');
    text(room, 40, 32, 'зона', 'fl-label fl-label--xs');
    el('rect', { x: 134, y: 8, width: 291, height: 26, class: 'fl-fixture' }, room);
    text(room, 279, 21, 'магазин', 'fl-label');
    el('rect', { x: 75, y: 40, width: 23, height: 170, class: 'fl-wood' }, room);
    text(room, 86, 125, 'касса', 'fl-label fl-label--xs', -90);
    el('rect', { x: 75, y: 211, width: 314, height: 26, class: 'fl-fixture' }, room);
    text(room, 232, 224, 'перегородка', 'fl-label fl-label--xs');
    el('rect', { x: 86, y: 237, width: 25, height: 198, class: 'fl-wood' }, room);
    text(room, 98, 336, 'барная стойка', 'fl-label fl-label--xs', -90);
    el('rect', { x: 484, y: 209, width: 258, height: 32, class: 'fl-aquarium' }, room);
    text(room, 613, 225, 'аквариум', 'fl-label fl-label--aqua');
    el('rect', { x: 484, y: 241, width: 258, height: 27, class: 'fl-wood' }, room);
    text(room, 613, 255, 'стойка', 'fl-label fl-label--xs');
    el('path', { d: 'M742 185V268', class: 'fl-wall fl-wall--thin' }, room);
    el('rect', { x: 766, y: 48, width: 60, height: 135, class: 'fl-wood' }, room);
    text(room, 796, 116, 'стойка', 'fl-label fl-label--xs', 90);
    el('rect', { x: 766, y: 281, width: 60, height: 214, class: 'fl-wood' }, room);
    text(room, 796, 388, 'стойка', 'fl-label fl-label--xs', 90);
    el('rect', { x: 129, y: 530, width: 421, height: 25, rx: 8, class: 'fl-fixture' }, room);
    text(room, 340, 543, 'диван', 'fl-label fl-label--xs');
    el('path', { d: 'M584 560V520L598 508H728V560', class: 'fl-wall fl-wall--thin fl-wc' }, room);
    el('path', { d: 'M598 560A30 30 0 0 1 626 532', class: 'fl-door' }, room);
    text(room, 662, 536, 'WC', 'fl-label');
    text(room, 561, 22, 'ВХОД', 'fl-label fl-label--strong');
    el('path', { d: 'M561 33V52M555 46L561 52L567 46', class: 'fl-arrow' }, room);

    // места
    for (const [id, r] of Object.entries(RES)) {
      const g = el('g', { class: `seat seat--${r.kind}`, 'data-res': id, role: 'button', tabindex: '0' }, svg);
      if (r.kind === 'table') {
        if (r.sofa) el('rect', { x: r.sofa[0], y: r.sofa[1], width: r.sofa[2], height: r.sofa[3], rx: 7, class: 'seat__sofa' }, g);
        for (const [cx, cy] of r.chairs) el('rect', { x: cx - 12, y: cy - 12, width: 24, height: 24, rx: 6, class: 'seat__chair' }, g);
        if (r.shape === 'round') {
          el('circle', { cx: r.x, cy: r.y, r: 46, class: 'seat__ring' }, g);
          el('circle', { cx: r.x, cy: r.y, r: 36, class: 'seat__top' }, g);
        } else {
          el('rect', { x: r.x - 46, y: r.y - 28, width: 92, height: 56, rx: 8, class: 'seat__ring' }, g);
          el('rect', { x: r.x - 38, y: r.y - 20, width: 76, height: 40, rx: 4, class: 'seat__top' }, g);
        }
        text(g, r.x, r.y - 6, id.slice(1), 'seat__num');
        text(g, r.x, r.y + 11, '4 места', 'seat__sub').setAttribute('data-sub', '');
      } else {
        el('circle', { cx: r.x, cy: r.y, r: 22, class: 'seat__ring' }, g);
        el('circle', { cx: r.x, cy: r.y, r: 16, class: 'seat__top' }, g);
        text(g, r.x, r.y + 1, r.label, 'seat__num seat__num--sm');
      }
      el('title', {}, g).textContent = r.kind === 'table' ? `${r.full}, до 4 гостей` : r.full;
    }
    host.appendChild(svg);
    const veil = document.createElement('div');
    veil.className = 'floor__veil';
    veil.hidden = true;
    host.appendChild(veil);
    return { svg, veil };
  }

  /* ---------- Время ---------- */
  const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const DAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  function humanDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]}, ${DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}`;
  }
  function mskNow() {
    const d = new Date(Date.now() + 180 * 60000);
    return { date: d.toISOString().slice(0, 10), min: d.getUTCHours() * 60 + d.getUTCMinutes() };
  }
  function addDays(iso, n) {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }

  /* ---------- Состояние ---------- */
  const dateIn = $('#b-date', form);
  const timeIn = $('#b-time', form);
  const guestsIn = $('#b-guests', form);
  const status = $('.form__status', form);
  const submit = $('.form__submit', form);
  const summary = $('[data-bk-summary]', form);
  const seatsErr = $('#b-seats-err', form);
  const done = $('[data-bk-done]');
  const { svg, veil } = buildFloor($('[data-floor]', form));

  const state = { busy: [], selected: new Set(), today: mskNow().date, nowMin: mskNow().min, loading: false, available: !!API };

  const interval = () => {
    const s = timeIn.value ? toMin(timeIn.value) : null;
    return s === null ? null : [s, Math.min(s + rules.duration, rules.close)];
  };
  const isTaken = (id, iv = interval()) => !!iv && state.busy.some(b => b.r === id && b.s < iv[1] && iv[0] < b.e);
  const capacity = () => [...state.selected].reduce((s, id) => s + RES[id].seats, 0);

  function freeSeatsAt(start) {
    const iv = [start, Math.min(start + rules.duration, rules.close)];
    return Object.keys(RES).reduce((s, id) => s + (isTaken(id, iv) ? 0 : RES[id].seats), 0);
  }

  function fillTimes() {
    const prev = timeIn.value;
    timeIn.innerHTML = '';
    const isToday = dateIn.value === state.today;
    let firstFree = '';
    for (let t = rules.open; t <= rules.lastStart; t += rules.step) {
      const o = document.createElement('option');
      o.value = hhmm(t);
      const end = hhmm(Math.min(t + rules.duration, rules.close));
      if (isToday && t <= state.nowMin) { o.disabled = true; o.textContent = `${hhmm(t)} — уже прошло`; }
      else {
        const free = freeSeatsAt(t);
        o.disabled = free === 0;
        o.textContent = free ? `${hhmm(t)}–${end} · свободно мест: ${free}` : `${hhmm(t)} — мест нет`;
        if (!o.disabled && !firstFree) firstFree = o.value;
      }
      timeIn.appendChild(o);
    }
    const keep = [...timeIn.options].find(o => o.value === prev && !o.disabled);
    const evening = [...timeIn.options].find(o => !o.disabled && toMin(o.value) >= 18 * 60);
    timeIn.value = keep ? prev : (evening ? evening.value : firstFree);
    if (!firstFree) {
      timeIn.innerHTML = '<option value="">На этот день мест нет</option>';
      timeIn.value = '';
    }
    timeIn.disabled = !firstFree;
  }

  /* ---------- Отрисовка ---------- */
  function render(changedByServer = []) {
    const iv = interval();
    for (const g of svg.querySelectorAll('.seat')) {
      const id = g.dataset.res;
      const taken = isTaken(id, iv);
      if (taken && state.selected.has(id)) state.selected.delete(id);
      const sel = state.selected.has(id);
      g.classList.toggle('is-taken', taken);
      g.classList.toggle('is-selected', sel);
      g.classList.toggle('is-off', !iv || !state.available);
      g.setAttribute('aria-pressed', String(sel));
      g.setAttribute('aria-disabled', String(taken || !iv || !state.available));
      g.setAttribute('aria-label', `${RES[id].full}${RES[id].kind === 'table' ? ', до 4 гостей' : ''}: ${taken ? 'занято' : sel ? 'выбрано' : 'свободно'}`);
      const sub = g.querySelector('[data-sub]');
      if (sub) sub.textContent = taken ? 'занято' : sel ? 'ваш стол' : '4 места';
    }
    if (changedByServer.length) {
      state.lostMsg = `Пока вы выбирали, эти места заняли: ${changedByServer.map(id => RES[id].full).join(', ')}. Выберите, пожалуйста, другие.`;
    }
    renderSummary();
  }

  function renderSummary() {
    const iv = interval();
    const ids = Object.keys(RES).filter(id => state.selected.has(id));
    const cap = capacity();
    const guests = +guestsIn.value || 0;
    const msgs = state.lostMsg ? [state.lostMsg] : [];
    if (!ids.length || !iv) {
      summary.textContent = iv ? 'Места пока не выбраны.' : '';
    } else {
      summary.innerHTML = '';
      const b = document.createElement('strong');
      b.textContent = ids.map(id => RES[id].full).join(', ');
      summary.append(b, ` · ${humanDate(dateIn.value)}, ${hhmm(iv[0])}–${hhmm(iv[1])} · мест: ${cap}`);
      if (guests > cap) msgs.push(`Выбрано мест на ${cap}, а гостей ${guests} — добавьте ещё стол или места у стойки.`);
    }
    if (msgs.length || state.autoMsg) seatsErr.textContent = msgs.join(' ');
    state.autoMsg = msgs.length > 0;
  }

  function unavailable(msg) {
    state.available = false;
    veil.hidden = false;
    veil.innerHTML = '';
    const p = document.createElement('p');
    p.append(msg + ' Забронируйте по телефону: ');
    const a = document.createElement('a');
    a.href = 'tel:+79052226272';
    a.textContent = PHONE;
    p.append(a);
    veil.appendChild(p);
    submit.disabled = true;
    render();
  }

  /* ---------- Сервер ---------- */
  async function loadDay(silent = false) {
    if (!API) { unavailable('Онлайн-бронирование скоро заработает.'); return; }
    const date = dateIn.value;
    if (!date) return;
    if (!silent) { state.loading = true; svg.classList.add('is-loading'); }
    try {
      const res = await fetch(`${API}/availability?date=${encodeURIComponent(date)}`);
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || res.status);
      if (date !== dateIn.value) return; // пока ждали, дату сменили
      rules = j.rules || rules;
      state.today = j.today || state.today;
      state.nowMin = j.nowMin ?? state.nowMin;
      const before = new Set([...state.selected].filter(id => !isTaken(id)));
      state.busy = j.busy || [];
      state.available = true;
      veil.hidden = true;
      submit.disabled = false;
      if (!silent) fillTimes();
      render([...before].filter(id => isTaken(id)));
    } catch {
      unavailable('Не удалось загрузить свободные места.');
    } finally {
      state.loading = false;
      svg.classList.remove('is-loading');
    }
  }

  /* ---------- Действия ---------- */
  function toggle(id) {
    if (!state.available || !interval() || isTaken(id)) return;
    seatsErr.textContent = '';
    state.lostMsg = '';
    if (state.selected.has(id)) state.selected.delete(id); else state.selected.add(id);
    render();
  }
  svg.addEventListener('click', e => {
    const g = e.target.closest('.seat');
    if (g) toggle(g.dataset.res);
  });
  svg.addEventListener('keydown', e => {
    const g = e.target.closest('.seat');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(g.dataset.res); }
  });

  dateIn.addEventListener('change', () => {
    F.validateField(dateIn);
    if (dateIn.value < dateIn.min || dateIn.value > dateIn.max) {
      F.setError(dateIn, 'Бронируем на ближайшие 30 дней');
      return;
    }
    state.selected.clear();
    seatsErr.textContent = '';
    state.lostMsg = '';
    loadDay();
  });
  timeIn.addEventListener('change', () => { seatsErr.textContent = ''; state.lostMsg = ''; render(); });
  timeIn.addEventListener('focus', () => loadDay(true));
  guestsIn.addEventListener('input', renderSummary);
  F.bindLiveValidation(form);

  // Раз в минуту обновляем занятость, пока вкладка открыта
  setInterval(() => { if (!document.hidden && state.available && !state.loading) loadDay(true); }, 60000);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.textContent = '';
    if (!state.available) return;
    const fields = [dateIn, guestsIn, $('#b-name', form), $('#b-phone', form)];
    let ok = F.validateForm(fields);
    if (!timeIn.value) { F.setError(timeIn, 'Выберите время'); ok = false; }
    const guests = +guestsIn.value;
    if (!state.selected.size) {
      seatsErr.textContent = 'Выберите места на схеме зала.';
      if (ok) svg.querySelector('.seat:not(.is-taken)')?.focus();
      ok = false;
    } else if (guests > capacity()) {
      renderSummary();
      ok = false;
    }
    if (!ok) return;

    const data = Object.fromEntries(new FormData(form));
    const body = { ...data, guests, resources: [...state.selected] };
    submit.disabled = true;
    submit.textContent = 'Бронируем…';
    try {
      const res = await fetch(`${API}/book`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) { showDone(j, guests); return; }
      if (res.status === 409) {
        state.busy = j.busy || state.busy;
        const lost = (j.taken || []).filter(id => state.selected.has(id));
        fillTimes();
        render(lost);
        seatsErr.scrollIntoView({ block: 'center', behavior: 'smooth' });
      } else if (res.status === 429) {
        status.textContent = `С этого номера на этот день уже две брони. Чтобы изменить их, позвоните: ${PHONE}`;
      } else if (res.status === 422) {
        const f = j.fields || {};
        if (f.time === 'past') F.setError(timeIn, 'Это время уже прошло — выберите другое');
        else if (f.time) F.setError(timeIn, 'Выберите время из списка');
        if (f.date) F.setError(dateIn, 'Бронируем на ближайшие 30 дней');
        if (f.phone) F.setError($('#b-phone', form), 'Введите номер в формате +7 (___) ___-__-__');
        if (f.name) F.setError($('#b-name', form), 'Укажите имя');
        if (f.guests) seatsErr.textContent = 'Гостей больше, чем выбранных мест.';
        if (!Object.keys(f).length) status.textContent = 'Проверьте поля формы.';
      } else {
        throw new Error(res.status);
      }
    } catch {
      status.textContent = `Не получилось отправить бронь. Позвоните нам: ${PHONE}`;
    } finally {
      submit.disabled = !state.available;
      submit.textContent = 'Забронировать';
    }
  });

  function showDone(j, guests) {
    $('[data-bk-done-when]', done).textContent = `${humanDate(j.date)}, ${j.start}–${j.end}`;
    $('[data-bk-done-where]', done).textContent =
      `${j.resources.map(id => RES[id] ? RES[id].full : id).join(', ')} · гостей: ${guests}`;
    form.hidden = true;
    done.hidden = false;
    done.focus();
    done.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  $('[data-bk-again]', done).addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
    form.reset();
    state.selected.clear();
    initDate();
    loadDay();
    dateIn.focus();
  });

  /* ---------- Старт ---------- */
  function initDate() {
    const now = mskNow();
    dateIn.min = now.date;
    dateIn.max = addDays(now.date, rules.horizonDays);
    dateIn.value = now.min < rules.lastStart - 30 ? now.date : addDays(now.date, 1);
  }
  initDate();
  fillTimes();
  render();
  loadDay();
})();
