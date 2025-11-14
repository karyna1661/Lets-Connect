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

export async function recordSwipe(userId: string, targetUserId: string, direction: "left" | "right", isDevMode = false) {
  try {
    // In dev mode with mock users, skip database operations
    if (isDevMode && targetUserId.startsWith('mock_')) {
      console.log(`[Dev Mode] Simulated swipe: ${direction} on ${targetUserId}`)
      // Simulate a 30% match rate for right swipes in dev mode
      const isMatch = direction === "right" && Math.random() < 0.3
      return { success: true, isMatch }
    }

    const supabase = await getSupabaseServer()

    // Get shared POAP count
    const { data: sharedCount } = await supabase.rpc("get_shared_poaps_count", {
      p_user_id: userId,
      p_target_user_id: targetUserId,
    })

    // Record the swipe
    const { data, error } = await supabase
      .from("swipes")
      .upsert(
        {
          user_id: userId,
          target_user_id: targetUserId,
          direction,
          shared_poap_count: sharedCount || 0,
        },
        { onConflict: "user_id,target_user_id" },
      )
      .select()

    if (error) throw error

    // If right swipe, check for mutual right swipes (matches)
    if (direction === "right") {
      const { data: mutualSwipe } = await supabase
        .from("swipes")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("target_user_id", userId)
        .eq("direction", "right")
        .single()

      if (mutualSwipe) {
        // Create a match
        await createMatch(userId, targetUserId, sharedCount || 0)
      }
    }

    return { success: true, isMatch: false }
  } catch (error) {
    console.error("[v0] Error recording swipe:", error)
    throw error
  }
}

export async function createMatch(userAId: string, userBId: string, sharedPoapCount: number) {
  try {
    const supabase = await getSupabaseServer()

    // Get shared POAPs details
    const { data: sharedPoaps } = await supabase.rpc("get_shared_poaps", {
      p_user_id: userAId,
      p_target_user_id: userBId,
    })

    const poapHashes = (sharedPoaps || []).map((p: any) => p.poap_hash)

    // Insert match
    const { error } = await supabase.from("matches").upsert(
      {
        user_a_id: userAId,
        user_b_id: userBId,
        shared_poaps: poapHashes,
        status: "active",
      },
      { onConflict: "user_a_id,user_b_id" },
    )

    if (error && error.code !== "23505") throw error // 23505 is unique violation

    // Also create a connection
    const { data: targetProfile } = await supabase.from("profiles").select("*").eq("user_id", userBId).single()

    if (targetProfile) {
      await supabase.from("connections").upsert(
        {
          user_id: userAId,
          connected_user_id: userBId,
          connection_data: targetProfile,
          connection_type: "swipe",
        },
        { onConflict: "user_id,connected_user_id" },
      )
    }
  } catch (error) {
    console.error("[v0] Error creating match:", error)
  }
}

export async function getUserMatches(userId: string) {
  try {
    const supabase = await getSupabaseServer()

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .eq("status", "active")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error fetching matches:", error)
    throw error
  }
}
