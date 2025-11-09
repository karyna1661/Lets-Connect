"use client"

import { useState } from "react"
import type { ReactNode } from "react"

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  duration?: number
}

export function FlipCard({ front, back, duration = 600 }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Don't flip if clicking a button
    if (target.closest('button')) return
    setIsFlipped(!isFlipped)
  }

  return (
    <div
      className="w-full h-full"
      style={{ perspective: "1000px" }}
      onClick={handleClick}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transition: `transform ${duration}ms ease-in-out`,
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {front}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {back}
        </div>
      </div>
    </div>
  )
}
