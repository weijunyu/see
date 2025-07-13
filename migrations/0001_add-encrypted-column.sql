-- Migration number: 0001 	 2025-07-13T02:33:33.496Z

-- Add encrypted column to Pages table
ALTER TABLE Pages ADD COLUMN encrypted BOOLEAN DEFAULT FALSE;
