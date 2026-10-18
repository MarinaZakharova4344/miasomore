/*
 * MясоMore — приём заявок на бронирование и отправка их в Telegram.
 * Cloudflare Worker. Токен бота хранится в настройках Worker'а, а не в коде сайта.
 *
 * Переменные (Settings → Variables and Secrets):
 *   BOT_TOKEN        — токен бота от @BotFather (тип Secret)
 *   CHAT_ID          — id чата, куда слать заявки (ваш личный или группы)
 *   ALLOWED_ORIGINS  — адреса сайта через запятую, например:
 *                      https://marinazakharova4344.github.io
 */

const DAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : (allowed[0] || '*'),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    const reply = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return reply({ ok: false, error: 'method' }, 405);
    if (allowed.length && !allowed.includes(origin)) return reply({ ok: false, error: 'origin' }, 403);

    let d;
    try { d = await request.json(); } catch { return reply({ ok: false, error: 'json' }, 400); }

    // Ловушка для ботов: настоящий посетитель это поле не видит и не заполняет
    if (d.website) return reply({ ok: true });

    const name = String(d.name || '').trim();
    const phone = String(d.phone || '').trim();
    const digits = phone.replace(/\D/g, '');
    const date = String(d.date || '');
    const time = String(d.time || '');
    const guests = Number(d.guests);
    const comment = String(d.comment || '').trim();

    const valid = name.length >= 2 && name.length <= 80
      && digits.length === 11
      && /^\d{4}-\d{2}-\d{2}$/.test(date)
      && /^\d{2}:\d{2}$/.test(time)
      && Number.isInteger(guests) && guests >= 1 && guests <= 20
      && comment.length <= 1000;
    if (!valid) return reply({ ok: false, error: 'validation' }, 422);

    const [y, m, day] = date.split('-').map(Number);
    const weekday = DAYS[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
    const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

    const text = [
      '🍽 <b>Новая заявка на бронь</b>',
      '',
      `📅 <b>${String(day).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}</b> (${weekday}), ${time}`,
      `👥 Гостей: <b>${guests}</b>`,
      `👤 ${esc(name)}`,
      `📞 +${digits}`,
      comment ? `💬 ${esc(comment)}` : '',
      '',
      'Перезвоните гостю, чтобы подтвердить стол.',
    ].filter((line, i, arr) => line !== '' || arr[i - 1] !== '').join('\n');

    const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text, parse_mode: 'HTML' }),
    });
    if (!tg.ok) return reply({ ok: false, error: 'telegram' }, 502);

    return reply({ ok: true });
  },
};
