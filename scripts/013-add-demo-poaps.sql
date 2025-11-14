-- Add Demo POAPs to profiles for realistic shared event experience
-- This creates shared POAPs between demo users to showcase the feature

-- First, add wallet addresses to demo profiles
UPDATE profiles 
SET wallet_address = '0x' || substring(md5(user_id) from 1 for 40)
WHERE user_id LIKE 'demo_%' AND wallet_address IS NULL;

-- Popular ETH events that multiple people might have attended
-- We'll assign these to different users to create overlaps

-- ETHGlobal Events (Popular hackathons)
INSERT INTO user_poaps (wallet_address, event_id, event_name, image_url, event_date) VALUES
-- Alex Chen attended 3 events
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_alex_chen_001'), 100001, 'ETHGlobal SF 2023', 'https://assets.poap.xyz/ethglobal-sf-2023.png', '2023-11-03'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_alex_chen_001'), 100002, 'Devconnect Istanbul', 'https://assets.poap.xyz/devconnect-istanbul.png', '2023-11-13'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_alex_chen_001'), 100003, 'ETHDenver 2024', 'https://assets.poap.xyz/ethdenver-2024.png', '2024-02-23'),

-- Sarah Williams attended 4 events (2 overlap with Alex)
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_sarah_williams_002'), 100001, 'ETHGlobal SF 2023', 'https://assets.poap.xyz/ethglobal-sf-2023.png', '2023-11-03'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_sarah_williams_002'), 100003, 'ETHDenver 2024', 'https://assets.poap.xyz/ethdenver-2024.png', '2024-02-23'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_sarah_williams_002'), 100004, 'EthCC Paris 2023', 'https://assets.poap.xyz/ethcc-paris.png', '2023-07-17'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_sarah_williams_002'), 100005, 'Consensus 2024', 'https://assets.poap.xyz/consensus-2024.png', '2024-05-29'),

-- James Park (Investor) attended 3 events (1 overlap with Alex, 2 with Sarah)
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_james_park_003'), 100002, 'Devconnect Istanbul', 'https://assets.poap.xyz/devconnect-istanbul.png', '2023-11-13'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_james_park_003'), 100004, 'EthCC Paris 2023', 'https://assets.poap.xyz/ethcc-paris.png', '2023-07-17'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_james_park_003'), 100005, 'Consensus 2024', 'https://assets.poap.xyz/consensus-2024.png', '2024-05-29'),

-- Sophia Zhang (Web3) attended 5 events (heavy attendee)
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_sophia_zhang_010'), 100001, 'ETHGlobal SF 2023', 'https://assets.poap.xyz/ethglobal-sf-2023.png', '2023-11-03'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_sophia_zhang_010'), 100002, 'Devconnect Istanbul', 'https://assets.poap.xyz/devconnect-istanbul.png', '2023-11-13'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_sophia_zhang_010'), 100003, 'ETHDenver 2024', 'https://assets.poap.xyz/ethdenver-2024.png', '2024-02-23'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_sophia_zhang_010'), 100006, 'NFT.NYC 2023', 'https://assets.poap.xyz/nft-nyc.png', '2023-04-12'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_sophia_zhang_010'), 100007, 'Token2049 Singapore', 'https://assets.poap.xyz/token2049.png', '2023-09-13'),

-- Daniel Costa (DeFi) attended 4 events
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_daniel_costa_011'), 100003, 'ETHDenver 2024', 'https://assets.poap.xyz/ethdenver-2024.png', '2024-02-23'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_daniel_costa_011'), 100004, 'EthCC Paris 2023', 'https://assets.poap.xyz/ethcc-paris.png', '2023-07-17'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_daniel_costa_011'), 100006, 'NFT.NYC 2023', 'https://assets.poap.xyz/nft-nyc.png', '2023-04-12'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_daniel_costa_011'), 100007, 'Token2049 Singapore', 'https://assets.poap.xyz/token2049.png', '2023-09-13'),

-- Priya Sharma (AI) attended 3 tech conferences
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_priya_sharma_007'), 100001, 'ETHGlobal SF 2023', 'https://assets.poap.xyz/ethglobal-sf-2023.png', '2023-11-03'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_priya_sharma_007'), 100005, 'Consensus 2024', 'https://assets.poap.xyz/consensus-2024.png', '2024-05-29'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_priya_sharma_007'), 100008, 'AI Summit 2024', 'https://assets.poap.xyz/ai-summit.png', '2024-03-15'),

-- David Kim (Data Science) attended 2 events
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_david_kim_006'), 100001, 'ETHGlobal SF 2023', 'https://assets.poap.xyz/ethglobal-sf-2023.png', '2023-11-03'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_david_kim_006'), 100008, 'AI Summit 2024', 'https://assets.poap.xyz/ai-summit.png', '2024-03-15'),

-- Liam Chen (Designer) attended 2 events
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_liam_chen_005'), 100001, 'ETHGlobal SF 2023', 'https://assets.poap.xyz/ethglobal-sf-2023.png', '2023-11-03'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_liam_chen_005'), 100009, 'Figma Config 2023', 'https://assets.poap.xyz/figma-config.png', '2023-06-21'),

-- Marcus Lee (Marketing) attended 3 events
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_marcus_lee_009'), 100005, 'Consensus 2024', 'https://assets.poap.xyz/consensus-2024.png', '2024-05-29'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_marcus_lee_009'), 100010, 'Web Summit 2023', 'https://assets.poap.xyz/web-summit.png', '2023-11-13'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_marcus_lee_009'), 100011, 'SXSW 2024', 'https://assets.poap.xyz/sxsw.png', '2024-03-08'),

-- Nina Martinez (DevRel) attended 4 events
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_nina_martinez_014'), 100001, 'ETHGlobal SF 2023', 'https://assets.poap.xyz/ethglobal-sf-2023.png', '2023-11-03'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_nina_martinez_014'), 100002, 'Devconnect Istanbul', 'https://assets.poap.xyz/devconnect-istanbul.png', '2023-11-13'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_nina_martinez_014'), 100012, 'Next.js Conf 2023', 'https://assets.poap.xyz/nextjs-conf.png', '2023-10-26'),
((SELECT wallet_address FROM profiles WHERE user_id = 'demo_nina_martinez_014'), 100013, 'React Summit 2024', 'https://assets.poap.xyz/react-summit.png', '2024-04-12')

ON CONFLICT (wallet_address, event_id) DO NOTHING;

-- Notify completion
DO $$
DECLARE
  poap_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO poap_count FROM user_poaps;
  RAISE NOTICE 'Successfully added demo POAPs!';
  RAISE NOTICE 'Total POAPs in database: %', poap_count;
  RAISE NOTICE 'Users will now see shared events when swiping.';
END $$;
