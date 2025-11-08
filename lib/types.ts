export interface Profile {
  id?: string
  user_id: string
  name: string // maps to displayName
  username?: string
  title?: string
  company?: string
  email?: string
  phone?: string
  linkedin?: string
  twitter?: string // maps to x
  instagram?: string
  bio?: string
  profile_image?: string // maps to avatar
  qr_code?: string
  city?: string // maps to location
  role?: string
  interests?: string[]
  is_discoverable?: boolean
  location_sharing?: "off" | "city" | "precise"
  wallet_hash?: string
  wallet_address?: string  // Ethereum wallet address from Farcaster/Privy
  created_at?: string
  updated_at?: string
  // New social fields from ConnectProfile
  ens?: string
  zora?: string
  farcaster?: string
  paragraph?: string
  telegram?: string
  substack?: string
  github?: string
  tiktok?: string
  youtube?: string
  x?: string // Twitter/X handle
}

export interface Connection {
  id?: string
  user_id: string
  connected_user_id: string
  connection_data: Profile
  notes?: string
  connection_type?: "qr" | "swipe" | "manual"
  created_at?: string
}
