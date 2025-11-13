-- Migration: Add all social media fields to profiles table
-- Run this in Supabase SQL editor

-- Add wallet_address field (separate from wallet_hash)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Add social media fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS x TEXT,
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS farcaster TEXT,
ADD COLUMN IF NOT EXISTS telegram TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT,
ADD COLUMN IF NOT EXISTS youtube TEXT,
ADD COLUMN IF NOT EXISTS ens TEXT,
ADD COLUMN IF NOT EXISTS zora TEXT,
ADD COLUMN IF NOT EXISTS paragraph TEXT,
ADD COLUMN IF NOT EXISTS substack TEXT,
ADD COLUMN IF NOT EXISTS username TEXT;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_farcaster ON profiles(farcaster);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_ens ON profiles(ens);

-- Add comment
COMMENT ON COLUMN profiles.wallet_address IS 'Ethereum wallet address from Farcaster or Privy wallet connection';
COMMENT ON COLUMN profiles.x IS 'X (formerly Twitter) handle';
COMMENT ON COLUMN profiles.github IS 'GitHub username';
COMMENT ON COLUMN profiles.farcaster IS 'Farcaster username';
COMMENT ON COLUMN profiles.telegram IS 'Telegram username';
COMMENT ON COLUMN profiles.tiktok IS 'TikTok username';
COMMENT ON COLUMN profiles.youtube IS 'YouTube channel URL';
COMMENT ON COLUMN profiles.ens IS 'ENS domain name';
COMMENT ON COLUMN profiles.zora IS 'Zora profile URL';
COMMENT ON COLUMN profiles.paragraph IS 'Paragraph username';
COMMENT ON COLUMN profiles.substack IS 'Substack URL';
