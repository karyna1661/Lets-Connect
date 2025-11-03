-- Add v2 fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Other';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_discoverable BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_sharing TEXT DEFAULT 'off';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_hash TEXT;

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  wallet_hash TEXT NOT NULL,
  ens_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create POAPs table
CREATE TABLE IF NOT EXISTS poaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  poap_hash TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_id INTEGER,
  event_date TIMESTAMP WITH TIME ZONE,
  event_image_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, poap_hash)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE,
  city TEXT,
  poap_event_id INTEGER UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
  shared_poap_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_user_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id TEXT NOT NULL,
  user_b_id TEXT NOT NULL,
  shared_poaps TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_a_id, user_b_id)
);

-- Add connection_type to connections table
ALTER TABLE connections ADD COLUMN IF NOT EXISTS connection_type TEXT DEFAULT 'qr';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_poaps_user_id ON poaps(user_id);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON matches(user_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON matches(user_b_id);
CREATE INDEX IF NOT EXISTS idx_profiles_discoverable ON profiles(is_discoverable);

-- Enable RLS on new tables
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE poaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallets (users can only see their own)
CREATE POLICY "Users can read their own wallet" ON wallets
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own wallet" ON wallets
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own wallet" ON wallets
  FOR UPDATE USING (auth.uid()::text = user_id);

-- RLS policies for POAPs (users can see POAPs from discoverable profiles or their own)
CREATE POLICY "Users can read POAPs from discoverable profiles" ON poaps
  FOR SELECT USING (
    auth.uid()::text = user_id OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = poaps.user_id AND p.is_discoverable = true
    )
  );

CREATE POLICY "Users can insert their own POAPs" ON poaps
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own POAPs" ON poaps
  FOR UPDATE USING (auth.uid()::text = user_id);

-- RLS policies for events (anyone can read)
CREATE POLICY "Anyone can read events" ON events
  FOR SELECT USING (true);

-- RLS policies for swipes (users can only manage their own)
CREATE POLICY "Users can read their own swipes" ON swipes
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own swipes" ON swipes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS policies for matches (users can only see their own matches)
CREATE POLICY "Users can read their own matches" ON matches
  FOR SELECT USING (
    auth.uid()::text = user_a_id OR
    auth.uid()::text = user_b_id
  );

CREATE POLICY "Users can insert matches" ON matches
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_a_id OR
    auth.uid()::text = user_b_id
  );
