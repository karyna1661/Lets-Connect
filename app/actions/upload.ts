"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function uploadProfileImage(userId: string, fileData: { name: string; type: string; arrayBuffer: ArrayBuffer }) {
  try {
    console.log('[Upload] Starting upload:', { userId, fileName: fileData.name, fileSize: fileData.arrayBuffer.byteLength, fileType: fileData.type })

    const supabase = await getSupabaseServerClient()

    // Validate userId
    if (!userId || userId.trim() === '') {
      console.error('[Upload] Invalid userId:', userId)
      throw new Error('Invalid user ID. Please sign in again.')
    }

    // Create a unique file name
    const fileExt = fileData.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `profiles/${fileName}`

    console.log('[Upload] Uploading to path:', filePath)

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(fileData.arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("profile-images").upload(filePath, buffer, {
      contentType: fileData.type,
      upsert: true,
    })

    if (error) {
      console.error("[Upload] Error uploading image:", error)
      console.error('[Upload] Error details:', JSON.stringify(error, null, 2))
      throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`)
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(filePath)

    console.log('[Upload] Image uploaded successfully:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('[Upload] Caught error:', error)
    // Ensure error is serializable
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
    console.error('[Upload] Error message:', errorMessage)
    throw new Error(errorMessage)
  }
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
