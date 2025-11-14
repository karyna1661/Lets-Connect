"use client"

import { useState, useRef } from "react"
import type { ReactNode } from "react"

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  onFlip?: (isFlipped: boolean) => void
}

export function FlipCard({ front, back, onFlip }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Allow buttons to work normally (they'll stop propagation)
    // But flip the card when clicking anywhere else on the front
    if (!target.closest('button') || target.closest('.flip-trigger')) {
      const newFlipState = !isFlipped
      setIsFlipped(newFlipState)
      onFlip?.(newFlipState)
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
        className="relative w-full h-full cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transition: "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          WebkitTransition: "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          WebkitTransform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      >
        {/* Front */}
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
            WebkitTransform: "rotateY(0deg)",
          }}
        >
          <div className="w-full h-full">
            {front}
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            WebkitTransform: "rotateY(180deg)",
          }}
        >
          <div className="w-full h-full">
            {back}
          </div>
        </div>
      </div>
    </div>
  )
}
