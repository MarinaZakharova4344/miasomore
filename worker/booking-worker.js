/*
 * MясоMore — онлайн-бронирование столов по схеме зала.
 * Cloudflare Worker + база D1. Инструкция по настройке — worker/README.md.
 *
 * Привязки и переменные (Settings → Bindings / Variables and Secrets):
 *   DB               — база D1 (binding, имя переменной ровно DB)
 *   BOT_TOKEN        — токен Telegram-бота (Secret)
 *   CHAT_ID          — чат администратора, куда приходят брони
 *   ALLOWED_ORIGINS  — адреса сайта через запятую
 *   TG_SECRET        — (необязательно) секрет вебхука для кнопки «Отменить» и команды /today
 *
 * Маршруты:
 *   GET  /availability?date=YYYY-MM-DD  — занятость мест на день (без личных данных)
 *   POST /book                          — создать бронь
 *   POST /tg                            — вебхук Telegram (кнопки администратора)
 *   scheduled (Cron, раз в минуту)      — через 15 минут после начала брони спрашивает
 *                                         администратора: «Гости пришли?»
 */

// ---------- Правила ресторана ----------
const TZ_OFFSET_MIN = 180;          // Москва, UTC+3
const OPEN = 10 * 60;               // 10:00
const CLOSE = 22 * 60;              // 22:00
const STEP = 30;                    // шаг выбора времени
const DURATION = 180;               // бронь на 3 часа
const LAST_START = CLOSE - 60;      // последняя бронь — за час до закрытия
const LATE_MINUTES = 15;            // столько ждём опоздавших
const HORIZON_DAYS = 30;            // бронируем не дальше чем на 30 дней
const MAX_PER_PHONE_PER_DAY = 2;    // защита от «занять весь зал»
const REMIND_WINDOW = 60;           // напоминаем только о бронях, начавшихся за последний час

// Схема зала: стол бронируется целиком, места у стоек — по одному
const RESOURCES = {
  T1: { kind: 'table', seats: 4, label: 'Стол 1 (круглый)' },
  T2: { kind: 'table', seats: 4, label: 'Стол 2 (у дивана)' },
  T3: { kind: 'table', seats: 4, label: 'Стол 3 (у дивана)' },
  A1: { kind: 'stool', seats: 1, label: 'Стойка у аквариума, место А1' },
  A2: { kind: 'stool', seats: 1, label: 'Стойка у аквариума, место А2' },
  A3: { kind: 'stool', seats: 1, label: 'Стойка у аквариума, место А3' },
  O1: { kind: 'stool', seats: 1, label: 'Стойка у окна, место О1' },
  O2: { kind: 'stool', seats: 1, label: 'Стойка у окна, место О2' },
  O3: { kind: 'stool', seats: 1, label: 'Стойка у окна, место О3' },
  O4: { kind: 'stool', seats: 1, label: 'Стойка у окна, место О4' },
};

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY, date TEXT NOT NULL, start_min INTEGER NOT NULL, end_min INTEGER NOT NULL,
    name TEXT NOT NULL, phone TEXT NOT NULL, guests INTEGER NOT NULL, comment TEXT,
    resources TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'confirmed',
    created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS booking_items (
    booking_id TEXT NOT NULL REFERENCES bookings(id), resource TEXT NOT NULL, date TEXT NOT NULL,
    start_min INTEGER NOT NULL, end_min INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'active',
    CHECK (start_min < end_min))`,
  `CREATE INDEX IF NOT EXISTS idx_items_slot ON booking_items(date, resource, status)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone, date, status)`,
  `CREATE TRIGGER IF NOT EXISTS no_double_booking BEFORE INSERT ON booking_items
   WHEN NEW.status = 'active'
   BEGIN
     SELECT RAISE(ABORT, 'SEAT_TAKEN') FROM booking_items
     WHERE resource = NEW.resource AND date = NEW.date AND status = 'active'
       AND start_min < NEW.end_min AND NEW.start_min < end_min;
   END`,
];

// Колонки, добавленные позже: в существующую базу дописываются по одной
// (если колонка уже есть, SQLite вернёт ошибку — её пропускаем).
const MIGRATIONS = [
  `ALTER TABLE bookings ADD COLUMN reminded INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE bookings ADD COLUMN arrival TEXT`,          // arrived | no_show
];

const schemaReady = new WeakMap();
function ensureSchema(db) {
  if (!schemaReady.has(db)) {
    const job = (async () => {
      await db.batch(SCHEMA.map(sql => db.prepare(sql)));
      for (const sql of MIGRATIONS) await db.prepare(sql).run().catch(() => {});
    })().catch(err => { schemaReady.delete(db); throw err; });
    schemaReady.set(db, job);
  }
  return schemaReady.get(db);
}

// ---------- Время ----------
const DAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function nowMsk(ms = Date.now()) {
  const d = new Date(ms + TZ_OFFSET_MIN * 60000);
  return { date: d.toISOString().slice(0, 10), min: d.getUTCHours() * 60 + d.getUTCMinutes() };
}
function addDays(date, n) {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
function humanDate(date) {
  const [y, m, d] = date.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} (${DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]})`;
}
function isValidDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date + 'T00:00:00Z');
  return !isNaN(d) && d.toISOString().slice(0, 10) === date;
}
function checkDate(date) {
  if (!isValidDate(date)) return 'date';
  const today = nowMsk().date;
  if (date < today || date > addDays(today, HORIZON_DAYS)) return 'date_range';
  return null;
}

