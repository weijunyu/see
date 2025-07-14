-- Migration number: 0006 	 2025-07-14T03:41:11.295Z
DROP TABLE IF EXISTS appdata;
CREATE TABLE IF NOT EXISTS appdata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    numeric_value INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

INSERT INTO appdata (key, numeric_value) VALUES ('page_name_counter', 0);