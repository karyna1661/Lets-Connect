-- Migration: Add username, display_name, pfp_url to waitlist table
-- Run this in Supabase SQL editor

-- Add new columns if they don't exist
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS pfp_url TEXT;

-- Create index on custody_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_custody_address ON waitlist(custody_address);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_username ON waitlist(username);
