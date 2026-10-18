-- MясоMore — схема базы бронирования (Cloudflare D1 / SQLite).
-- Worker применяет её сам при первом запросе, вручную запускать не нужно.

-- Бронь гостя. Время хранится в минутах от полуночи по Москве.
CREATE TABLE IF NOT EXISTS bookings (
  id         TEXT PRIMARY KEY,
  date       TEXT NOT NULL,              -- YYYY-MM-DD
  start_min  INTEGER NOT NULL,
  end_min    INTEGER NOT NULL,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,              -- 11 цифр, 7XXXXXXXXXX
  guests     INTEGER NOT NULL,
  comment    TEXT,
  resources  TEXT NOT NULL,              -- T1,A2,… для удобства чтения
  status     TEXT NOT NULL DEFAULT 'confirmed',   -- confirmed | cancelled
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Что именно занято: по строке на стол или место у стойки.
CREATE TABLE IF NOT EXISTS booking_items (
  booking_id TEXT NOT NULL REFERENCES bookings(id),
  resource   TEXT NOT NULL,              -- T1..T3 (стол целиком), A1..A3, O1..O4
  date       TEXT NOT NULL,
  start_min  INTEGER NOT NULL,
  end_min    INTEGER NOT NULL,
  status     TEXT NOT NULL DEFAULT 'active',      -- active | cancelled
  CHECK (start_min < end_min)
);

CREATE INDEX IF NOT EXISTS idx_items_slot ON booking_items(date, resource, status);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone, date, status);

-- Защита от двойного бронирования на уровне базы: аналог exclusion constraint.
-- Вставка места, пересекающегося по времени с активной бронью того же места, прерывается,
-- а вместе с ней откатывается вся бронь (Worker пишет её одной транзакцией).
CREATE TRIGGER IF NOT EXISTS no_double_booking
BEFORE INSERT ON booking_items
WHEN NEW.status = 'active'
BEGIN
  SELECT RAISE(ABORT, 'SEAT_TAKEN')
  FROM booking_items
  WHERE resource = NEW.resource
    AND date = NEW.date
    AND status = 'active'
    AND start_min < NEW.end_min
    AND NEW.start_min < end_min;
END;
