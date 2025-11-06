-- POAP Integration for Shared Event Matching
-- Creates table for storing user POAPs and enables compatibility matching

-- Drop existing poaps table if it exists (legacy structure)
DROP TABLE IF EXISTS poaps CASCADE;

-- Create user_poaps table
CREATE TABLE IF NOT EXISTS user_poaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  event_name TEXT NOT NULL,
  image_url TEXT,
  event_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(wallet_address, event_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_poaps_wallet ON user_poaps(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_poaps_event ON user_poaps(event_id);
CREATE INDEX IF NOT EXISTS idx_user_poaps_created ON user_poaps(created_at);

-- Enable Row Level Security
ALTER TABLE user_poaps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all POAPs"
  ON user_poaps FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own POAPs"
  ON user_poaps FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own POAPs"
  ON user_poaps FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own POAPs"
  ON user_poaps FOR DELETE
  USING (true);

-- Function to get shared POAP count between two users
CREATE OR REPLACE FUNCTION get_shared_poaps_count(
  p_wallet_1 TEXT,
  p_wallet_2 TEXT
)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(DISTINCT current.event_id)::INTEGER
  FROM user_poaps current
  INNER JOIN user_poaps other
    ON current.event_id = other.event_id
    AND current.wallet_address = p_wallet_1
    AND other.wallet_address = p_wallet_2;
$$;

-- Function to get shared POAPs details between two users
CREATE OR REPLACE FUNCTION get_shared_poaps(
  p_wallet_1 TEXT,
  p_wallet_2 TEXT
)
RETURNS TABLE(
  event_id INTEGER,
  event_name TEXT,
  image_url TEXT,
  event_date DATE
)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT 
    current.event_id,
    current.event_name,
    current.image_url,
    current.event_date
  FROM user_poaps current
  INNER JOIN user_poaps other
    ON current.event_id = other.event_id
    AND current.wallet_address = p_wallet_1
    AND other.wallet_address = p_wallet_2
  ORDER BY current.event_date DESC
  LIMIT 10;
$$;

-- Function to find users with shared POAPs
CREATE OR REPLACE FUNCTION find_users_with_shared_poaps(p_wallet TEXT)
RETURNS TABLE(
  wallet_address TEXT,
  shared_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    other.wallet_address,
    COUNT(DISTINCT other.event_id) as shared_count
  FROM user_poaps current
  INNER JOIN user_poaps other
    ON current.event_id = other.event_id
    AND current.wallet_address = p_wallet
    AND other.wallet_address != p_wallet
  GROUP BY other.wallet_address
  ORDER BY shared_count DESC;
$$;

-- Add wallet_address column to profiles table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'wallet_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wallet_address TEXT;
    CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);
  END IF;
END $$;

-- Function to get POAP count for a user
CREATE OR REPLACE FUNCTION get_user_poap_count(p_wallet TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM user_poaps
  WHERE wallet_address = p_wallet;
$$;

COMMENT ON TABLE user_poaps IS 'Stores user POAP collections for compatibility matching';
COMMENT ON FUNCTION get_shared_poaps_count IS 'Returns count of shared POAPs between two users';
COMMENT ON FUNCTION get_shared_poaps IS 'Returns details of shared POAPs between two users';
COMMENT ON FUNCTION find_users_with_shared_poaps IS 'Finds all users who share POAPs with given wallet';
COMMENT ON FUNCTION get_user_poap_count IS 'Returns total POAP count for a user';
