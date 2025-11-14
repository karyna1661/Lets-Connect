"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Connection, Profile } from "@/lib/types"
import { revalidatePath } from "next/cache"

export async function getConnections(userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching connections:", error)
    throw new Error("Failed to fetch connections")
  }

  return data as Connection[]
}

export async function addConnection(userId: string, connectionData: Profile, notes?: string) {
  const supabase = await getSupabaseServerClient()

  console.log('[Connection] Adding connection:', { userId, connectedUserId: connectionData.user_id, name: connectionData.name })

  // Validate input
  if (!userId || !connectionData.user_id) {
    console.error('[Connection] Invalid input:', { userId, connectionData })
    throw new Error('Invalid user IDs')
  }

  // Create bidirectional connection - both users will see each other
  const connection1 = {
    user_id: userId,
    connected_user_id: connectionData.user_id,
    connection_data: connectionData,
    notes: notes || "",
  }

  // Get the current user's profile to save in the reverse connection
  const { data: currentUserProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (profileError) {
    console.error('[Connection] Error fetching current user profile:', profileError)
  }

  const connection2 = {
    user_id: connectionData.user_id,
    connected_user_id: userId,
    connection_data: currentUserProfile || { user_id: userId, name: "Unknown" },
    notes: "",
  }

  // Insert both connections
  const [result1, result2] = await Promise.allSettled([
    supabase.from("connections").insert(connection1).select().single(),
    supabase.from("connections").insert(connection2).select().single(),
  ])

  // Check if primary connection succeeded
  if (result1.status === "rejected" || (result1.status === "fulfilled" && result1.value.error)) {
    const error = result1.status === "rejected" ? result1.reason : result1.value.error
    console.error("[Connection] Error adding connection:", error)
    console.error('[Connection] Error details:', JSON.stringify(error, null, 2))
    throw new Error(`Failed to add connection: ${error?.message || 'Unknown error'}`)
  }

  // Log if reverse connection failed (non-critical)
  if (result2.status === "rejected" || (result2.status === "fulfilled" && result2.value.error)) {
    console.warn("[Connection] Reverse connection failed (non-critical):", 
      result2.status === "rejected" ? result2.reason : result2.value.error)
  }

  console.log('[Connection] Connection added successfully')
  revalidatePath("/")
  return result1.status === "fulfilled" ? result1.value.data : null
}

export async function updateConnectionNotes(connectionId: string, notes: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("connections").update({ notes }).eq("id", connectionId).select().single()

  if (error) {
    console.error("[v0] Error updating connection notes:", error)
    throw new Error("Failed to update notes")
  }

  revalidatePath("/")
  return data
}

export async function deleteConnection(connectionId: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.from("connections").delete().eq("id", connectionId)

  if (error) {
    console.error("[v0] Error deleting connection:", error)
    throw new Error("Failed to delete connection")
  }

  revalidatePath("/")
}
