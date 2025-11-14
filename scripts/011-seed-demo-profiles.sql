-- Enhanced Demo Profiles for Testing (20 Profiles)
-- Run this in Supabase SQL Editor to populate the database with realistic demo data

-- Clear existing demo data (optional - comment out if you want to keep existing data)
-- DELETE FROM connections WHERE connected_user_id LIKE 'demo_%';
-- DELETE FROM profiles WHERE user_id LIKE 'demo_%';

-- Insert 20 diverse demo profiles
INSERT INTO profiles (
  user_id, name, title, company, email, bio, city, role, interests,
  linkedin, twitter, instagram, github, telegram, 
  is_discoverable, location_sharing, profile_image
) VALUES

-- Tech Founders & Builders
(
  'demo_alex_chen_001',
  'Alex Chen',
  'CEO & Co-Founder',
  'TechFlow AI',
  'alex@techflow.ai',
  'Building the future of AI-powered productivity tools. Stanford CS grad. Love coffee, cycling, and solving hard problems ☕🚴',
  'San Francisco',
  'Founder',
  ARRAY['AI', 'Startups', 'Product Design', 'Web3'],
  'linkedin.com/in/alexchen',
  '@alexchen',
  '@alexchen_builds',
  'github.com/alexchen',
  '@alexchen',
  true,
  'city',
  'https://i.pravatar.cc/300?img=12'
),

(
  'demo_sarah_williams_002',
  'Sarah Williams',
  'Full Stack Engineer',
  'CloudLabs',
  'sarah@cloudlabs.io',
  'Full-stack developer by day, open source contributor by night. React, Node.js, Web3 enthusiast. Always learning 🚀',
  'San Francisco',
  'Builder',
  ARRAY['Web3', 'React', 'Backend Development', 'DeFi'],
  'linkedin.com/in/sarahwilliams',
  '@sarah_codes',
  '@sarah.dev',
  'github.com/sarahwilliams',
  '@sarahcodes',
  true,
  'city',
  'https://i.pravatar.cc/300?img=47'
),

(
  'demo_james_park_003',
  'James Park',
  'Partner',
  'Catalyst Ventures',
  'james@catalystvc.com',
  'Early-stage investor focused on climate tech & fintech. Ex-Goldman Sachs. Always up for coffee chats ☕',
  'San Francisco',
  'Investor',
  ARRAY['Venture Capital', 'Fintech', 'Climate Tech', 'Crypto'],
  'linkedin.com/in/jamespark',
  '@jamespark_vc',
  NULL,
  NULL,
  '@jpark',
  true,
  'city',
  'https://i.pravatar.cc/300?img=33'
),

-- Designers & Creatives
(
  'demo_maya_rodriguez_004',
  'Maya Rodriguez',
  'Creative Director',
  'Design Studios Co',
  'maya@designstudios.co',
  'Creating beautiful experiences through thoughtful design. Art lover, coffee addict, design thinking advocate 🎨',
  'Los Angeles',
  'Creator',
  ARRAY['UI/UX Design', 'Branding', 'Digital Art', 'Animation'],
  'linkedin.com/in/mayarodriguez',
  '@mayarodriguez',
  '@maya_designs',
  NULL,
  '@maya_art',
  true,
  'city',
  'https://i.pravatar.cc/300?img=44'
),

(
  'demo_liam_chen_005',
  'Liam Chen',
  'Product Designer',
  'Figma',
  'liam@figma.com',
  'Designing tools for designers. Previously at Airbnb. Design systems enthusiast 🎯',
  'San Francisco',
  'Designer',
  ARRAY['Product Design', 'Design Systems', 'Prototyping', 'User Research'],
  'linkedin.com/in/liamchen',
  '@liamchen_design',
  '@liam.creates',
  'github.com/liamchen',
  NULL,
  true,
  'city',
  'https://i.pravatar.cc/300?img=60'
),

-- Data & AI Professionals
(
  'demo_david_kim_006',
  'David Kim',
  'Senior Data Scientist',
  'DataForce AI',
  'david@dataforceai.com',
  'ML engineer | Data storyteller | Building predictive models. Podcast listener, runner, chess player 🎧♟️',
  'New York',
  'Builder',
  ARRAY['Machine Learning', 'Data Science', 'Analytics', 'Python'],
  'linkedin.com/in/davidkim',
  '@davidkim_ai',
  NULL,
  'github.com/davidkim',
  '@dkim_data',
  true,
  'city',
  'https://i.pravatar.cc/300?img=15'
),

