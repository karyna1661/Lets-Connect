"use server"

import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

/**
 * POAP API Integration
 * 
 * Setup Instructions:
 * 1. Get your POAP API key from https://poap.xyz/
 * 2. Add to .env.local: POAP_API_KEY=your_api_key_here
 * 3. Restart your dev server
 * 
 * The API will fetch all POAPs associated with a wallet address
 * and store them in the user_poaps table for compatibility matching.
 */

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE || ""
  if (!url || !serviceRole) return null
  return createClient(url, serviceRole)
}

const getSupabaseServer = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
      },
    },
  )
}

export async function syncPOAPsFromAPI(userId: string, walletAddress: string) {
  try {
    const supabase = await getSupabaseServer()
    const admin = getSupabaseAdmin()

    console.log(`[POAP Sync] Starting sync for wallet: ${walletAddress}`)

    // Validate wallet format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      console.error(`[POAP Sync] Invalid wallet format: ${walletAddress}`)
      throw new Error("Invalid wallet address format")
    }

    // Fetch POAPs from POAP API using the correct endpoint
    const apiKey = process.env.POAP_API_KEY || process.env.NEXT_PUBLIC_POAP_API_KEY
    
    if (!apiKey) {
      console.error(`[POAP Sync] No API key found in environment`)
      throw new Error("POAP API key not configured. Please add POAP_API_KEY to your .env.local file")
    }

    const headers: HeadersInit = {
      'X-API-Key': apiKey,
      'Accept': 'application/json'
    }

    const apiUrl = `https://api.poap.tech/actions/scan/${walletAddress}`
    console.log(`[POAP Sync] Fetching from: ${apiUrl}`)

    // Use the correct POAP API v2 endpoint
    const response = await fetch(apiUrl, {
      headers,
      cache: 'no-store'
    })

    console.log(`[POAP Sync] API Response Status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[POAP Sync] API error: ${response.status} ${response.statusText}`, errorText)
      
      if (response.status === 401) {
        throw new Error("Invalid POAP API key. Please check your POAP_API_KEY in .env.local")
      }
      
      if (response.status === 404) {
        // 404 might mean no POAPs found, return empty result
        console.log(`[POAP Sync] No POAPs found for wallet ${walletAddress}`)
        return { count: 0, wallet: walletAddress }
      }
      
      throw new Error(`Failed to fetch POAPs: ${response.statusText}`)
    }

    const poaps = await response.json()
    
    if (!Array.isArray(poaps)) {
      throw new Error("Invalid response from POAP API")
    }

    console.log(`[POAP Sync] Found ${poaps.length} POAPs for wallet ${walletAddress}`)
    console.log(`[POAP Sync] Sample POAP structure:`, poaps[0])

    // Store wallet address in profile (use admin if available to bypass RLS)
    if (admin) {
      const { error: updErr } = await admin
        .from("profiles")
        .update({ wallet_address: walletAddress })
        .eq("user_id", userId)
      if (updErr) {
        console.error("[POAP Sync] Admin update profile error:", updErr)
      }
    } else {
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ wallet_address: walletAddress })
        .eq("user_id", userId)
      if (updErr) {
        console.error("[POAP Sync] Update profile error:", updErr)
      }
    }

    // Prepare POAP data for insertion based on API documentation
    // API returns: { event: { id, name, image_url, start_date, ... }, tokenId, chain, owner }
    const poapData = poaps.map((poap: any) => ({
      wallet_address: walletAddress,
      event_id: String(poap.event?.id || ''),
      event_name: poap.event?.name || "Unknown Event",
      image_url: poap.event?.image_url ? `${poap.event.image_url}?size=small` : '',
      event_date: poap.event?.start_date || new Date().toISOString(),
    })).filter(p => p.event_id) // Only include POAPs with valid event IDs

    // Upsert POAPs (avoid duplicates)
    if (poapData.length > 0) {
      if (admin) {
        const { error } = await admin
          .from("user_poaps")
          .upsert(poapData, { onConflict: "wallet_address,event_id" })
        if (error) {
          console.error("[POAP Sync] Admin upsert POAPs error:", error)
          // Do not throw to allow display fallback
        }
      } else {
        const { error } = await supabase
          .from("user_poaps")
          .upsert(poapData, { onConflict: "wallet_address,event_id" })
        if (error) {
          console.error("[POAP Sync] Upsert POAPs error:", error)
          // Do not throw to allow display fallback
        }
      }
    }

    return { count: poapData.length, wallet: walletAddress }
  } catch (error) {
    console.error("[POAP Sync] Error:", error)
    throw error
  }
}

