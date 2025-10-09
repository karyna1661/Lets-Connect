"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"

export async function getProfile(userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error fetching profile:", error)
    throw new Error("Failed to fetch profile")
  }

  return data
}

export async function upsertProfile(profile: Profile) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        ...profile,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )
    .select()
    .single()

  if (error) {
    console.error("[v0] Error upserting profile:", error)
    throw new Error("Failed to save profile")
  }

  return data
}

export async function getProfileByUserId(userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error fetching profile by user_id:", error)
    return null
  }

  return data
}
