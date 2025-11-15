-- Optimize POAP-based matching with precomputed scores and efficient batch queries
-- This eliminates N+1 queries and enables sub-second discovery page loads

-- 1. Create index for fast POAP lookups
CREATE INDEX IF NOT EXISTS idx_user_poaps_composite ON user_poaps(event_id, wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_discoverable ON profiles(wallet_address, is_discoverable) WHERE is_discoverable = true;

-- 2. Create materialized compatibility table (optional - for very large user bases)
CREATE TABLE IF NOT EXISTS user_compatibility_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_wallet TEXT NOT NULL,
  candidate_wallet TEXT NOT NULL,
  shared_poaps INTEGER DEFAULT 0,
  compatibility_score INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_wallet, candidate_wallet)
);

CREATE INDEX IF NOT EXISTS idx_compatibility_user ON user_compatibility_cache(user_wallet, compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_compatibility_updated ON user_compatibility_cache(last_updated);

-- 3. Optimized batch query function - Get top matches by POAP overlap
CREATE OR REPLACE FUNCTION get_top_matches_by_poaps(
  p_user_wallet TEXT,
  p_limit INTEGER DEFAULT 50,
  p_city TEXT DEFAULT NULL
)
RETURNS TABLE(
  user_id TEXT,
  wallet_address TEXT,
  name TEXT,
  profile_image TEXT,
  bio TEXT,
  role TEXT,
  city TEXT,
  interests TEXT[],
  shared_poap_count BIGINT,
  compatibility_score INTEGER
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    p.user_id,
    p.wallet_address,
    p.name,
    p.profile_image,
    p.bio,
    p.role,
    p.city,
    p.interests,
    COUNT(DISTINCT up.event_id) as shared_poap_count,
    -- Score: base 70 + (shared_poaps * 5), capped at 100
    LEAST(100, 70 + (COUNT(DISTINCT up.event_id)::INTEGER * 5))::INTEGER as compatibility_score
  FROM user_poaps my_poaps
  JOIN user_poaps up ON up.event_id = my_poaps.event_id
  JOIN profiles p ON p.wallet_address = up.wallet_address
  WHERE my_poaps.wallet_address = p_user_wallet
    AND up.wallet_address != p_user_wallet
    AND p.is_discoverable = true
    AND p.wallet_address IS NOT NULL
    AND (p_city IS NULL OR p.city = p_city)
  GROUP BY p.user_id, p.wallet_address, p.name, p.profile_image, p.bio, p.role, p.city, p.interests
  HAVING COUNT(DISTINCT up.event_id) > 0
  ORDER BY shared_poap_count DESC, p.updated_at DESC
  LIMIT p_limit;
$$;

-- 4. Fallback function - Get profiles without POAP filtering (for users with no POAPs)
CREATE OR REPLACE FUNCTION get_discoverable_profiles_no_poaps(
  p_user_id TEXT,
  p_limit INTEGER DEFAULT 50,
  p_city TEXT DEFAULT NULL
)
RETURNS TABLE(
  user_id TEXT,
  wallet_address TEXT,
  name TEXT,
  profile_image TEXT,
  bio TEXT,
  role TEXT,
  city TEXT,
  interests TEXT[],
  compatibility_score INTEGER
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    p.user_id,
    p.wallet_address,
    p.name,
    p.profile_image,
    p.bio,
    p.role,
    p.city,
    p.interests,
    -- Random score between 70-85 for non-POAP users
    (70 + floor(random() * 15))::INTEGER as compatibility_score
  FROM profiles p
  WHERE p.user_id != p_user_id
    AND p.is_discoverable = true
    AND (p_city IS NULL OR p.city = p_city)
  ORDER BY p.updated_at DESC
  LIMIT p_limit;
$$;

-- 5. Hybrid function - Combines POAP matches + general profiles
CREATE OR REPLACE FUNCTION get_discovery_profiles_optimized(
  p_user_id TEXT,
  p_user_wallet TEXT,
  p_limit INTEGER DEFAULT 50,
  p_city TEXT DEFAULT NULL
)
RETURNS TABLE(
  user_id TEXT,
  name TEXT,
  username TEXT,
  title TEXT,
  company TEXT,
  email TEXT,
  bio TEXT,
  profile_image TEXT,
  city TEXT,
  role TEXT,
  interests TEXT[],
  linkedin TEXT,
  twitter TEXT,
  instagram TEXT,
  github TEXT,
  wallet_address TEXT,
  is_discoverable BOOLEAN,
  location_sharing TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  shared_poap_count BIGINT,
  compatibility_score INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  poap_match_count INTEGER;
BEGIN
  -- First, try to get POAP-based matches
  IF p_user_wallet IS NOT NULL THEN
    RETURN QUERY
    WITH poap_matches AS (
      SELECT * FROM get_top_matches_by_poaps(p_user_wallet, p_limit, p_city)
    ),
    profile_data AS (
      SELECT 
        p.*,
        pm.shared_poap_count,
        pm.compatibility_score
      FROM profiles p
      JOIN poap_matches pm ON p.user_id = pm.user_id
    )
    SELECT 
      pd.user_id,
      pd.name,
      pd.username,
      pd.title,
      pd.company,
      pd.email,
      pd.bio,
      pd.profile_image,
      pd.city,
      pd.role,
      pd.interests,
      pd.linkedin,
      pd.twitter,
      pd.instagram,
      pd.github,
      pd.wallet_address,
      pd.is_discoverable,
      pd.location_sharing,
      pd.created_at,
      pd.updated_at,
      pd.shared_poap_count,
      pd.compatibility_score
    FROM profile_data pd
    ORDER BY pd.compatibility_score DESC, pd.updated_at DESC;

    -- Check if we got any results
    GET DIAGNOSTICS poap_match_count = ROW_COUNT;
    
    -- If we have results, return them
    IF poap_match_count > 0 THEN
      RETURN;
    END IF;
  END IF;

  -- Fallback: No wallet or no POAP matches, return general profiles
  RETURN QUERY
  WITH general_profiles AS (
    SELECT * FROM get_discoverable_profiles_no_poaps(p_user_id, p_limit, p_city)
  )
  SELECT 
    p.user_id,
    p.name,
    p.username,
    p.title,
    p.company,
    p.email,
    p.bio,
    p.profile_image,
    p.city,
    p.role,
    p.interests,
    p.linkedin,
    p.twitter,
    p.instagram,
    p.github,
    p.wallet_address,
    p.is_discoverable,
    p.location_sharing,
    p.created_at,
    p.updated_at,
    0::BIGINT as shared_poap_count,
    gp.compatibility_score
  FROM profiles p
  JOIN general_profiles gp ON p.user_id = gp.user_id
  ORDER BY gp.compatibility_score DESC, p.updated_at DESC;
END;
$$;

-- 6. Function to refresh compatibility cache (run periodically via cron/scheduled job)
CREATE OR REPLACE FUNCTION refresh_compatibility_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clear old entries (older than 7 days)
  DELETE FROM user_compatibility_cache 
  WHERE last_updated < NOW() - INTERVAL '7 days';

  -- Recompute for all users with POAPs
  INSERT INTO user_compatibility_cache (user_wallet, candidate_wallet, shared_poaps, compatibility_score)
  SELECT 
    my_poaps.wallet_address as user_wallet,
    other_poaps.wallet_address as candidate_wallet,
    COUNT(DISTINCT my_poaps.event_id) as shared_poaps,
    LEAST(100, 70 + (COUNT(DISTINCT my_poaps.event_id)::INTEGER * 5))::INTEGER as compatibility_score
  FROM user_poaps my_poaps
  JOIN user_poaps other_poaps ON other_poaps.event_id = my_poaps.event_id
  WHERE my_poaps.wallet_address != other_poaps.wallet_address
  GROUP BY my_poaps.wallet_address, other_poaps.wallet_address
  ON CONFLICT (user_wallet, candidate_wallet) 
  DO UPDATE SET 
    shared_poaps = EXCLUDED.shared_poaps,
    compatibility_score = EXCLUDED.compatibility_score,
    last_updated = NOW();

  RAISE NOTICE 'Compatibility cache refreshed successfully';
END;
$$;

-- 7. Create comment for documentation
COMMENT ON FUNCTION get_discovery_profiles_optimized IS 'Optimized discovery with POAP-based batch matching - single query, no N+1 problem';
COMMENT ON FUNCTION get_top_matches_by_poaps IS 'Batch fetch top matches by POAP overlap in one query';
COMMENT ON FUNCTION refresh_compatibility_cache IS 'Precompute compatibility scores for fast retrieval (run via cron)';

-- 8. Notify completion
DO $$
BEGIN
  RAISE NOTICE 'POAP matching optimization complete!';
  RAISE NOTICE '✓ Indexes created for fast lookups';
  RAISE NOTICE '✓ Batch query function ready: get_discovery_profiles_optimized()';
  RAISE NOTICE '✓ Compatibility cache table created';
  RAISE NOTICE '✓ Cache refresh function available: refresh_compatibility_cache()';
  RAISE NOTICE '';
  RAISE NOTICE 'Performance improvement: N queries → 1 query';
  RAISE NOTICE 'Expected page load: < 500ms for discovery';
END $$;
