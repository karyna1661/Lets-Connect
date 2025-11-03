"use client"

import { useState } from "react"
import { Heart, X, Zap } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

  return (
    <div
      className={`
        relative w-full max-w-sm mx-auto bg-white rounded-3xl shadow-2xl border-2 border-black
        transition-all duration-300 transform
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
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-black mb-1">{profile.name}</h2>
          <p className="text-gray-700 font-medium">{profile.role || "Networker"}</p>
          {profile.city && <p className="text-gray-600 text-sm">{profile.city}</p>}
        </div>

        {profile.bio && <p className="text-gray-700 mb-4 line-clamp-3">{profile.bio}</p>}

        {sharedPOAPs > 0 && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
            <p className="text-sm font-semibold text-black">
              {sharedPOAPs} shared event{sharedPOAPs !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {profile.interests.slice(0, 3).map((interest, idx) => (
              <span key={idx} className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                {interest}
              </span>
            ))}
            {profile.interests.length > 3 && (
              <span className="px-3 py-1 bg-gray-300 text-black text-xs font-semibold rounded-full">
                +{profile.interests.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 p-6 border-t-2 border-black bg-gray-50">
        <button
          onClick={() => handleSwipe("left")}
          disabled={isLoading || isAnimating}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-colors font-semibold disabled:opacity-50"
        >
          <X className="w-5 h-5" />
          Pass
        </button>
        <button
          onClick={() => handleSwipe("right")}
          disabled={isLoading || isAnimating}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white border-2 border-black rounded-xl hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
        >
          <Heart className="w-5 h-5" />
          Like
        </button>
      </div>
    </div>
  )
}
