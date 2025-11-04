-- Create admin demo account for testing
-- Email: admin@letsconnect.test
-- Password: Demo123456!

-- Note: You'll need to manually create this account through Supabase Auth console or sign up normally
-- Then manually verify the email and set password to the above credentials
-- For now, this script creates the profile records for demo accounts

-- Admin profile
INSERT INTO profiles (
  user_id,
  name,
  bio,
  email,
  city,
  role,
  interests,
  is_discoverable,
  location_sharing,
  instagram,
  twitter,
  linkedin,
  github,
  website
) VALUES (
  'admin-demo-user',
  'Admin Demo',
  'Test admin account for Let''s Connect demo and testing',
  'admin@letsconnect.test',
  'San Francisco',
  'Founder',
  ARRAY['Web3', 'Networking', 'Events', 'Testing'],
  true,
  'city',
  '@admindemo',
  '@admindemotest',
  'https://linkedin.com/in/admindemo',
  'admindemo',
  'letsconnect.test'
) ON CONFLICT (user_id) DO UPDATE SET
  name = 'Admin Demo',
  bio = 'Test admin account for Let''s Connect demo and testing',
  updated_at = NOW();

-- Demo account 1 - Builder
INSERT INTO profiles (
  user_id,
  name,
  bio,
  email,
  city,
  role,
  interests,
  is_discoverable,
  location_sharing,
  instagram,
  twitter,
  linkedin,
  github,
  website
) VALUES (
  'demo-user-1',
  'Sarah Chen',
  'Full-stack developer building Web3 protocols',
  'sarah@demo.test',
  'San Francisco',
  'Builder',
  ARRAY['Web3', 'React', 'Design', 'AI'],
  true,
  'city',
  '@sarahchendev',
  '@sarahchen',
  'https://linkedin.com/in/sarahchen',
  'sarahchen',
  'sarahchen.dev'
) ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW();

-- Demo account 2 - Investor
INSERT INTO profiles (
  user_id,
  name,
  bio,
  email,
  city,
  role,
  interests,
  is_discoverable,
  location_sharing,
  instagram,
  twitter,
  linkedin,
  github,
  website
) VALUES (
  'demo-user-2',
  'Marcus Johnson',
  'Early-stage investor focused on infrastructure and community',
  'marcus@demo.test',
  'New York',
  'Investor',
  ARRAY['Venture Capital', 'Web3', 'Infrastructure', 'Startups'],
  true,
  'city',
  '@marcusvc',
  '@marcusjohnson',
  'https://linkedin.com/in/marcusjohnson',
  null,
  null
) ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW();

-- Demo account 3 - Creator
INSERT INTO profiles (
  user_id,
  name,
  bio,
  email,
  city,
  role,
  interests,
  is_discoverable,
  location_sharing,
  instagram,
  twitter,
  linkedin,
  github,
  website
) VALUES (
  'demo-user-3',
  'Luna Park',
  'Content creator and community builder in Web3 space',
  'luna@demo.test',
  'Los Angeles',
  'Creator',
  ARRAY['Community', 'Content', 'Web3', 'Design'],
  true,
  'city',
  '@lunapark',
  '@lunapark_',
  'https://linkedin.com/in/lunapark',
  null,
  'lunapark.co'
) ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW();