// ---------- Ответы ----------
function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : (allowed[0] || '*'),
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}
function originAllowed(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return !allowed.length || allowed.includes(request.headers.get('Origin') || '');
}
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// ---------- Занятость ----------
async function busyFor(db, date) {
  const { results } = await db.prepare(
    `SELECT resource AS r, start_min AS s, end_min AS e FROM booking_items
     WHERE date = ? AND status = 'active' ORDER BY start_min`).bind(date).all();
  return results;
}

async function handleAvailability(url, env, json) {
  const date = url.searchParams.get('date') || '';
  const err = checkDate(date);
  if (err) return json({ ok: false, error: err }, 400);
  await ensureSchema(env.DB);
  const now = nowMsk();
  return json({
    ok: true,
    date,
    rules: { open: OPEN, close: CLOSE, step: STEP, duration: DURATION, lastStart: LAST_START, lateMinutes: LATE_MINUTES, horizonDays: HORIZON_DAYS },
    today: now.date,
    nowMin: now.min,
    busy: await busyFor(env.DB, date),
  });
}

// ---------- Бронирование ----------
function validateBooking(d) {
  const errors = {};
  const name = String(d.name || '').trim();
  const digits = String(d.phone || '').replace(/\D/g, '');
  const date = String(d.date || '');
  const time = String(d.time || '');
  const guests = Number(d.guests);
  const comment = String(d.comment || '').trim();
  const resources = Array.isArray(d.resources) ? [...new Set(d.resources.map(String))] : [];

  if (name.length < 2 || name.length > 80) errors.name = 'name';
  if (digits.length !== 11 || digits[0] !== '7') errors.phone = 'phone';
  if (comment.length > 1000) errors.comment = 'comment';

  const dateErr = checkDate(date);
  if (dateErr) errors.date = dateErr;

  let start = NaN;
  if (/^\d{2}:\d{2}$/.test(time)) {
    const [h, m] = time.split(':').map(Number);
    start = h * 60 + m;
  }
  if (!(start >= OPEN && start <= LAST_START && start % STEP === 0)) errors.time = 'time';
  else if (!dateErr) {
    const now = nowMsk();
    if (date === now.date && start <= now.min) errors.time = 'past';
  }

  if (!resources.length || resources.length > 10 || resources.some(r => !RESOURCES[r])) errors.resources = 'resources';
  const capacity = resources.reduce((s, r) => s + (RESOURCES[r] ? RESOURCES[r].seats : 0), 0);
  if (!Number.isInteger(guests) || guests < 1 || guests > 19) errors.guests = 'guests';
  else if (!errors.resources && guests > capacity) errors.guests = 'capacity';

  const end = Math.min(start + DURATION, CLOSE);
  return { errors, value: { name, phone: digits, date, start, end, guests, comment, resources } };
}

