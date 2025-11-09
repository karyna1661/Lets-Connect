-- Waitlist table for Farcaster Frame join flow
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fid INTEGER UNIQUE NOT NULL,
  username TEXT,
  display_name TEXT,
  pfp_url TEXT,
  eth_addresses TEXT[] DEFAULT '{}',
  custody_address TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'frame'
);

CREATE INDEX IF NOT EXISTS idx_waitlist_fid ON waitlist(fid);
CREATE INDEX IF NOT EXISTS idx_waitlist_custody_address ON waitlist(custody_address);

-- Secure by default: enable RLS, no public policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
