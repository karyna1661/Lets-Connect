/**
 * Farcaster API Integration using Neynar SDK
 * Fetches user profile data including name, pfp, and connected Twitter account
 */

import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk"

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

// Initialize Neynar client
let neynarClient: NeynarAPIClient | null = null

function getNeynarClient(): NeynarAPIClient | null {
  if (!process.env.NEYNAR_API_KEY) {
    console.warn('[Farcaster API] NEYNAR_API_KEY not set, SDK features disabled')
    return null
  }
  
  if (!neynarClient) {
    const config = new Configuration({
      apiKey: process.env.NEYNAR_API_KEY,
    })
    neynarClient = new NeynarAPIClient(config)
  }
  
  return neynarClient
}

/**
 * Fetch Farcaster user profile by username or FID using Neynar SDK
 */
export async function fetchFarcasterProfile(identifier: string): Promise<FarcasterProfile | null> {
  try {
    const client = getNeynarClient()
    
    // Fallback to public API if no SDK client
    if (!client) {
      return await fetchFarcasterProfilePublic(identifier)
    }

    // Check if identifier is FID (numeric) or username
    const isFID = /^\d+$/.test(identifier)
    
    let user: any
    
    if (isFID) {
      // Fetch by FID using bulk users endpoint
      const response = await client.fetchBulkUsers({ fids: [parseInt(identifier)] })
      user = response.users?.[0]
    } else {
      // Fetch by username
      const response = await client.lookupUserByUsername({ username: identifier })
      user = response.user
    }

    if (!user) {
      console.log('[Farcaster API] User not found:', identifier)
      return null
    }

    // Parse Twitter verification from connected accounts
    let twitterHandle: string | undefined
    if (user.verified_accounts) {
      const twitterAccount = user.verified_accounts.find(
        (acc: any) => acc.platform === 'twitter' || acc.platform === 'x'
      )
      if (twitterAccount) {
        twitterHandle = twitterAccount.username
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
    console.error('Error fetching Farcaster profile with SDK:', error)
    // Fallback to public API
    return await fetchFarcasterProfilePublic(identifier)
  }
}

/**
 * Fetch Farcaster profile using public API (no SDK)
 * Fallback when NEYNAR_API_KEY is not available
 */
async function fetchFarcasterProfilePublic(identifier: string): Promise<FarcasterProfile | null> {
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
 * Alternative: Fetch using Farcaster public API directly (no API key needed)
 */
export async function fetchFarcasterProfileWarpcast(username: string): Promise<Partial<FarcasterProfile> | null> {
  try {
    const cleanUsername = username.replace('@', '')
    
    // Use the public Farcaster API (formerly Warpcast)
    const response = await fetch(`https://client.farcaster.xyz/v2/user-by-username?username=${cleanUsername}`)
    
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
    console.error('Error fetching Farcaster profile from Farpcast:', error)
    return null
  }
}

/**
 * Fetch Farcaster users by wallet addresses (bulk) using Neynar SDK
 * Useful for finding Farcaster profiles from wallet addresses
 */
export async function fetchFarcasterByWallets(walletAddresses: string[]): Promise<FarcasterProfile[]> {
  try {
    if (!walletAddresses || walletAddresses.length === 0) {
      return []
    }

    const client = getNeynarClient()
    
    if (!client) {
      console.warn('[Farcaster API] Cannot fetch by wallets - SDK not initialized')
      return []
    }

    // Use SDK's bulk user by verification endpoint
    const response = await client.fetchBulkUsersByEthOrSolAddress({
      addresses: walletAddresses,
    })

    if (!response || Object.keys(response).length === 0) {
      return []
    }

    // Response is a map of address -> user array
    const allUsers: FarcasterProfile[] = []
    
    Object.values(response).forEach((users: any) => {
      if (Array.isArray(users)) {
        users.forEach((user: any) => {
          allUsers.push({
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
          })
        })
      }
    })

    return allUsers
  } catch (error) {
    console.error('Error fetching Farcaster by wallets with SDK:', error)
    return []
  }
}

/**
 * Fetch following FIDs for a given user
 */
export async function fetchFollowingFids(fid: number): Promise<number[]> {
  try {
    const url = `https://api.neynar.com/v2/farcaster/user/following?fid=${fid}&limit=150`
    const res = await fetch(url, {
      headers: {
        accept: 'application/json',
        api_key: process.env.NEYNAR_API_KEY || '',
      },
    })
    if (!res.ok) {
      console.error('Neynar following API error:', res.status, res.statusText)
      return []
    }
    const data = await res.json()
    const users = data.users || data.result?.users || []
    return users
      .map((u: any) => u.fid)
      .filter((n: any) => typeof n === 'number')
  } catch (e) {
    console.error('Error fetching following fids:', e)
    return []
  }
}

/**
 * Fetch multiple Farcaster profiles by FIDs (bulk)
 */
export async function fetchProfilesByFids(fids: number[]): Promise<FarcasterProfile[]> {
  try {
    if (!fids || fids.length === 0) {
      return []
    }

    const client = getNeynarClient()
    let users: any[] = []

    if (client) {
      const resp = await client.fetchBulkUsers({ fids })
      users = resp.users || []
    } else {
      // Public API fallback
      const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids.join(',')}`
      const res = await fetch(url, {
        headers: {
          accept: 'application/json',
          api_key: process.env.NEYNAR_API_KEY || '',
        },
      })
      if (!res.ok) {
        console.error('Neynar bulk users API error:', res.status, res.statusText)
        return []
      }
      const data = await res.json()
      users = data.users || []
    }

    return users.map((user: any) => {
      const walletAddresses: string[] = []
      if (user.verified_addresses?.eth_addresses && Array.isArray(user.verified_addresses.eth_addresses)) {
        walletAddresses.push(...user.verified_addresses.eth_addresses)
      }
      if (user.custody_address && !walletAddresses.includes(user.custody_address)) {
        walletAddresses.push(user.custody_address)
      }
      if (user.verifications && Array.isArray(user.verifications)) {
        user.verifications.forEach((addr: string) => {
          if (addr && addr.startsWith('0x') && !walletAddresses.includes(addr)) {
            walletAddresses.push(addr)
          }
        })
      }

      let twitterHandle: string | undefined
      if (user.verified_accounts) {
        const twitterAccount = user.verified_accounts.find(
          (acc: any) => acc.platform === 'twitter' || acc.platform === 'x'
        )
        if (twitterAccount) {
          twitterHandle = twitterAccount.username
        }
      }

      return {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name || user.username,
        pfp: { url: user.pfp_url || '' },
        profile: { bio: { text: user.profile?.bio?.text || '' } },
        verifications: user.verified_addresses?.eth_addresses || [],
        walletAddresses: walletAddresses.length > 0 ? walletAddresses : undefined,
        connectedAccounts: { twitter: twitterHandle },
      } as FarcasterProfile
    })
  } catch (e) {
    console.error('Error bulk fetching profiles by fids:', e)
    return []
  }
}
