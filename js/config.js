/*
 * Настройки сайта.
 * bookingEndpoint — адрес Cloudflare Worker с онлайн-бронированием по схеме зала
 * (см. worker/README.md). Пока адрес пустой, вместо схемы показывается телефон для брони.
 */
window.MM_CONFIG = {
  bookingEndpoint: 'https://miasomore-booking.mooorrriinaa.workers.dev',
};