(
  'demo_priya_sharma_007',
  'Priya Sharma',
  'AI Research Lead',
  'OpenAI',
  'priya@openai.com',
  'Researching the next generation of AI models. PhD from MIT. Passionate about responsible AI 🤖',
  'San Francisco',
  'Researcher',
  ARRAY['AI Research', 'NLP', 'Deep Learning', 'Ethics'],
  'linkedin.com/in/priyasharma',
  '@priya_ai',
  NULL,
  'github.com/priyasharma',
  NULL,
  true,
  'city',
  'https://i.pravatar.cc/300?img=45'
),

-- Marketing & Growth
(
  'demo_emma_thompson_008',
  'Emma Thompson',
  'VP of Growth',
  'Growth Labs',
  'emma@growthlabs.io',
  'Growth hacker | Content creator | Building communities from 0 to 1. TEDx speaker 🌟',
  'Austin',
  'Marketer',
  ARRAY['Growth Marketing', 'Content Strategy', 'Community Building', 'SEO'],
  'linkedin.com/in/emmathompson',
  '@emma_growth',
  '@emmathompson',
  NULL,
  '@emma_labs',
  true,
  'city',
  'https://i.pravatar.cc/300?img=5'
),

(
  'demo_marcus_lee_009',
  'Marcus Lee',
  'Head of Marketing',
  'Stripe',
  'marcus@stripe.com',
  'Building brands that people love. Ex-Google. Basketball fan, podcast host, coffee snob ☕🏀',
  'San Francisco',
  'Marketer',
  ARRAY['Brand Marketing', 'Product Marketing', 'B2B SaaS', 'Podcasting'],
  'linkedin.com/in/marcuslee',
  '@marcus_mktg',
  '@marcus.lee',
  NULL,
  NULL,
  true,
  'city',
  'https://i.pravatar.cc/300?img=52'
),

-- Web3 & Crypto
(
  'demo_sophia_zhang_010',
  'Sophia Zhang',
  'Protocol Engineer',
  'Ethereum Foundation',
  'sophia@ethereum.org',
  'Building decentralized infrastructure. Blockchain architect. ETHGlobal finalist. Decentralizing everything 🔗',
  'New York',
  'Builder',
  ARRAY['Web3', 'Smart Contracts', 'DeFi', 'Ethereum'],
  'linkedin.com/in/sophiazhang',
  '@sophia_eth',
  NULL,
  'github.com/sophiazhang',
  '@sophia_web3',
  true,
  'city',
  'https://i.pravatar.cc/300?img=26'
),

(
  'demo_daniel_costa_011',
  'Daniel Costa',
  'DeFi Product Lead',
  'Uniswap Labs',
  'daniel@uniswap.org',
  'Making DeFi accessible to everyone. Ex-Coinbase. Crypto OG since 2015. NFT collector 🎨',
  'San Francisco',
  'Builder',
  ARRAY['DeFi', 'NFTs', 'DAOs', 'Token Economics'],
  'linkedin.com/in/danielcosta',
  '@daniel_defi',
  '@daniel.crypto',
  'github.com/danielcosta',
  '@dcosta',
  true,
  'city',
  'https://i.pravatar.cc/300?img=68'
),

-- Product & Business
(
  'demo_olivia_brown_012',
  'Olivia Brown',
  'Senior Product Manager',
  'Meta',
  'olivia@meta.com',
  'Building products used by billions. PM at Meta. Love design, data, and delightful UX ✨',
  'Los Angeles',
  'Product Manager',
  ARRAY['Product Management', 'Data Analytics', 'Mobile Apps', 'User Growth'],
  'linkedin.com/in/oliviabrown',
  '@olivia_pm',
  '@olivia.builds',
  NULL,
  NULL,
  true,
  'city',
  'https://i.pravatar.cc/300?img=20'
),

(
  'demo_ryan_patel_013',
  'Ryan Patel',
  'Co-Founder & COO',
  'FinFlow',
  'ryan@finflow.io',
  'Building the future of B2B payments. Ex-McKinsey consultant. Marathon runner 🏃‍♂️',
  'New York',
  'Founder',
  ARRAY['Fintech', 'Operations', 'B2B SaaS', 'Strategy'],
  'linkedin.com/in/ryanpatel',
  '@ryan_ops',
  NULL,
  NULL,
  '@rpatel',
  true,
  'city',
  'https://i.pravatar.cc/300?img=51'
),

-- DevRel & Community
(
  'demo_nina_martinez_014',
  'Nina Martinez',
  'Developer Advocate',
  'Vercel',
  'nina@vercel.com',
  'Making developers happy. Conference speaker. OSS maintainer. Love teaching & community building 💜',
  'Austin',
  'Advocate',
  ARRAY['Developer Relations', 'Public Speaking', 'Open Source', 'Next.js'],
  'linkedin.com/in/ninamartinez',
  '@nina_devrel',
  '@nina.codes',
  'github.com/ninamartinez',
  '@nina_vercel',
  true,
  'city',
  'https://i.pravatar.cc/300?img=9'
),

