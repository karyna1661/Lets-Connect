-- Add missing social media fields and visibility preferences to profiles table
-- This migration adds support for GitHub, Facebook, YouTube, Website, Farcaster, and Phone/WhatsApp
-- Also adds social_visibility JSONB field for controlling which fields appear in QR codes

-- Add new social media fields
ALTER TABLE profiles 
ADD COLUMN github TEXT,
ADD COLUMN facebook TEXT,
ADD COLUMN youtube TEXT,
ADD COLUMN website TEXT,
ADD COLUMN farcaster TEXT,
ADD COLUMN phone TEXT;

-- Add social visibility preferences field
-- Default empty JSON object means all fields visible (backward compatibility)
ALTER TABLE profiles 
ADD COLUMN social_visibility JSONB DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN profiles.github IS 'GitHub profile URL';
COMMENT ON COLUMN profiles.facebook IS 'Facebook profile URL';
COMMENT ON COLUMN profiles.youtube IS 'YouTube channel URL';
COMMENT ON COLUMN profiles.website IS 'Personal website URL';
COMMENT ON COLUMN profiles.farcaster IS 'Farcaster username';
COMMENT ON COLUMN profiles.phone IS 'Phone number or WhatsApp';
COMMENT ON COLUMN profiles.social_visibility IS 'JSON object mapping field names to visibility boolean (true=visible in QR, false=hidden)';

-- Create index on social_visibility for better query performance
CREATE INDEX idx_profiles_social_visibility ON profiles USING GIN (social_visibility);
