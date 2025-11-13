"use client"

import { FlipCard } from "./flip-card-simple"
import { ScanLine } from "lucide-react"

export function WaitlistFlipCard() {
  const frontContent = (
    <div
      className="w-full h-full bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl border border-gray-200/50 overflow-hidden p-6 flex flex-col justify-center items-center text-center cursor-pointer group touch-manipulation"
      style={{
        boxShadow: `
          0 0 0 1px rgba(0,0,0,0.04),
          0 8px 24px rgba(0,0,0,0.06),
          0 16px 48px rgba(0,0,0,0.04)
        `,
        minHeight: '280px',
        touchAction: "manipulation",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        position: "relative",
        zIndex: 1,
        boxSizing: "border-box",
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300"
        style={{
          flexShrink: 0,
        }}
      >
        <ScanLine className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">Your social life, one scan away</h3>
      <p className="text-sm text-gray-600 mb-4">Be one of the first 100 to unlock the digital handshake.</p>

      {/* Current waitlist badge */}
      <div className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm">
        Current waitlist 1
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-xs font-semibold text-gray-600">Tap to continue →</span>
        </div>
      </div>
    </div>
  )

  const backContent = (
    <div
      className="w-full h-full rounded-3xl p-6 flex flex-col relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)`,
        minHeight: '280px',
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Icon and title section */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-lg">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white text-lg font-bold tracking-tight">Friends on the waitlist</h3>
            <p className="text-gray-400 text-xs">See who from your network has joined</p>
          </div>
        </div>

        {/* Extra content */}
        <div className="flex-1 mb-4">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm text-center">None of your friends have joined yet. Be the first!</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              alert("Join waitlist clicked!")
            }}
            className="w-full py-3 bg-white text-black rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2 flip-card-button"
          >
            Join waitlist
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full h-full">
      <FlipCard
        front={frontContent}
        back={backContent}
      />
    </div>
  )
}
