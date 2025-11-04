-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  twitter TEXT,
  instagram TEXT,
  bio TEXT,
  profile_image TEXT,
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  connected_user_id TEXT NOT NULL,
  connection_data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_connected_user_id ON connections(connected_user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own connections" ON connections;
DROP POLICY IF EXISTS "Users can insert their own connections" ON connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON connections;

-- Create placeholder policies (will be replaced by script 002 with secure auth-based policies)
CREATE POLICY "Anyone can read profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (true);

-- Create policies for connections (users can only see and manage their own connections)
CREATE POLICY "Users can read their own connections" ON connections
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own connections" ON connections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own connections" ON connections
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own connections" ON connections
  FOR DELETE USING (true);
