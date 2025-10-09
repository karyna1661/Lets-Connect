"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function uploadProfileImage(userId: string, file: File) {
  const supabase = await getSupabaseServerClient()

  // Create a unique file name
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `profiles/${fileName}`

  // Convert File to ArrayBuffer then to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage.from("profile-images").upload(filePath, buffer, {
    contentType: file.type,
    upsert: true,
  })

  if (error) {
    console.error("[v0] Error uploading image:", error)
    throw new Error("Failed to upload image")
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("profile-images").getPublicUrl(filePath)

  return publicUrl
}

export async function deleteProfileImage(imageUrl: string) {
  const supabase = await getSupabaseServerClient()

  // Extract file path from URL
  const urlParts = imageUrl.split("/profile-images/")
  if (urlParts.length < 2) return

  const filePath = urlParts[1]

  const { error } = await supabase.storage.from("profile-images").remove([filePath])

  if (error) {
    console.error("[v0] Error deleting image:", error)
    throw new Error("Failed to delete image")
  }
}
