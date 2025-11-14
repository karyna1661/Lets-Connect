"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Profile } from "@/lib/types"

interface MatchModalProps {
  profile: Profile
  onClose: () => void
}

export function MatchModal({ profile, onClose }: MatchModalProps) {
  // Auto-close after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 6000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-black max-w-sm w-full p-8 text-center animate-scaleIn">
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-4xl font-black text-black mb-2">It's a Match!</h2>
          <p className="text-gray-600">You both liked each other</p>
        </div>

        <Avatar className="w-24 h-24 border-4 border-black mx-auto mb-6">
          <AvatarImage src={profile.profile_image || undefined} alt={profile.name} />
          <AvatarFallback className="text-2xl font-bold bg-gray-200">
            {profile.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "?"}
          </AvatarFallback>
        </Avatar>

        <div className="mb-6">
          <p className="text-2xl font-bold text-black">{profile.name}</p>
          <p className="text-gray-600">{profile.role || "Networker"}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-bold text-lg"
        >
          Continue Swiping
        </button>

        <p className="text-xs text-gray-400 mt-3">Auto-closing in a moment...</p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  )
}
