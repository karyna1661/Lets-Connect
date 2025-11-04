"use client"

import { useState } from "react"
import { Heart, X, Zap, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FlipCard } from "@/components/flip-card"
import type { Profile } from "@/lib/types"

interface SwipeCardProps {
  profile: Profile
  compatibilityScore: number
  sharedPOAPs: number
  onSwipe: (direction: "left" | "right") => void
  isLoading?: boolean
}

export function SwipeCard({ profile, compatibilityScore, sharedPOAPs, onSwipe, isLoading }: SwipeCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleSwipe = (direction: "left" | "right") => {
    setIsAnimating(true)
    setTimeout(() => {
      onSwipe(direction)
      setIsAnimating(false)
    }, 300)
  }

  const frontContent = (
    <div
      className={`
        relative w-full max-w-sm mx-auto bg-white rounded-3xl shadow-2xl border-2 border-black
        transition-all duration-300 transform h-full
        ${isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"}
      `}
    >
      <div className="aspect-square relative overflow-hidden rounded-t-3xl bg-gray-200">
        <Avatar className="w-full h-full rounded-none border-0">
          <AvatarImage src={profile.profile_image || undefined} alt={profile.name} className="object-cover" />
          <AvatarFallback className="rounded-none text-3xl font-bold">
            {profile.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "?"}
          </AvatarFallback>
        </Avatar>

        {compatibilityScore > 0 && (
          <div className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-full flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="font-bold">{Math.round(compatibilityScore)}%</span>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 text-white bg-black bg-opacity-60 px-3 py-2 rounded-full text-xs font-semibold">
          <ChevronDown className="w-3 h-3" />
          Tap to flip
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-black mb-1">{profile.name}</h2>
          <p className="text-gray-700 font-medium">{profile.role || "Networker"}</p>
          {profile.city && <p className="text-gray-600 text-sm">{profile.city}</p>}
        </div>

        {profile.bio && <p className="text-gray-700 mb-4 line-clamp-2">{profile.bio}</p>}

        {sharedPOAPs > 0 && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
            <p className="text-sm font-semibold text-black">
              {sharedPOAPs} shared event{sharedPOAPs !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const backContent = (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-gray-900 to-black rounded-3xl border-2 border-white shadow-2xl h-full p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-white text-xl font-bold mb-4">More about {profile.name}</h3>

        {profile.interests && profile.interests.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-300 text-sm font-semibold mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, idx) => (
                <span key={idx} className="px-3 py-1 bg-white text-black text-xs font-bold rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.bio && (
          <div className="mb-6">
            <p className="text-gray-300 text-sm font-semibold mb-2">Bio</p>
            <p className="text-gray-200 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSwipe("left")}
          disabled={isLoading || isAnimating}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black border-2 border-white rounded-xl hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
        >
          <X className="w-5 h-5" />
          Pass
        </button>
        <button
          onClick={() => handleSwipe("right")}
          disabled={isLoading || isAnimating}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black border-2 border-white rounded-xl hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
        >
          <Heart className="w-5 h-5" />
          Like
        </button>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-sm mx-auto h-full">
      <FlipCard front={frontContent} back={backContent} duration={300} zDepth="lg" />
    </div>
  )
}
