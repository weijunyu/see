-- Migration number: 0008 	 2025-07-16T03:05:29.321Z
ALTER TABLE Pages ADD COLUMN deleted_at INTEGER;
CREATE INDEX IF NOT EXISTS idx_pages_deleted_at ON Pages(deleted_at);
