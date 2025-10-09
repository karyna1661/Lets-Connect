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

  const { data, error } = await supabase
    .from("connections")
    .insert({
      user_id: userId,
      connected_user_id: connectionData.user_id,
      connection_data: connectionData,
      notes: notes || "",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error adding connection:", error)
    throw new Error("Failed to add connection")
  }

  revalidatePath("/")
  return data
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
