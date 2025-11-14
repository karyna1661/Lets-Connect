"use client"

import { useState, useEffect, useRef } from "react"
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
  const [cardKey, setCardKey] = useState(0) // Key to force card reset

  // Reset card to front when profile changes
  useEffect(() => {
    setCardKey(prev => prev + 1)
  }, [profile.user_id])

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
        relative w-full bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl 
        border-2 border-gray-300
        transition-all duration-300 transform h-full overflow-hidden
        ${isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"}
      `}
      style={{
        boxShadow: `
          0 0 0 1px rgba(0,0,0,0.04),
          0 8px 24px rgba(0,0,0,0.06),
          0 16px 48px rgba(0,0,0,0.04)
        `,
      }}
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200" style={{ height: "280px" }}>
        <Avatar className="w-full h-full rounded-none border-0">
          <AvatarImage src={profile.profile_image || undefined} alt={profile.name} className="object-cover" />
          <AvatarFallback className="rounded-none text-4xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            {profile.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "?"}
          </AvatarFallback>
        </Avatar>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        {/* Compatibility badge with glow */}
        {compatibilityScore > 0 && (
          <div 
            className="absolute top-6 right-6 bg-gradient-to-br from-pink-500 to-rose-600 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg"
            style={{
              boxShadow: `
                0 4px 16px rgba(236, 72, 153, 0.4),
                0 8px 32px rgba(236, 72, 153, 0.2)
              `,
            }}
          >
            <Zap className="w-4 h-4 fill-white" />
            <span className="font-bold text-sm">{Math.round(compatibilityScore)}%</span>
          </div>
        )}

        {/* Flip indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1.5">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <div className="flex items-center gap-2">
              <ChevronDown className="w-3.5 h-3.5 text-gray-700 animate-bounce" />
              <span className="text-xs font-semibold text-gray-700">Tap to flip</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info section with enhanced styling */}
      <div className="p-6 bg-white">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1.5 tracking-tight">{profile.name}</h2>
          <p className="text-gray-700 font-semibold text-base">{profile.role || "Networker"}</p>
          {profile.city && (
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
              <span className="text-xs">📍</span>
              {profile.city}
            </p>
          )}
        </div>

        {profile.bio && (
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">{profile.bio}</p>
        )}

        {sharedPOAPs > 0 && (
          <div 
            className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/50"
            style={{
              boxShadow: "0 2px 8px rgba(99, 102, 241, 0.08)",
            }}
          >
            <p className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <span className="text-base">🎉</span>
              {sharedPOAPs} shared event{sharedPOAPs !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const backContent = (
    <div 
      className="w-full rounded-3xl h-full p-6 flex flex-col justify-between overflow-hidden relative"
      style={{
        background: `linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="w-12 h-12 border-2 border-white/20">
            <AvatarImage src={profile.profile_image || undefined} alt={profile.name} />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white text-lg font-bold">
              {profile.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-white text-xl font-bold tracking-tight">{profile.name}</h3>
            <p className="text-gray-400 text-sm">{profile.role || "Networker"}</p>
          </div>
        </div>

        {profile.interests && profile.interests.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20"
                  style={{
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {sharedPOAPs > 0 && (
          <div className="mb-4">
            <p className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">Shared Events</p>
            <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-400/30">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-base">🎉</span>
                {sharedPOAPs} POAP{sharedPOAPs !== 1 ? "s" : ""} in common
              </p>
            </div>
          </div>
        )}

        {profile.bio && (
          <div className="mb-4">
            <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">About</p>
            <p className="text-gray-200 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Action buttons with enhanced styling */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <button
          onClick={() => handleSwipe("left")}
          disabled={isLoading || isAnimating}
          className="group relative overflow-hidden flex items-center justify-center gap-2 px-4 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl hover:bg-white/20 active:scale-95 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flip-card-button"
          style={{
            boxShadow: `
              0 4px 16px rgba(0,0,0,0.2),
              inset 0 1px 0 rgba(255,255,255,0.1)
            `,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <X className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Pass</span>
        </button>
        <button
          onClick={() => handleSwipe("right")}
          disabled={isLoading || isAnimating}
          className="group relative overflow-hidden flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-br from-pink-500 to-rose-600 text-white border border-pink-400/30 rounded-2xl hover:from-pink-600 hover:to-rose-700 active:scale-95 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flip-card-button"
          style={{
            boxShadow: `
              0 4px 16px rgba(236, 72, 153, 0.4),
              0 8px 32px rgba(236, 72, 153, 0.2),
              inset 0 1px 0 rgba(255,255,255,0.2)
            `,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Heart className="w-5 h-5 fill-white relative z-10" />
          <span className="relative z-10">Like</span>
        </button>
      </div>
    </div>
  )

  return (
    <div key={cardKey} className="w-full rounded-3xl overflow-hidden" style={{ height: "500px" }}>
      <FlipCard 
        front={frontContent} 
        back={backContent} 
        duration={500} 
        zDepth="lg"
        timingFunction="cubic-bezier(0.34, 1.56, 0.64, 1)"
        glowEffect={true}
      />
    </div>
  )
}
