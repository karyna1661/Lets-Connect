/**
 * Talent Protocol API Integration
 * Fetches comprehensive social profile data
 */

export interface TalentProtocolProfile {
  id: string
  name: string
  username: string
  bio: string
  profile_picture_url: string
  location?: string
  socials: {
    twitter?: string
    github?: string
    linkedin?: string
    telegram?: string
    instagram?: string
    tiktok?: string
    youtube?: string
    website?: string
    lens?: string
    mirror?: string
    discord?: string
  }
}

/**
 * Fetch user profile from Talent Protocol
 * @param identifier - Can be wallet address, ENS, or username
 */
export async function fetchTalentProtocolProfile(identifier: string): Promise<TalentProtocolProfile | null> {
  try {
    const apiKey = process.env.TALENT_PROTOCOL_API_KEY || process.env.NEXT_PUBLIC_TALENT_PROTOCOL_API_KEY

    if (!apiKey) {
      console.warn('Talent Protocol API key not configured')
      return null
    }

    // Talent Protocol API endpoint
    const response = await fetch(`https://api.talentprotocol.com/api/v2/passports/${identifier}`, {
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Talent Protocol API error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    const passport = data.passport

    if (!passport) {
      return null
    }

    // Extract social links from credentials
    const socials: TalentProtocolProfile['socials'] = {}
    
    if (passport.verified_credentials) {
      passport.verified_credentials.forEach((cred: any) => {
        const platform = cred.platform?.toLowerCase()
        const value = cred.value || cred.username

        switch (platform) {
          case 'twitter':
          case 'x':
            socials.twitter = value
            break
          case 'github':
            socials.github = value
            break
          case 'linkedin':
            socials.linkedin = value
            break
          case 'telegram':
            socials.telegram = value
            break
          case 'instagram':
            socials.instagram = value
            break
          case 'tiktok':
            socials.tiktok = value
            break
          case 'youtube':
            socials.youtube = value
            break
          case 'discord':
            socials.discord = value
            break
          case 'lens':
            socials.lens = value
            break
          case 'mirror':
            socials.mirror = value
            break
          case 'website':
          case 'personal_website':
            socials.website = value
            break
        }
      })
    }

    return {
      id: passport.passport_id.toString(),
      name: passport.name || passport.main_wallet,
      username: passport.username || passport.main_wallet,
      bio: passport.bio || '',
      profile_picture_url: passport.image_url || '',
      location: passport.location,
      socials,
    }
  } catch (error) {
    console.error('Error fetching Talent Protocol profile:', error)
    return null
  }
}

/**
 * Search for a user by wallet address or ENS on Talent Protocol
 */
export async function searchTalentProtocolUser(query: string): Promise<TalentProtocolProfile | null> {
  try {
    const apiKey = process.env.TALENT_PROTOCOL_API_KEY || process.env.NEXT_PUBLIC_TALENT_PROTOCOL_API_KEY

    if (!apiKey) {
      console.warn('Talent Protocol API key not configured')
      return null
    }

    const response = await fetch(`https://api.talentprotocol.com/api/v2/passports?search=${encodeURIComponent(query)}`, {
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data.passports && data.passports.length > 0) {
      const passport = data.passports[0]
      return fetchTalentProtocolProfile(passport.main_wallet || passport.passport_id)
    }

    return null
  } catch (error) {
    console.error('Error searching Talent Protocol:', error)
    return null
  }
}
