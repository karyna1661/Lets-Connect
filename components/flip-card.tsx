"use client"

import { useState } from "react"
import type { ReactNode } from "react"

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  duration?: number
  timingFunction?: string
  zDepth?: "sm" | "md" | "lg"
}

export function FlipCard({
  front,
  back,
  duration = 300,
  timingFunction = "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  zDepth = "md",
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const zDepthMap = {
    sm: "shadow-lg",
    md: "shadow-2xl",
    lg: "shadow-[0_20px_60px_rgba(0,0,0,0.8)]",
  }

  return (
    <div
      className="h-full w-full cursor-pointer perspective"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{
        perspective: "1000px",
      }}
    >
      <div
        className={`relative w-full h-full transition-transform ${zDepthMap[zDepth]}`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: timingFunction,
        }}
      >
        {/* Front face */}
        <div
          className="absolute w-full h-full rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          {front}
        </div>

        {/* Back face */}
        <div
          className="absolute w-full h-full rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {back}
        </div>
      </div>
    </div>
  )
}
