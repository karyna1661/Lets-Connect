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
  walletAddresses?: string[]  // Ethereum wallet addresses
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

    // Extract wallet addresses from verified_addresses
    const walletAddresses: string[] = []
    
    // Priority 1: Verified Ethereum addresses
    if (user.verified_addresses?.eth_addresses && Array.isArray(user.verified_addresses.eth_addresses)) {
      walletAddresses.push(...user.verified_addresses.eth_addresses)
    }
    
    // Priority 2: Custody address (Farcaster's managed wallet)
    if (user.custody_address && !walletAddresses.includes(user.custody_address)) {
      walletAddresses.push(user.custody_address)
    }
    
    // Priority 3: Check verifications array for wallet addresses
    if (user.verifications && Array.isArray(user.verifications)) {
      user.verifications.forEach((addr: string) => {
        if (addr && addr.startsWith('0x') && !walletAddresses.includes(addr)) {
          walletAddresses.push(addr)
        }
      })
    }
    
    console.log('[Farcaster API] Wallet addresses found:', walletAddresses)

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
      walletAddresses: walletAddresses.length > 0 ? walletAddresses : undefined,
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

    // Extract wallet addresses from verifications
    const walletAddresses: string[] = []
    if (user.verifications) {
      walletAddresses.push(...user.verifications)
    }
    if (user.custodyAddress) {
      walletAddresses.push(user.custodyAddress)
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
      walletAddresses: walletAddresses.length > 0 ? walletAddresses : undefined,
    }
  } catch (error) {
    console.error('Error fetching Farcaster profile from Warpcast:', error)
    return null
  }
}

/**
 * Fetch Farcaster users by wallet addresses (bulk)
 * Useful for finding Farcaster profiles from wallet addresses
 */
export async function fetchFarcasterByWallets(walletAddresses: string[]): Promise<FarcasterProfile[]> {
  try {
    if (!walletAddresses || walletAddresses.length === 0) {
      return []
    }

    const addressesParam = walletAddresses.join(',')
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${addressesParam}`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': process.env.NEYNAR_API_KEY || '',
        },
      }
    )

    if (!response.ok) {
      console.error('Neynar bulk-by-address error:', response.status)
      return []
    }

    const data = await response.json()
    const users = data[walletAddresses[0]]  // Returns map of address -> user array

    if (!users || users.length === 0) {
      return []
    }

    return users.map((user: any) => ({
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
      walletAddresses: user.verified_addresses?.eth_addresses || [],
    }))
  } catch (error) {
    console.error('Error fetching Farcaster by wallets:', error)
    return []
  }
}
