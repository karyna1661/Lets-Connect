"use client"

import { useState } from "react"
import Image from "next/image"

export function DevconnectEventCard() {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="w-full h-full perspective-1000">
      <div
        className={`relative w-full h-full preserve-3d cursor-pointer ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          transition: "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        {/* Front - DEVCONNECT Image */}
        <div
          className={`absolute inset-0 backface-hidden group ${isFlipped ? "hidden" : "block"}`}
          style={{ minHeight: '280px' }}
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-black shadow-[0_0_0_1px_rgba(0,0,0,1),0_8px_24px_rgba(0,0,0,0.1)] hover:shadow-[0_0_0_1px_rgba(0,0,0,1),0_12px_32px_rgba(0,0,0,0.15)] transition-shadow duration-300">
            {/* DEVCONNECT Image Cover */}
            <div className="absolute inset-0">
              <Image
                src="/DEVCONNECT.png"
                alt="DEVCONNECT"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Tap to Continue Overlay - Shows on hover (desktop) or always (mobile) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white border-2 border-black px-4 py-2 rounded-full shadow-lg hover:bg-gray-100 transition-all">
                <span className="text-sm font-bold text-black">Tap to continue →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back - Coming Soon */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? "block" : "hidden"}`}
          style={{ minHeight: '280px' }}
        >
          <div
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col items-center justify-center p-6"
            style={{
              background: `linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Noise texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
              }}
            />

            {/* Coming Soon Content */}
            <div className="relative z-10 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-4 ring-white/10">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">Coming Soon</h3>
              <p className="text-gray-300 max-w-xs mx-auto">
                Find and connect with fellow DEVCONNECT attendees
              </p>
              <div className="mt-6 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full inline-block">
                <span className="text-xs text-white/80">Stay tuned for updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}
