-- Migration script to add isFavourite column to existing Notes table
-- This script is idempotent and can be run multiple times safely

-- Check if column exists before adding
IF NOT EXISTS (
  SELECT * FROM sys.columns 
  WHERE object_id = OBJECT_ID(N'Notes') 
  AND name = 'isFavourite'
)
BEGIN
  ALTER TABLE Notes
  ADD isFavourite BIT DEFAULT 0;
  
  -- Update existing rows to have default value
  UPDATE Notes SET isFavourite = 0 WHERE isFavourite IS NULL;
  
  PRINT 'isFavourite column added successfully';
END
ELSE
BEGIN
  PRINT 'isFavourite column already exists';
END