"use client"

import { useState, useRef } from "react"
import type { ReactNode } from "react"

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  duration?: number
  timingFunction?: string
  zDepth?: "sm" | "md" | "lg" | "xl" | "2xl"
  glowEffect?: boolean
}

const zDepths = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
}

export function FlipCard({ 
  front, 
  back, 
  duration = 600,
  timingFunction = "ease-in-out",
  zDepth = "lg",
  glowEffect = false
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Don't flip if clicking a button
    if (target.closest('button')) return
    setIsFlipped(!isFlipped)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent default to avoid scrolling issues on mobile
    // But allow buttons to function normally
    if (!(e.target as HTMLElement).closest('button')) {
      e.preventDefault()
    }
  }

  return (
    <div
      className={`h-full w-full ${zDepths[zDepth]} ${glowEffect ? 'hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-shadow duration-300' : ''}`}
      style={{ perspective: "1000px" }}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transition: `transform ${duration}ms ${timingFunction}`,
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
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