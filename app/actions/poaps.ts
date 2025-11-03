"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const getSupabaseServer = () => {
  const cookieStore = cookies()
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
    const supabase = getSupabaseServer()

    // Validate wallet format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new Error("Invalid wallet address format")
    }

    // Fetch POAPs from POAP.xyz API
    const response = await fetch(`https://api.poap.xyz/actions/scan/${walletAddress}`)

    if (!response.ok) {
      throw new Error("Failed to fetch POAPs from POAP API")
    }

    const poaps = await response.json()

    // Insert or update POAPs in database
    for (const poap of poaps) {
      await supabase.from("poaps").upsert(
        {
          user_id: userId,
          poap_hash: poap.tokenId || poap.id,
          event_name: poap.event?.name,
          event_id: poap.event?.id,
          event_date: poap.event?.eventDate,
          event_image_url: poap.event?.image_url,
          is_visible: true,
        },
        { onConflict: "user_id,poap_hash" },
      )
    }

    return { success: true, count: poaps.length }
  } catch (error) {
    console.error("[v0] Error syncing POAPs:", error)
    throw error
  }
}

export async function getUserPOAPs(userId: string) {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from("poaps")
      .select("*")
      .eq("user_id", userId)
      .eq("is_visible", true)
      .order("event_date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error fetching POAPs:", error)
    throw error
  }
}

export async function updatePOAPVisibility(poapId: string, isVisible: boolean) {
  try {
    const supabase = getSupabaseServer()

    const { error } = await supabase.from("poaps").update({ is_visible: isVisible }).eq("id", poapId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating POAP visibility:", error)
    throw error
  }
}