async function handleBook(request, env, ctx, json) {
  if (!originAllowed(request, env)) return json({ ok: false, error: 'origin' }, 403);
  let d;
  try { d = await request.json(); } catch { return json({ ok: false, error: 'json' }, 400); }
  if (d.website) return json({ ok: true, id: 'ignored' }); // ловушка для ботов

  const { errors, value: b } = validateBooking(d);
  if (Object.keys(errors).length) return json({ ok: false, error: 'validation', fields: errors }, 422);

  const db = env.DB;
  await ensureSchema(db);

  const same = await db.prepare(
    `SELECT COUNT(*) AS n FROM bookings WHERE phone = ? AND date = ? AND status = 'confirmed'`).bind(b.phone, b.date).first();
  if (same && same.n >= MAX_PER_PHONE_PER_DAY) return json({ ok: false, error: 'limit' }, 429);

  // Вся бронь — одной транзакцией: если хотя бы одно место занято, триггер прерывает вставку
  // и не сохраняется ничего. D1 выполняет записи строго по очереди, поэтому из двух
  // одновременных запросов на одно место пройдёт ровно один.
  const id = crypto.randomUUID();
  const stmts = [
    db.prepare(`INSERT INTO bookings (id, date, start_min, end_min, name, phone, guests, comment, resources)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, b.date, b.start, b.end, b.name, b.phone, b.guests, b.comment || null, b.resources.join(',')),
    ...b.resources.map(r => db.prepare(
      `INSERT INTO booking_items (booking_id, resource, date, start_min, end_min) VALUES (?, ?, ?, ?, ?)`)
      .bind(id, r, b.date, b.start, b.end)),
  ];
  try {
    await db.batch(stmts);
  } catch (err) {
    if (!String(err && err.message).includes('SEAT_TAKEN')) throw err;
    const busy = await busyFor(db, b.date);
    const taken = b.resources.filter(r => busy.some(x => x.r === r && x.s < b.end && b.start < x.e));
    return json({ ok: false, error: 'taken', taken, busy }, 409);
  }

  const notify = sendTelegram(env, 'sendMessage', {
    chat_id: env.CHAT_ID,
    text: bookingText(id, b),
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: [[{ text: '❌ Отменить бронь', callback_data: `cancel:${id}` }]] },
  }).catch(() => {});
  if (ctx && ctx.waitUntil) ctx.waitUntil(notify); else await notify;

  return json({
    ok: true, id, date: b.date, start: hhmm(b.start), end: hhmm(b.end),
    resources: b.resources, labels: b.resources.map(r => RESOURCES[r].label), lateMinutes: LATE_MINUTES,
  });
}

function bookingText(id, b, status = '') {
  return [
    status || '✅ <b>Новая бронь</b> (подтверждена автоматически)',
    '',
    `📅 <b>${humanDate(b.date)}</b>, ${hhmm(b.start)}–${hhmm(b.end)}`,
    `🪑 ${b.resources.map(r => esc(RESOURCES[r] ? RESOURCES[r].label : r)).join(', ')}`,
    `👥 Гостей: <b>${b.guests}</b>`,
    `👤 ${esc(b.name)}`,
    `📞 +${b.phone}`,
    b.comment ? `💬 ${esc(b.comment)}` : null,
    '',
    `Ждём ${LATE_MINUTES} минут после начала, дальше места можно отдать.`,
    `<code>${id.slice(0, 8)}</code>`,
  ].filter(x => x !== null).join('\n');
}

async function sendTelegram(env, method, payload) {
  if (!env.BOT_TOKEN || !env.CHAT_ID) return null;
  const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.ok ? res.json() : null;
}

// ---------- Telegram: кнопка «Отменить» и /today ----------
async function handleTelegram(request, env, json) {
  if (!env.TG_SECRET || request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.TG_SECRET) {
    return json({ ok: false }, 403);
  }
  const u = await request.json().catch(() => ({}));
  const db = env.DB;
  await ensureSchema(db);
  const adminChat = String(env.CHAT_ID);

  const cq = u.callback_query;
  const m = cq && /^(cancel|arrived|noshow):(.+)$/.exec(cq.data || '');
  if (m && String(cq.message && cq.message.chat && cq.message.chat.id) === adminChat) {
    const [, action, id] = m;
    const row = await db.prepare(`SELECT * FROM bookings WHERE id = ?`).bind(id).first();
    let answer = 'Бронь не найдена';
    let header = null;
    if (row && row.status !== 'confirmed') {
      answer = 'Эта бронь уже закрыта';
    } else if (row && action === 'noshow' && row.arrival === 'arrived') {
      answer = 'Гости уже отмечены как пришедшие — бронь не снята';
    } else if (row && action === 'arrived') {
      await db.prepare(`UPDATE bookings SET arrival = 'arrived' WHERE id = ?`).bind(id).run();
      answer = 'Отмечено: гости пришли';
      header = '✅ <b>Гости пришли</b>';
    } else if (row) {
      const noShow = action === 'noshow';
      await db.batch([
        db.prepare(`UPDATE bookings SET status = ?, arrival = ? WHERE id = ?`)
          .bind(noShow ? 'no_show' : 'cancelled', noShow ? 'no_show' : row.arrival, id),
        db.prepare(`UPDATE booking_items SET status = 'cancelled' WHERE booking_id = ?`).bind(id),
      ]);
      answer = noShow ? 'Бронь снята — места свободны' : 'Бронь отменена';
      header = noShow
        ? '🚫 <b>Гости не пришли</b> — бронь снята, места снова свободны'
        : '❌ <b>Бронь отменена</b> — места снова свободны';
    }
    if (header) {
      const b = { ...row, start: row.start_min, end: row.end_min, resources: row.resources.split(',') };
      await sendTelegram(env, 'editMessageText', {
        chat_id: adminChat, message_id: cq.message.message_id, parse_mode: 'HTML',
        text: bookingText(id, b, header),
      });
    }
    await sendTelegram(env, 'answerCallbackQuery', { callback_query_id: cq.id, text: answer });
    return json({ ok: true });
  }

  const msg = u.message;
  if (msg && String(msg.chat && msg.chat.id) === adminChat && /^\/(today|tomorrow)\b/.test(msg.text || '')) {
    const date = msg.text.startsWith('/tomorrow') ? addDays(nowMsk().date, 1) : nowMsk().date;
    const { results } = await db.prepare(
      `SELECT * FROM bookings WHERE date = ? AND status = 'confirmed' ORDER BY start_min`).bind(date).all();
    const lines = results.map(r =>
      `${r.arrival === 'arrived' ? '✅ ' : ''}${hhmm(r.start_min)}–${hhmm(r.end_min)} · ${r.resources.split(',').map(x => RESOURCES[x] ? RESOURCES[x].label : x).join(', ')} · ${r.guests} гост. · ${esc(r.name)} +${r.phone}`);
    await sendTelegram(env, 'sendMessage', {
      chat_id: adminChat, parse_mode: 'HTML',
      text: `📋 <b>Брони на ${humanDate(date)}</b>\n\n${lines.length ? lines.join('\n') : 'Броней нет.'}`,
    });
  }
  return json({ ok: true });
}

// ---------- Напоминание «Гости пришли?» (Cron) ----------
async function remindArrivals(env, ms = Date.now()) {
  if (!env.DB) return 0;
  const db = env.DB;
  await ensureSchema(db);
  const now = nowMsk(ms);
  const due = now.min - LATE_MINUTES;   // брони, у которых 15 минут ожидания уже прошли
  const { results } = await db.prepare(
    `SELECT * FROM bookings
     WHERE date = ? AND status = 'confirmed' AND reminded = 0 AND arrival IS NULL
       AND start_min <= ? AND start_min > ?
     ORDER BY start_min`).bind(now.date, due, due - REMIND_WINDOW).all();

  let sent = 0;
  for (const r of results) {
    // Сначала «забираем» бронь, потом пишем: если проверка вдруг запустится дважды,
    // напоминание всё равно уйдёт один раз.
    const claim = await db.prepare(`UPDATE bookings SET reminded = 1 WHERE id = ? AND reminded = 0`).bind(r.id).run();
    const changes = claim && (claim.meta ? claim.meta.changes : claim.changes);
    if (!changes) continue;
    const places = r.resources.split(',').map(x => RESOURCES[x] ? RESOURCES[x].label : x).join(', ');
    await sendTelegram(env, 'sendMessage', {
      chat_id: env.CHAT_ID,
      parse_mode: 'HTML',
      text: [
        `⏰ <b>${hhmm(r.start_min + LATE_MINUTES)} — гости по брони на ${hhmm(r.start_min)} пришли?</b>`,
        '',
        `🪑 ${esc(places)}`,
        `👥 Гостей: ${r.guests}`,
        `👤 ${esc(r.name)}`,
        `📞 +${r.phone}`,
        '',
        'Если не пришли — нажмите «Не пришли», и места сразу освободятся на сайте.',
      ].join('\n'),
      reply_markup: { inline_keyboard: [[
        { text: '✅ Пришли', callback_data: `arrived:${r.id}` },
        { text: '🚫 Не пришли — освободить', callback_data: `noshow:${r.id}` },
      ]] },
    }).catch(() => {});
    sent++;
  }
  return sent;
}

// ---------- Точка входа ----------
export default {
  async fetch(request, env, ctx) {
    const cors = corsHeaders(request, env);
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(request.url);

    try {
      if (url.pathname === '/tg' && request.method === 'POST') return await handleTelegram(request, env, json);
      if (!env.DB) return json({ ok: false, error: 'no_db' }, 503);
      if (url.pathname === '/availability' && request.method === 'GET') return await handleAvailability(url, env, json);
      if (url.pathname === '/book' && request.method === 'POST') return await handleBook(request, env, ctx, json);
      return json({ ok: false, error: 'not_found' }, 404);
    } catch (err) {
      return json({ ok: false, error: 'server' }, 500);
    }
  },

  // Cron Trigger (Settings → Trigger events → Cron: каждую минуту)
  async scheduled(event, env, ctx) {
    const job = remindArrivals(env, event && event.scheduledTime ? event.scheduledTime : Date.now());
    if (ctx && ctx.waitUntil) ctx.waitUntil(job); else await job;
  },
};

export const _internal = { RESOURCES, validateBooking, nowMsk, hhmm, remindArrivals, OPEN, CLOSE, DURATION, LAST_START, STEP };
