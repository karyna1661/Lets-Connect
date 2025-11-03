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

export async function getDiscoveryProfiles(userId: string, city?: string) {
  try {
    const supabase = getSupabaseServer()

    let query = supabase.from("profiles").select("*").eq("is_discoverable", true).neq("user_id", userId)

    if (city) {
      query = query.eq("city", city)
    }

    const { data, error } = await query.order("updated_at", { ascending: false }).limit(50)

    if (error) throw error

    // Get compatibility scores for each profile
    const profilesWithScores = await Promise.all(
      (data || []).map(async (profile) => {
        const score = await calculateCompatibilityScore(userId, profile.user_id)
        return { ...profile, compatibility_score: score }
      }),
    )

    return profilesWithScores.sort((a, b) => b.compatibility_score - a.compatibility_score)
  } catch (error) {
    console.error("[v0] Error fetching discovery profiles:", error)
    throw error
  }
}

export async function calculateCompatibilityScore(userId: string, targetUserId: string) {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase.rpc("calculate_compatibility_score", {
      p_user_id: userId,
      p_target_user_id: targetUserId,
    })

    if (error) throw error
    return data || 0
  } catch (error) {
    console.error("[v0] Error calculating compatibility score:", error)
    return 0
  }
}

export async function getSharedPOAPs(userId: string, targetUserId: string) {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase.rpc("get_shared_poaps", {
      p_user_id: userId,
      p_target_user_id: targetUserId,
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error fetching shared POAPs:", error)
    return []
  }
}
