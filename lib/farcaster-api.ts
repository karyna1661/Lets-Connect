/**
 * Farcaster API Integration
 * Fetches user profile data including name, pfp, and connected Twitter account
 */

export interface FarcasterProfile {
  fid: number
  username: string
  displayName: string
  pfp: {
    url: string
  }
  profile: {
    bio: {
      text: string
    }
  }
  verifications: string[]
  connectedAccounts?: {
    twitter?: string
  }
}

/**
 * Fetch Farcaster user profile by username or FID
 * Using Neynar API (popular Farcaster API service)
 */
export async function fetchFarcasterProfile(identifier: string): Promise<FarcasterProfile | null> {
  try {
    // Check if identifier is FID (numeric) or username
    const isFID = /^\d+$/.test(identifier)
    const endpoint = isFID
      ? `https://api.neynar.com/v2/farcaster/user/bulk?fids=${identifier}`
      : `https://api.neynar.com/v2/farcaster/user/by_username?username=${identifier}`

    const response = await fetch(endpoint, {
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    })

    if (!response.ok) {
      console.error('Farcaster API error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    // Handle both FID and username response formats
    const user = isFID ? data.users?.[0] : data.user

    if (!user) {
      return null
    }

    // Parse Twitter verification from connected accounts
    let twitterHandle: string | undefined
    if (user.verified_addresses?.eth_addresses) {
      // Check for Twitter verification in verifications
      const twitterVerification = user.verified_addresses.eth_addresses.find(
        (addr: any) => addr.protocol === 'twitter'
      )
      if (twitterVerification) {
        twitterHandle = twitterVerification.username
      }
    }

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name || user.username,
      pfp: {
        url: user.pfp_url || '',
      },
      profile: {
        bio: {
          text: user.profile?.bio?.text || '',
        },
      },
      verifications: user.verified_addresses?.eth_addresses || [],
      connectedAccounts: {
        twitter: twitterHandle,
      },
    }
  } catch (error) {
    console.error('Error fetching Farcaster profile:', error)
    return null
  }
}

/**
 * Alternative: Fetch using Warpcast API directly (no API key needed)
 */
export async function fetchFarcasterProfileWarpcast(username: string): Promise<Partial<FarcasterProfile> | null> {
  try {
    const cleanUsername = username.replace('@', '')
    
    // Use the public Warpcast API
    const response = await fetch(`https://client.warpcast.com/v2/user-by-username?username=${cleanUsername}`)
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const user = data.result?.user

    if (!user) {
      return null
    }

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.displayName || user.username,
      pfp: {
        url: user.pfp?.url || '',
      },
      profile: {
        bio: {
          text: user.profile?.bio?.text || '',
        },
      },
      verifications: user.verifications || [],
    }
  } catch (error) {
    console.error('Error fetching Farcaster profile from Warpcast:', error)
    return null
  }
}
