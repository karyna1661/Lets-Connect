"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"
import { revalidatePath } from "next/cache"

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

  console.log('[Upsert Profile] Attempting to save:', JSON.stringify(profile, null, 2))

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

  console.log('[Upsert Profile] Successfully saved:', JSON.stringify(data, null, 2))
  revalidatePath("/")
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

/**
 * Merge profiles when a user links a new authentication method
 * This ensures all login methods point to the same profile
 */
export async function mergeProfileOnAccountLink(newUserId: string, existingEmail?: string) {
  const supabase = await getSupabaseServerClient()

  try {
    // Check if there's an existing profile with this email
    if (existingEmail) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", existingEmail)
        .single()

      if (existingProfile && existingProfile.user_id !== newUserId) {
        // Merge data from both profiles, keeping the most complete data
        const mergedProfile = {
          ...existingProfile,
          user_id: newUserId,  // Use new Privy user ID
          email: existingEmail,  // Ensure email is saved
          // Keep existing data, only update if new fields are not empty
          updated_at: new Date().toISOString(),
        }

        // Update the profile with new user_id
        await supabase
          .from("profiles")
          .upsert(mergedProfile, { onConflict: "user_id" })

        // Delete old profile if it exists
        await supabase
          .from("profiles")
          .delete()
          .eq("user_id", existingProfile.user_id)

        console.log('[Profile Merge] Successfully merged profiles:', existingProfile.user_id, '->', newUserId)
        return mergedProfile
      }
    }

    return null
  } catch (error) {
    console.error('[Profile Merge] Error merging profiles:', error)
    return null
  }
}