export async function getUserPOAPs(userId: string) {
  try {
    const supabase = await getSupabaseServer()

    // Get user's wallet address
    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_address")
      .eq("user_id", userId)
      .single()

    const wallet = profile?.wallet_address
    if (!wallet) {
      return []
    }

    // First try DB
    const { data, error } = await supabase
      .from("user_poaps")
      .select("*")
      .eq("wallet_address", wallet)
      .order("event_date", { ascending: false })

    if (error) {
      console.error("[Get POAPs] DB Error:", error)
    }

    if (data && data.length > 0) {
      return data
    }

    // Fallback to POAP API directly if DB empty or error
    try {
      const apiKey = process.env.POAP_API_KEY || process.env.NEXT_PUBLIC_POAP_API_KEY
      if (!apiKey) return []

      const headers: HeadersInit = { 'X-API-Key': apiKey, 'Accept': 'application/json' }
      const response = await fetch(`https://api.poap.tech/actions/scan/${wallet}`, { headers, cache: 'no-store' })
      if (!response.ok) return []
      const poaps = await response.json()
      if (!Array.isArray(poaps)) return []

      return poaps.map((poap: any) => ({
        wallet_address: wallet,
        event_id: String(poap.event?.id || ''),
        event_name: poap.event?.name || "Unknown Event",
        image_url: poap.event?.image_url ? `${poap.event.image_url}?size=small` : '',
        event_date: poap.event?.start_date || new Date().toISOString(),
      })).filter((p: any) => p.event_id)
    } catch (e) {
      console.error("[Get POAPs] API fallback error:", e)
      return []
    }
  } catch (error) {
    console.error("[Get POAPs] Error:", error)
    return []
  }
}

export async function getSharedPOAPsCount(userId1: string, userId2: string) {
  try {
    const supabase = await getSupabaseServer()

    // Get wallet addresses for both users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, wallet_address")
      .in("user_id", [userId1, userId2])

    if (!profiles || profiles.length !== 2) {
      return 0
    }

    const wallet1 = profiles.find((p: any) => p.user_id === userId1)?.wallet_address
    const wallet2 = profiles.find((p: any) => p.user_id === userId2)?.wallet_address

    if (!wallet1 || !wallet2) {
      return 0
    }

    // Use the database function to get shared count
    const { data, error } = await supabase.rpc("get_shared_poaps_count", {
      p_wallet_1: wallet1,
      p_wallet_2: wallet2,
    })

    if (error) {
      console.error("Error getting shared POAPs count:", error)
      return 0
    }

    return data || 0
  } catch (error) {
    console.error("[Shared POAPs Count] Error:", error)
    return 0
  }
}

export async function getSharedPOAPs(userId1: string, userId2: string) {
  try {
    const supabase = await getSupabaseServer()

    // Get wallet addresses for both users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, wallet_address")
      .in("user_id", [userId1, userId2])

    if (!profiles || profiles.length !== 2) {
      return []
    }

    const wallet1 = profiles.find((p: any) => p.user_id === userId1)?.wallet_address
    const wallet2 = profiles.find((p: any) => p.user_id === userId2)?.wallet_address

    if (!wallet1 || !wallet2) {
      return []
    }

    // Use the database function to get shared POAPs
    const { data, error } = await supabase.rpc("get_shared_poaps", {
      p_wallet_1: wallet1,
      p_wallet_2: wallet2,
    })

    if (error) {
      console.error("Error getting shared POAPs:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[Shared POAPs] Error:", error)
    return []
  }
}

