-- Drop existing insecure policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all connections" ON connections;
DROP POLICY IF EXISTS "Users can insert their own connections" ON connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON connections;

-- Create secure RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);  -- Profiles are public for QR code sharing

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create secure RLS policies for connections
CREATE POLICY "Users can view their own connections" ON connections
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own connections" ON connections
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own connections" ON connections
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own connections" ON connections
  FOR DELETE USING (auth.uid()::text = user_id);
