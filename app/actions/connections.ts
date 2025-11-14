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

  // Get the current user's profile to save in the reverse connection
  console.log('[Connection] Fetching current user profile:', userId)
  const { data: currentUserProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (profileError || !currentUserProfile) {
    console.error('[Connection] Error fetching current user profile:', profileError)
    console.error('[Connection] Profile error details:', JSON.stringify(profileError, null, 2))
    throw new Error('Failed to fetch your profile. Please complete your profile first.')
  }

  console.log('[Connection] Current user profile found:', { userId: currentUserProfile.user_id, name: currentUserProfile.name })

  // Create bidirectional connection - both users will see each other
  const connection1 = {
    user_id: userId,
    connected_user_id: connectionData.user_id,
    connection_data: connectionData,
    notes: notes || "",
  }

  const connection2 = {
    user_id: connectionData.user_id,
    connected_user_id: userId,
    connection_data: currentUserProfile,
    notes: "",
  }

  console.log('[Connection] Creating bidirectional connections...')
  console.log('[Connection] Connection 1 (scanner → scanned):', { from: userId, to: connectionData.user_id })
  console.log('[Connection] Connection 2 (scanned → scanner):', { from: connectionData.user_id, to: userId })

  // Insert both connections
  const [result1, result2] = await Promise.allSettled([
    supabase.from("connections").insert(connection1).select().single(),
    supabase.from("connections").insert(connection2).select().single(),
  ])

  // Check if primary connection succeeded
  if (result1.status === "rejected" || (result1.status === "fulfilled" && result1.value.error)) {
    const error = result1.status === "rejected" ? result1.reason : result1.value.error
    console.error("[Connection] Error adding primary connection:", error)
    console.error('[Connection] Error details:', JSON.stringify(error, null, 2))
    throw new Error(`Failed to add connection: ${error?.message || 'Unknown error'}`)
  }

  // Check if reverse connection succeeded - THIS IS CRITICAL TOO
  if (result2.status === "rejected" || (result2.status === "fulfilled" && result2.value.error)) {
    const error = result2.status === "rejected" ? result2.reason : result2.value.error
    console.error("[Connection] Error adding reverse connection (CRITICAL):", error)
    console.error('[Connection] Reverse connection error details:', JSON.stringify(error, null, 2))
    
    // Delete the first connection since bidirectional failed
    if (result1.status === "fulfilled" && result1.value.data?.id) {
      console.log('[Connection] Cleaning up primary connection due to reverse failure...')
      await supabase.from("connections").delete().eq("id", result1.value.data.id)
    }
    
    throw new Error(`Failed to create bidirectional connection: ${error?.message || 'Unknown error'}`)
  }

  console.log('[Connection] Both connections added successfully')
  console.log('[Connection] Primary connection ID:', result1.value.data?.id)
  console.log('[Connection] Reverse connection ID:', result2.value.data?.id)
  
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
