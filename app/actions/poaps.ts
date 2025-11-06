"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const getSupabaseServer = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    },
  )
}

export async function syncPOAPsFromAPI(userId: string, walletAddress: string) {
  try {
    const supabase = await getSupabaseServer()

    // Validate wallet format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new Error("Invalid wallet address format")
    }

    // Fetch POAPs from POAP API
    const apiKey = process.env.NEXT_PUBLIC_POAP_API_KEY
    const headers: HeadersInit = {}
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const response = await fetch(`https://api.poap.tech/actions/scan/${walletAddress}`, {
      headers,
    })

    if (!response.ok) {
      console.error(`POAP API error: ${response.status} ${response.statusText}`)
      throw new Error("Failed to fetch POAPs from POAP API")
    }

    const poaps = await response.json()
    
    if (!Array.isArray(poaps)) {
      throw new Error("Invalid response from POAP API")
    }

    // Store wallet address in profile
    await supabase
      .from("profiles")
      .update({ wallet_address: walletAddress })
      .eq("user_id", userId)

    // Prepare POAP data for insertion
    const poapData = poaps.map((poap: any) => ({
      wallet_address: walletAddress,
      event_id: poap.event?.id || poap.eventId,
      event_name: poap.event?.name || poap.eventName || "Unknown Event",
      image_url: poap.event?.image_url || poap.event?.imageUrl || poap.imageUrl,
      event_date: poap.event?.start_date || poap.event?.startDate || poap.eventDate || new Date().toISOString(),
    }))

    // Upsert POAPs (avoid duplicates)
    if (poapData.length > 0) {
      const { error } = await supabase
        .from("user_poaps")
        .upsert(poapData, { onConflict: "wallet_address,event_id" })

      if (error) {
        console.error("Error upserting POAPs:", error)
        throw new Error("Failed to save POAPs to database")
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

    if (!profile?.wallet_address) {
      return []
    }

    const { data, error } = await supabase
      .from("user_poaps")
      .select("*")
      .eq("wallet_address", profile.wallet_address)
      .order("event_date", { ascending: false })

    if (error) throw error
    return data || []
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

