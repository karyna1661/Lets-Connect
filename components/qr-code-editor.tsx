"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { X, Eye, EyeOff } from "lucide-react"
import type { Profile } from "@/lib/types"

interface QRCodeEditorProps {
  profile: Profile
  onClose: () => void
}

export function QRCodeEditor({ profile, onClose }: QRCodeEditorProps) {
  // All fields that can be toggled
  const [visibleFields, setVisibleFields] = useState({
    name: true, // Always visible
    bio: true,
    email: true,
    city: true,
    role: true,
    linkedin: true,
    x: true,
    instagram: true,
    github: true,
    youtube: true,
    farcaster: true,
    telegram: true,
    tiktok: true,
    ens: true,
    zora: true,
    paragraph: true,
    substack: true,
    profile_image: true,
  })

  const toggleField = (field: keyof typeof visibleFields) => {
    if (field === 'name') return // Name is always required
    setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Build QR data with only visible fields
  const getQRData = () => {
    const data: any = {
      user_id: profile.user_id, // Always include user_id
      name: profile.name, // Always include name
    }

    if (visibleFields.bio && profile.bio) data.bio = profile.bio
    if (visibleFields.email && profile.email) data.email = profile.email
    if (visibleFields.city && profile.city) data.city = profile.city
    if (visibleFields.role && profile.role) data.role = profile.role
    if (visibleFields.linkedin && profile.linkedin) data.linkedin = profile.linkedin
    if (visibleFields.x && profile.x) data.x = profile.x
    if (visibleFields.instagram && profile.instagram) data.instagram = profile.instagram
    if (visibleFields.github && profile.github) data.github = profile.github
    if (visibleFields.youtube && profile.youtube) data.youtube = profile.youtube
    if (visibleFields.farcaster && profile.farcaster) data.farcaster = profile.farcaster
    if (visibleFields.telegram && profile.telegram) data.telegram = profile.telegram
    if (visibleFields.tiktok && profile.tiktok) data.tiktok = profile.tiktok
    if (visibleFields.ens && profile.ens) data.ens = profile.ens
    if (visibleFields.zora && profile.zora) data.zora = profile.zora
    if (visibleFields.paragraph && profile.paragraph) data.paragraph = profile.paragraph
    if (visibleFields.substack && profile.substack) data.substack = profile.substack
    if (visibleFields.profile_image && profile.profile_image) data.profile_image = profile.profile_image

    return JSON.stringify(data)
  }

  const fieldLabels: { [key: string]: string } = {
    bio: "Bio",
    email: "Email",
    city: "City",
    role: "Role",
    linkedin: "LinkedIn",
    x: "X (Twitter)",
    instagram: "Instagram",
    github: "GitHub",
    youtube: "YouTube",
    farcaster: "Farcaster",
    telegram: "Telegram",
    tiktok: "TikTok",
    ens: "ENS Domain",
    zora: "Zora",
    paragraph: "Paragraph",
    substack: "Substack",
    profile_image: "Profile Photo",
  }

  // Only show fields that have values
  const availableFields = Object.keys(fieldLabels).filter(key => {
    const value = profile[key as keyof Profile]
    return value && value !== ''
  })

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black"
      onClick={onClose}
    >
      <div className="min-h-screen p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Customize QR Code</h2>
            <p className="text-gray-400 text-sm">Toggle fields to share</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content - two columns on desktop */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
          {/* Left: QR Code Preview */}
          <div className="flex flex-col items-center justify-start">
            <div 
              className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-white w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow: `
                  0 0 0 1px rgba(255,255,255,0.08),
                  0 20px 60px rgba(0,0,0,0.4),
                  0 40px 80px rgba(0,0,0,0.3)
                `,
              }}
            >
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 mb-4">
                <QRCodeSVG 
                  value={getQRData()} 
                  size={320}
                  level="H" 
                  includeMargin={true} 
                  className="w-full h-auto rounded-xl" 
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Scan to Connect</p>
              </div>
            </div>

            {/* Info text */}
            <div className="mt-6 text-center max-w-md">
              <p className="text-sm text-gray-400">
                Larger QR code for faster scanning (&lt; 5 seconds)
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {Object.values(visibleFields).filter(Boolean).length} fields visible
              </p>
            </div>
          </div>

          {/* Right: Field Toggles */}
          <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-bold text-lg mb-4">Visible Fields</h3>
              
              {availableFields.length === 0 ? (
                <p className="text-gray-400 text-sm">Complete your profile to add more fields</p>
              ) : (
                <div className="space-y-3">
                  {/* Name - always visible */}
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/20">
                    <span className="text-white font-medium text-sm">Name</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Required</span>
                      <Eye className="w-4 h-4 text-green-400" />
                    </div>
                  </div>

                  {/* Toggleable fields */}
                  {availableFields.map((field) => (
                    <div
                      key={field}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        visibleFields[field as keyof typeof visibleFields]
                          ? 'bg-white/10 border-white/20 hover:bg-white/15'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => toggleField(field as keyof typeof visibleFields)}
                    >
                      <span className={`font-medium text-sm ${
                        visibleFields[field as keyof typeof visibleFields]
                          ? 'text-white'
                          : 'text-gray-500'
                      }`}>
                        {fieldLabels[field]}
                      </span>
                      <button
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleField(field as keyof typeof visibleFields)
                        }}
                      >
                        {visibleFields[field as keyof typeof visibleFields] ? (
                          <Eye className="w-4 h-4 text-green-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
