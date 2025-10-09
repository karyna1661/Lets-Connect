"use client"

import { QRCodeSVG } from "qrcode.react"
import { useMemo } from "react"
import type { Profile } from "@/lib/types"

interface QRCodeDisplayProps {
  profile: Profile
}

export function QRCodeDisplay({ profile }: QRCodeDisplayProps) {
  const qrData = useMemo(() => {
    const data: any = {
      user_id: profile.user_id,
      name: profile.name,
    }
    
    // Only include fields that exist and have values
    if (profile.bio) data.bio = profile.bio
    if (profile.email) data.email = profile.email
    if (profile.phone) data.phone = profile.phone
    if (profile.linkedin) data.linkedin = profile.linkedin
    if (profile.twitter) data.twitter = profile.twitter
    if (profile.instagram) data.instagram = profile.instagram
    if (profile.github) data.github = profile.github
    if (profile.facebook) data.facebook = profile.facebook
    if (profile.youtube) data.youtube = profile.youtube
    if (profile.website) data.website = profile.website
    if (profile.farcaster) data.farcaster = profile.farcaster
    
    return JSON.stringify(data)
  }, [profile])

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border-4 border-white w-full hover-lift">
      <div className="relative">
        <QRCodeSVG 
          value={qrData} 
          size={240} 
          level="H" 
          includeMargin={true} 
          className="rounded-xl sm:rounded-2xl w-full h-auto max-w-full" 
        />
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      </div>
    </div>
  )
}
