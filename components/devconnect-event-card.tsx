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
          minHeight: '280px',
        }}
      >
        {/* Front - DEVCONNECT Image */}
        <div
          className={`absolute inset-0 backface-hidden group ${isFlipped ? "hidden" : "block"}`}
          style={{ minHeight: '280px' }}
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-black shadow-[0_0_0_1px_rgba(0,0,0,1),0_8px_24px_rgba(0,0,0,0.1)] hover:shadow-[0_0_0_1px_rgba(0,0,0,1),0_12px_32px_rgba(0,0,0,0.15)] transition-shadow duration-300">
            {/* DEVCONNECT Image Cover - Full card with padding to show logo */}
            <div className="absolute inset-0 bg-white p-8">
              <div className="relative w-full h-full">
                <Image
                  src="/DEVCONNECT.png"
                  alt="DEVCONNECT"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Tap to Continue Overlay - Shows on hover (desktop) or always (mobile) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white border-2 border-black px-4 py-2 rounded-full shadow-lg hover:bg-gray-100 transition-all">
                <span className="text-sm font-bold text-black">Tap to continue →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back - Coming Soon (White Background) */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? "block" : "hidden"}`}
          style={{ minHeight: '280px' }}
        >
          <div
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col items-center justify-center p-6 border-2 border-black"
            style={{
              background: 'white',
              boxShadow: '0 0 0 1px rgba(0,0,0,1), 0 8px 24px rgba(0,0,0,0.1)',
            }}
          >
            {/* Coming Soon Content */}
            <div className="relative z-10 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-black flex items-center justify-center shadow-lg">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-3xl font-bold text-black tracking-tight">Coming Soon</h3>
              <p className="text-gray-600 max-w-xs mx-auto">
                Find and connect with fellow DEVCONNECT attendees
              </p>
              <div className="mt-6 px-4 py-2 bg-black text-white rounded-full inline-block">
                <span className="text-xs font-semibold">Stay tuned for updates</span>
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
