"use client"

import { useState } from "react"
import type { ReactNode } from "react"

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
}

export function FlipCard({ front, back }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="h-full w-full cursor-pointer relative"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{
        transition: "all 0.3s ease",
      }}
    >
      {/* Front */}
      <div
        style={{
          opacity: isFlipped ? 0 : 1,
          visibility: isFlipped ? 'hidden' : 'visible',
          transition: "opacity 0.3s ease, visibility 0.3s ease",
          position: 'absolute',
          inset: 0,
        }}
      >
        {front}
      </div>

      {/* Back */}
      <div
        style={{
          opacity: isFlipped ? 1 : 0,
          visibility: isFlipped ? 'visible' : 'hidden',
          transition: "opacity 0.3s ease, visibility 0.3s ease",
          position: 'absolute',
          inset: 0,
        }}
      >
        {back}
      </div>
    </div>
  )
}
