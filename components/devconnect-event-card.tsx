"use client"

import { useState } from "react"
import Image from "next/image"
import { FlipCard } from "@/components/flip-card-simple"

export function DevconnectEventCard() {
  const frontContent = (
    <div
      className="w-full h-full bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl border border-gray-200/50 overflow-hidden cursor-pointer group touch-manipulation relative"
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
      {/* DEVCONNECT Logo - Full cover with some cropping allowed */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full h-full">
          <Image
            src="/DEVCONNECT.png"
            alt="DEVCONNECT"
            fill
            className="object-cover"
            priority
            style={{
              objectPosition: 'center center'
            }}
          />
        </div>
      </div>

      {/* Tap to Continue - Same as NavCard */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-xs font-semibold text-gray-600">Tap to continue →</span>
        </div>
      </div>
    </div>
  )

  const backContent = (
    <div
      className="w-full h-full rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: 'white',
        boxShadow: `
          0 0 0 1px rgba(0,0,0,0.04),
          0 8px 24px rgba(0,0,0,0.06),
          0 16px 48px rgba(0,0,0,0.04)
        `,
        minHeight: '280px',
      }}
    >
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
        {/* Coming Soon Badge */}
        <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center shadow-lg mb-4">
          <span className="text-3xl">🎉</span>
        </div>
        
        <h3 className="text-3xl font-bold text-black tracking-tight mb-3">Coming Soon</h3>
        <p className="text-gray-600 text-sm mb-6 px-4">
          Find and connect with fellow DEVCONNECT attendees
        </p>
        
        <div className="px-4 py-2 bg-black text-white rounded-full inline-block">
          <span className="text-xs font-semibold">Stay tuned for updates</span>
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
