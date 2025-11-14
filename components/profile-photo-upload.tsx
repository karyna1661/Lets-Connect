"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, X, Upload } from "lucide-react"
import { uploadProfileImage, deleteProfileImage } from "@/app/actions/upload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfilePhotoUploadProps {
  userId: string
  currentImageUrl?: string
  onUploadSuccess: (imageUrl: string) => void
  userName?: string
}

export function ProfilePhotoUpload({ userId, currentImageUrl, onUploadSuccess, userName }: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB")
      return
    }

    try {
      setUploading(true)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Convert File to serializable format for server action
      const arrayBuffer = await file.arrayBuffer()
      const fileData = {
        name: file.name,
        type: file.type,
        arrayBuffer: arrayBuffer,
      }

      // Upload to Supabase
      const imageUrl = await uploadProfileImage(userId, fileData)
      onUploadSuccess(imageUrl)
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image. Please try again."
      alert(errorMessage)
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!currentImageUrl) return

    try {
      setUploading(true)
      await deleteProfileImage(currentImageUrl)
      setPreviewUrl(null)
      onUploadSuccess("")
    } catch (error) {
      console.error("[v0] Error removing image:", error)
      alert("Failed to remove image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const getInitials = () => {
    if (!userName) return "?"
    return userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="w-32 h-32 border-4 border-black">
          <AvatarImage src={previewUrl || undefined} alt={userName || "Profile"} />
          <AvatarFallback className="bg-gray-200 text-black text-3xl font-bold">{getInitials()}</AvatarFallback>
        </Avatar>

        {previewUrl && !uploading && (
          <button
            onClick={handleRemovePhoto}
            className="absolute -top-2 -right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors border-2 border-white shadow-lg"
            title="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <Upload className="w-5 h-5 animate-pulse" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            <span>{previewUrl ? "Change Photo" : "Add Photo"}</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">JPG, PNG or GIF. Max size 5MB.</p>
    </div>
  )
}
