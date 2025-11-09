-- Migration: Add verified address fields to profiles table and waitlist table
-- Run this in Supabase SQL editor

-- ============================================
-- PROFILES TABLE: Add verified address fields
-- ============================================

-- Add custody address (Farcaster wallet)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS custody_address TEXT;

-- Add array of verified ETH addresses
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verified_eth_addresses TEXT[] DEFAULT '{}';

-- Add primary ETH address
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS primary_eth_address TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_custody_address ON profiles(custody_address);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_eth_address ON profiles(primary_eth_address);

-- ============================================
-- WAITLIST TABLE: Add username, display_name, pfp_url
-- (eth_addresses and custody_address already exist)
-- ============================================

-- Add new columns if they don't exist
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS pfp_url TEXT;

-- Create index on custody_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_custody_address ON waitlist(custody_address);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_username ON waitlist(username);
