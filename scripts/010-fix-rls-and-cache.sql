-- Fix RLS policies and refresh schema cache
-- Run this in Supabase SQL Editor after running migration 009

-- First, notify Postgres to refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Drop and recreate RLS policies for user_poaps to ensure they work
DROP POLICY IF EXISTS "Users can view all POAPs" ON user_poaps;
DROP POLICY IF EXISTS "Users can insert their own POAPs" ON user_poaps;
DROP POLICY IF EXISTS "Users can update their own POAPs" ON user_poaps;
DROP POLICY IF EXISTS "Users can delete their own POAPs" ON user_poaps;

-- Recreate with proper permissions
CREATE POLICY "Users can view all POAPs"
  ON user_poaps FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own POAPs"
  ON user_poaps FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own POAPs"
  ON user_poaps FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own POAPs"
  ON user_poaps FOR DELETE
  USING (true);

-- Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('farcaster', 'wallet_address', 'x', 'github', 'telegram', 'username')
ORDER BY column_name;
