"use client"

import { useState, useRef } from "react"
import type { ReactNode } from "react"

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
}

export function FlipCard({ front, back }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    // Only flip if clicking on the card itself, not on buttons inside
    if (!(e.target as HTMLElement).closest('button')) {
      setIsFlipped(!isFlipped)
    }
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
      className="h-full w-full"
      style={{
        perspective: "1000px",
        WebkitPerspective: "1000px",
      }}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
          WebkitTransition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      >
        {/* Front */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            WebkitTransform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            position: "relative",
            zIndex: isFlipped ? -1 : 1,
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            {front}
          </div>
        </div>

        {/* Back */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
            WebkitTransform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: isFlipped ? 1 : -1,
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            {back}
          </div>
        </div>
      </div>
    </div>
  )
}
