"use server"

import { fetchFarcasterProfile, fetchFarcasterProfileWarpcast } from "@/lib/farcaster-api"
import { fetchTalentProtocolProfile, searchTalentProtocolUser } from "@/lib/talent-protocol-api"
import type { Profile } from "@/lib/types"

export interface SocialSyncResult {
  success: boolean
  data?: Partial<Profile>
  walletAddress?: string  // Wallet address from Farcaster/Talent
  source: 'farcaster' | 'talent_protocol' | 'combined'
  error?: string
}

/**
 * Sync profile data from Farcaster
 * Fetches: name, pfp, bio, Twitter handle, and wallet addresses
 */
export async function syncFromFarcaster(farcasterUsername: string): Promise<SocialSyncResult> {
  try {
    const cleanUsername = farcasterUsername.replace('@', '')
    
    // Try with API key first (Neynar), fallback to public Farcaster API
    let profile = await fetchFarcasterProfile(cleanUsername)
    
    if (!profile) {
      profile = await fetchFarcasterProfileWarpcast(cleanUsername) as any
    }

    if (!profile) {
      return {
        success: false,
        source: 'farcaster',
        error: 'Farcaster profile not found'
      }
    }

    const syncedData: Partial<Profile> = {
      name: profile.displayName,
      profile_image: profile.pfp?.url,
      bio: profile.profile?.bio?.text,
      farcaster: `@${profile.username}`,
    }

    // Add Twitter if connected
    if (profile.connectedAccounts?.twitter) {
      syncedData.x = `@${profile.connectedAccounts.twitter}`
      syncedData.twitter = `@${profile.connectedAccounts.twitter}`
    }

    // Extract primary wallet address - CRITICAL: Save to wallet_address field
    const walletAddress = profile.walletAddresses?.[0]
    if (walletAddress) {
      syncedData.wallet_address = walletAddress
      console.log('[Farcaster Sync] Wallet address found:', walletAddress)
    } else {
      console.warn('[Farcaster Sync] No wallet address found for', cleanUsername)
    }

    return {
      success: true,
      data: syncedData,
      walletAddress: walletAddress,
      source: 'farcaster',
    }
  } catch (error) {
    console.error('Error syncing from Farcaster:', error)
    return {
      success: false,
      source: 'farcaster',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Sync profile data from Talent Protocol
 * Fetches: all remaining social accounts not covered by Farcaster
 */
export async function syncFromTalentProtocol(walletOrENS: string): Promise<SocialSyncResult> {
  try {
    let profile = await fetchTalentProtocolProfile(walletOrENS)
    
    if (!profile) {
      // Try searching if direct fetch fails
      profile = await searchTalentProtocolUser(walletOrENS)
    }

    if (!profile) {
      return {
        success: false,
        source: 'talent_protocol',
        error: 'Talent Protocol profile not found'
      }
    }

    const syncedData: Partial<Profile> = {
      bio: profile.bio || undefined,
      city: profile.location || undefined,
    }

    // Only update profile image if not already set
    if (profile.profile_picture_url) {
      syncedData.profile_image = profile.profile_picture_url
    }

    // Add social accounts
    if (profile.socials.github) syncedData.github = profile.socials.github
    if (profile.socials.linkedin) syncedData.linkedin = profile.socials.linkedin
    if (profile.socials.instagram) syncedData.instagram = profile.socials.instagram
    if (profile.socials.telegram) syncedData.telegram = profile.socials.telegram
    if (profile.socials.tiktok) syncedData.tiktok = profile.socials.tiktok
    if (profile.socials.youtube) syncedData.youtube = profile.socials.youtube

    // Twitter/X (but don't override if Farcaster already set it)
    if (profile.socials.twitter) {
      syncedData.x = profile.socials.twitter
      syncedData.twitter = profile.socials.twitter
    }

    return {
      success: true,
      data: syncedData,
      source: 'talent_protocol',
    }
  } catch (error) {
    console.error('Error syncing from Talent Protocol:', error)
    return {
      success: false,
      source: 'talent_protocol',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Combined sync from both Farcaster and Talent Protocol
 * Farcaster takes priority for name, pfp, and Twitter
 * Talent Protocol fills in the remaining social accounts
 */
export async function syncFromBothPlatforms(
  farcasterUsername?: string,
  walletOrENS?: string
): Promise<SocialSyncResult> {
  try {
    const results: Partial<Profile> = {}
    let hasAnySuccess = false

    // Sync from Farcaster first (priority data)
    if (farcasterUsername) {
      const farcasterResult = await syncFromFarcaster(farcasterUsername)
      if (farcasterResult.success && farcasterResult.data) {
        Object.assign(results, farcasterResult.data)
        hasAnySuccess = true
      }
    }

    // Sync from Talent Protocol (fills in gaps)
    if (walletOrENS) {
      const talentResult = await syncFromTalentProtocol(walletOrENS)
      if (talentResult.success && talentResult.data) {
        // Merge data, but don't override Farcaster's name, pfp, and Twitter
        const { name, profile_image, x, twitter, ...talentData } = talentResult.data
        
        // Only use Talent Protocol's data if Farcaster didn't provide it
        if (!results.name) results.name = name
        if (!results.profile_image) results.profile_image = profile_image
        if (!results.x) results.x = x
        if (!results.twitter) results.twitter = twitter
        
        // Add all other social data from Talent Protocol
        Object.assign(results, talentData)
        hasAnySuccess = true
      }
    }

    if (!hasAnySuccess) {
      return {
        success: false,
        source: 'combined',
        error: 'Could not fetch data from either platform'
      }
    }

    return {
      success: true,
      data: results,
      source: 'combined',
    }
  } catch (error) {
    console.error('Error syncing from both platforms:', error)
    return {
      success: false,
      source: 'combined',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
