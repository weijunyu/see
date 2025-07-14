-- Migration number: 0004 	 2025-07-14T03:26:04.500Z
DROP TABLE IF EXISTS appdata;
CREATE TABLE IF NOT EXISTS appdata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);
