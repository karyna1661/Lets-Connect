"use client"

import { QRCodeSVG } from "qrcode.react"
import type { Profile } from "@/lib/types"

interface QRCodeDisplayProps {
  profile: Profile
}

export function QRCodeDisplay({ profile }: QRCodeDisplayProps) {
  const qrData = JSON.stringify({
    user_id: profile.user_id,
    name: profile.name,
    bio: profile.bio,
    email: profile.email,
    linkedin: profile.linkedin,
    twitter: profile.twitter,
    x: profile.x,
    instagram: profile.instagram,
    github: profile.github,
    youtube: profile.youtube,
    website: profile.website,
    farcaster: profile.farcaster,
    profile_image: profile.profile_image,
    city: profile.city,
    role: profile.role,
  })

  return (
    <div 
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-white max-w-sm w-full"
      style={{
        boxShadow: `
          0 0 0 1px rgba(0,0,0,0.08),
          0 20px 60px rgba(0,0,0,0.2),
          0 40px 80px rgba(0,0,0,0.15)
        `,
      }}
    >
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 mb-4">
        <QRCodeSVG 
          value={qrData} 
          size={256} 
          level="H" 
          includeMargin={true} 
          className="w-full h-auto rounded-xl" 
        />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Scan to Connect</p>
      </div>
    </div>
  )
}
