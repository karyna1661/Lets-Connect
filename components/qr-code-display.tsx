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
    instagram: profile.instagram,
    github: profile.github,
    facebook: profile.facebook,
    youtube: profile.youtube,
    website: profile.website,
    farcaster: profile.farcaster,
  })

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-white">
      <QRCodeSVG value={qrData} size={300} level="H" includeMargin={true} className="rounded-2xl" />
    </div>
  )
}
