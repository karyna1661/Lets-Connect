-- Function to calculate shared POAPs count
CREATE OR REPLACE FUNCTION get_shared_poaps_count(p_user_id TEXT, p_target_user_id TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(DISTINCT p1.poap_hash)
  FROM poaps p1
  JOIN poaps p2 ON p1.poap_hash = p2.poap_hash
  WHERE p1.user_id = p_user_id
    AND p2.user_id = p_target_user_id
    AND p1.is_visible = true
    AND p2.is_visible = true;
$$ LANGUAGE SQL STABLE;

-- Function to get shared POAPs details
CREATE OR REPLACE FUNCTION get_shared_poaps(p_user_id TEXT, p_target_user_id TEXT)
RETURNS TABLE(poap_hash TEXT, event_name TEXT, event_image_url TEXT) AS $$
  SELECT DISTINCT p1.poap_hash, p1.event_name, p1.event_image_url
  FROM poaps p1
  JOIN poaps p2 ON p1.poap_hash = p2.poap_hash
  WHERE p1.user_id = p_user_id
    AND p2.user_id = p_target_user_id
    AND p1.is_visible = true
    AND p2.is_visible = true
  ORDER BY p1.event_date DESC;
$$ LANGUAGE SQL STABLE;

-- Function to calculate compatibility score
CREATE OR REPLACE FUNCTION calculate_compatibility_score(
  p_user_id TEXT,
  p_target_user_id TEXT
)
RETURNS NUMERIC AS $$
DECLARE
  v_shared_poaps INTEGER;
  v_shared_interests INTEGER;
  v_same_city BOOLEAN;
  v_score NUMERIC := 0;
BEGIN
  -- Get shared POAPs count
  SELECT get_shared_poaps_count(p_user_id, p_target_user_id) INTO v_shared_poaps;
  
  -- Calculate shared interests
  SELECT COUNT(*) INTO v_shared_interests
  FROM (
    SELECT UNNEST(p1.interests) as interest
    FROM profiles p1
    WHERE p1.user_id = p_user_id
    INTERSECT
    SELECT UNNEST(p2.interests) as interest
    FROM profiles p2
    WHERE p2.user_id = p_target_user_id
  ) shared;
  
  -- Check same city
  SELECT (p1.city = p2.city AND p1.city IS NOT NULL)
  INTO v_same_city
  FROM profiles p1, profiles p2
  WHERE p1.user_id = p_user_id AND p2.user_id = p_target_user_id;
  
  -- Calculate score
  v_score := (v_shared_poaps * 25) + (v_shared_interests * 15) + (CASE WHEN v_same_city THEN 20 ELSE 0 END);
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql;