(
  'demo_alex_nguyen_015',
  'Alex Nguyen',
  'Community Lead',
  'Discord',
  'alex@discord.com',
  'Building thriving online communities. Gaming enthusiast. Moderator of 100k+ member servers 🎮',
  'San Francisco',
  'Community Manager',
  ARRAY['Community Building', 'Gaming', 'Social Media', 'Events'],
  'linkedin.com/in/alexnguyen',
  '@alex_community',
  '@alex.discord',
  NULL,
  '@alexn',
  true,
  'city',
  'https://i.pravatar.cc/300?img=59'
),

-- Climate & Impact
(
  'demo_zara_johnson_016',
  'Zara Johnson',
  'Sustainability Lead',
  'Patagonia',
  'zara@patagonia.com',
  'Fighting climate change one initiative at a time. Environmental activist. Hiker, photographer 🌍📸',
  'Los Angeles',
  'Advocate',
  ARRAY['Climate Tech', 'Sustainability', 'Impact Investing', 'Activism'],
  'linkedin.com/in/zarajohnson',
  '@zara_climate',
  '@zara.earth',
  NULL,
  NULL,
  true,
  'city',
  'https://i.pravatar.cc/300?img=32'
),

-- Content Creators
(
  'demo_tyler_reed_017',
  'Tyler Reed',
  'Content Creator & Educator',
  'YouTube',
  'tyler@youtube.com',
  'Teaching tech to 500k+ subscribers. Ex-software engineer turned educator. Making coding accessible 🎥',
  'Austin',
  'Creator',
  ARRAY['Content Creation', 'Education', 'Video Production', 'Coding'],
  'linkedin.com/in/tylerreed',
  '@tyler_teaches',
  '@tyler.codes',
  'github.com/tylerreed',
  NULL,
  true,
  'city',
  'https://i.pravatar.cc/300?img=14'
),

-- Healthcare Tech
(
  'demo_amara_okafor_018',
  'Dr. Amara Okafor',
  'Head of Medical AI',
  'HealthTech Inc',
  'amara@healthtech.com',
  'MD + AI researcher. Building AI tools to improve patient outcomes. Physician, coder, innovator 🏥',
  'New York',
  'Researcher',
  ARRAY['HealthTech', 'Medical AI', 'Telemedicine', 'Research'],
  'linkedin.com/in/amaraokafor',
  '@amara_md',
  NULL,
  'github.com/amaraokafor',
  NULL,
  true,
  'city',
  'https://i.pravatar.cc/300?img=38'
),

-- EdTech
(
  'demo_kai_tanaka_019',
  'Kai Tanaka',
  'VP of Engineering',
  'Coursera',
  'kai@coursera.org',
  'Making education accessible globally. Building scalable learning platforms. Lifelong learner 📚',
  'San Francisco',
  'Engineer',
  ARRAY['EdTech', 'Platform Engineering', 'Scalability', 'Education'],
  'linkedin.com/in/kaitanaka',
  '@kai_eng',
  NULL,
  'github.com/kaitanaka',
  '@kai_tech',
  true,
  'city',
  'https://i.pravatar.cc/300?img=56'
),

-- Hardware & Robotics
(
  'demo_isabella_rossi_020',
  'Isabella Rossi',
  'Robotics Engineer',
  'Boston Dynamics',
  'isabella@bostondynamics.com',
  'Building robots that move like humans. Mechanical engineer. TED fellow. Breaking barriers in robotics 🤖',
  'Boston',
  'Engineer',
  ARRAY['Robotics', 'Mechanical Engineering', 'AI', 'Hardware'],
  'linkedin.com/in/isabellarossi',
  '@isabella_robots',
  '@isabella.builds',
  'github.com/isabellarossi',
  NULL,
  true,
  'city',
  'https://i.pravatar.cc/300?img=29'
)

ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  email = EXCLUDED.email,
  bio = EXCLUDED.bio,
  city = EXCLUDED.city,
  role = EXCLUDED.role,
  interests = EXCLUDED.interests,
  linkedin = EXCLUDED.linkedin,
  twitter = EXCLUDED.twitter,
  instagram = EXCLUDED.instagram,
  github = EXCLUDED.github,
  telegram = EXCLUDED.telegram,
  is_discoverable = EXCLUDED.is_discoverable,
  location_sharing = EXCLUDED.location_sharing,
  profile_image = EXCLUDED.profile_image,
  updated_at = now();

-- Notify completion
DO $$
BEGIN
  RAISE NOTICE 'Successfully inserted/updated 20 demo profiles!';
  RAISE NOTICE 'Demo profiles ready for discovery testing.';
END $$;
