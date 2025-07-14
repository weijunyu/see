-- Migration number: 0007 	 2025-07-14T03:43:47.895Z
DROP TABLE IF EXISTS appdata;
CREATE TABLE IF NOT EXISTS appdata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    text_value TEXT,
    integer_value INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

INSERT INTO appdata (key, integer_value) VALUES ('page_name_counter', 0);