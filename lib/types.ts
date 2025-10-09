export interface Profile {
  id?: string
  user_id: string
  name: string
  title?: string
  company?: string
  email?: string
  phone?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  bio?: string
  profile_image?: string
  qr_code?: string
  created_at?: string
  updated_at?: string
}

export interface Connection {
  id?: string
  user_id: string
  connected_user_id: string
  connection_data: Profile
  notes?: string
  created_at?: string
}
