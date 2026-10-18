// Тесты бронирования: node --test worker/test/
// D1 подменяется обёрткой над встроенным SQLite из Node — тот же SQL, тот же триггер,
// batch выполняется одной транзакцией, как в D1.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker, { _internal } from '../booking-worker.js';

class FakeD1 {
  constructor() { this.db = new DatabaseSync(':memory:'); }
  prepare(sql) {
    const db = this.db;
    const stmt = {
      args: [],
      bind(...a) { return { ...stmt, args: a }; },
      _run() { return db.prepare(sql).run(...this.args); },
      async all() { return { results: db.prepare(sql).all(...this.args) }; },
      async first() { return db.prepare(sql).get(...this.args) ?? null; },
      async run() { return this._run(); },
    };
    return stmt;
  }
  async batch(stmts) {
    this.db.exec('BEGIN');
    try {
      const out = stmts.map(s => s._run());
      this.db.exec('COMMIT');
      return out;
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
  }
}

const ORIGIN = 'https://marinazakharova4344.github.io';
let env;
beforeEach(() => { env = { DB: new FakeD1(), ALLOWED_ORIGINS: ORIGIN }; });

const tomorrow = (() => {
  const d = new Date(_internal.nowMsk().date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
})();

let phoneSeq = 0;
function book(over = {}) {
  phoneSeq++;
  const body = {
    name: 'Анна', phone: `+7 (900) 000-${String(phoneSeq).padStart(2, '0')}-00`.replace(/(\d{2})-00$/, '$1-11'),
    date: tomorrow, time: '19:00', guests: 2, resources: ['T1'], comment: '', website: '', ...over,
  };
  return worker.fetch(new Request('https://w.dev/book', {
    method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }), env, { waitUntil() {} });
}
const availability = date =>
  worker.fetch(new Request(`https://w.dev/availability?date=${date}`, { headers: { Origin: ORIGIN } }), env, {});

test('бронь проходит и занимает стол на 3 часа', async () => {
  const r = await book();
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.start, '19:00');
  assert.equal(j.end, '22:00');
  const a = await (await availability(tomorrow)).json();
  assert.deepEqual(a.busy, [{ r: 'T1', s: 19 * 60, e: 22 * 60 }]);
  assert.ok(!JSON.stringify(a).includes('Анна'), 'занятость не раскрывает личные данные');
});

test('пересекающаяся бронь того же стола отклоняется', async () => {
  assert.equal((await book({ time: '18:00' })).status, 200);
  const r = await book({ time: '20:30' });
  assert.equal(r.status, 409);
  assert.deepEqual((await r.json()).taken, ['T1']);
});

test('бронь встык (16:00–19:00 и 19:00–22:00) разрешена', async () => {
  assert.equal((await book({ time: '16:00' })).status, 200);
  assert.equal((await book({ time: '19:00' })).status, 200);
});

test('одновременные запросы на одно место: проходит ровно один', async () => {
  const res = await Promise.all(Array.from({ length: 20 }, () => book({ resources: ['A1'], guests: 1 })));
  const codes = res.map(r => r.status);
  assert.equal(codes.filter(c => c === 200).length, 1);
  assert.equal(codes.filter(c => c === 409).length, 19);
  const { results } = await env.DB.prepare(`SELECT COUNT(*) AS n FROM bookings`).all();
  assert.equal(results[0].n, 1, 'в базе ровно одна бронь');
});

test('бронь нескольких мест атомарна: если одно занято, не сохраняется ни одно', async () => {
  assert.equal((await book({ resources: ['A3'], guests: 1 })).status, 200);
  const r = await book({ resources: ['A2', 'A3'], guests: 2 });
  assert.equal(r.status, 409);
  assert.deepEqual((await r.json()).taken, ['A3']);
  const a = await (await availability(tomorrow)).json();
  assert.ok(!a.busy.some(x => x.r === 'A2'), 'A2 осталось свободным');
});

test('гостей не больше, чем мест', async () => {
  const r = await book({ resources: ['O1', 'O2'], guests: 3 });
  assert.equal(r.status, 422);
  assert.equal((await r.json()).fields.guests, 'capacity');
});

test('проверка времени и мест', async () => {
  for (const [over, field] of [
    [{ time: '09:30' }, 'time'], [{ time: '21:30' }, 'time'], [{ time: '19:15' }, 'time'],
    [{ resources: ['X9'] }, 'resources'], [{ resources: [] }, 'resources'],
    [{ date: '2020-01-01' }, 'date'], [{ phone: '123' }, 'phone'],
  ]) {
    const r = await book(over);
    assert.equal(r.status, 422, JSON.stringify(over));
    assert.ok((await r.json()).fields[field], field);
  }
});

test('поздняя бронь заканчивается к закрытию', async () => {
  const j = await (await book({ time: '21:00' })).json();
  assert.equal(j.end, '22:00');
});

test('не больше двух броней на один телефон в день', async () => {
  const phone = '+7 (911) 111-22-33';
  assert.equal((await book({ phone, resources: ['A1'], guests: 1, time: '12:00' })).status, 200);
  assert.equal((await book({ phone, resources: ['A2'], guests: 1, time: '12:00' })).status, 200);
  assert.equal((await book({ phone, resources: ['A3'], guests: 1, time: '12:00' })).status, 429);
});

test('запрос с чужого сайта отклоняется', async () => {
  const r = await worker.fetch(new Request('https://w.dev/book', {
    method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{}',
  }), env, {});
  assert.equal(r.status, 403);
});

test('отмена через кнопку в Telegram освобождает место', async () => {
  env.TG_SECRET = 's3cret'; env.CHAT_ID = '42';
  const { id } = await (await book({ resources: ['T2'], guests: 4 })).json();
  const r = await worker.fetch(new Request('https://w.dev/tg', {
    method: 'POST',
    headers: { 'X-Telegram-Bot-Api-Secret-Token': 's3cret', 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query: { id: 'q', data: `cancel:${id}`, message: { message_id: 1, chat: { id: 42 } } } }),
  }), env, {});
  assert.equal(r.status, 200);
  assert.equal((await book({ resources: ['T2'], guests: 4 })).status, 200, 'стол снова можно забронировать');
});

test('вебхук без секрета отклоняется', async () => {
  env.TG_SECRET = 's3cret';
  const r = await worker.fetch(new Request('https://w.dev/tg', { method: 'POST', body: '{}' }), env, {});
  assert.equal(r.status, 403);
});
