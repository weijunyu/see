-- Migration number: 0002 	 2025-07-14T02:58:33.950Z
DROP INDEX IF EXISTS idx_pages_name;
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_name ON Pages(name);
