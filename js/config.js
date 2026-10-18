/*
 * Настройки сайта.
 * bookingEndpoint — адрес Cloudflare Worker, который пересылает заявки на бронь в Telegram
 * (см. worker/README.md). Пока адрес пустой, форма работает как раньше: заявка никуда не уходит.
 */
window.MM_CONFIG = {
  bookingEndpoint: 'https://miasomore-booking.mooorrriinaa.workers.dev',
};
