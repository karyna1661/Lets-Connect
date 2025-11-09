"use client"

import { useState } from "react"
import type { ReactNode } from "react"

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  duration?: number
  timingFunction?: string
  zDepth?: "sm" | "md" | "lg" | "xl"
  glowEffect?: boolean
}

export function FlipCard({
  front,
  back,
  duration = 800,
  timingFunction = "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  zDepth = "lg",
  glowEffect = true,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  const handleMouseDown = () => {
    setIsPressed(true)
  }
  
  const handleMouseUp = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Allow buttons to work normally, but flip when clicking the card front
    if (!target.closest('button') || target.closest('.flip-trigger')) {
      setIsPressed(false)
      setIsFlipped(!isFlipped)
    } else {
      setIsPressed(false)
    }
  }

  // Enhanced shadow system with multiple layers
  const getShadowStyles = () => {
    const shadows = {
      sm: `
        0 2px 4px rgba(0,0,0,0.06),
        0 4px 8px rgba(0,0,0,0.04),
        0 8px 16px rgba(0,0,0,0.02)
      `,
      md: `
        0 4px 8px rgba(0,0,0,0.08),
        0 8px 16px rgba(0,0,0,0.06),
        0 16px 32px rgba(0,0,0,0.04),
        0 32px 64px rgba(0,0,0,0.02)
      `,
      lg: `
        0 8px 16px rgba(0,0,0,0.1),
        0 16px 32px rgba(0,0,0,0.08),
        0 32px 64px rgba(0,0,0,0.06),
        0 64px 128px rgba(0,0,0,0.04)
      `,
      xl: `
        0 12px 24px rgba(0,0,0,0.12),
        0 24px 48px rgba(0,0,0,0.1),
        0 48px 96px rgba(0,0,0,0.08),
        0 96px 192px rgba(0,0,0,0.06)
      `,
    }
    return shadows[zDepth]
  }

  return (
    <div
      className="h-full w-full cursor-pointer select-none"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchEnd={(e) => {
        e.preventDefault()
        handleMouseUp(e as unknown as React.MouseEvent)
      }}
      onMouseLeave={() => {
        setIsPressed(false)
      }}
      style={{
        perspective: "1200px",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        className="relative w-full h-full transition-all"
        style={{
          transformStyle: "preserve-3d",
          transform: `
            rotateY(${isFlipped ? 180 : 0}deg)
            scale(${isPressed ? 0.98 : 1})
          `,
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: timingFunction,
          filter: isPressed ? "brightness(0.95)" : "brightness(1)",
          boxShadow: getShadowStyles(),
          borderRadius: "24px",
        }}
      >
        {/* Front face */}
        <div
          className="absolute w-full h-full rounded-3xl overflow-hidden flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            zIndex: isFlipped ? 1 : 2,
          }}
          data-side="front"
        >
          {/* Subtle gradient overlay based on mouse position */}
          {glowEffect && (
            <div
              className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none z-10"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.4) 0%, transparent 50%)`,
              }}
            />
          )}
          <div className="w-full h-full flex items-center justify-center">
            {front}
          </div>
        </div>

        {/* Back face */}
        <div
          className="absolute w-full h-full rounded-3xl overflow-hidden flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg) scaleX(-1)",
            zIndex: isFlipped ? 2 : 1,
          }}
          data-side="back"
        >
          {/* Glow effect on back as well */}
          {glowEffect && (
            <div
              className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none z-10"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.4) 0%, transparent 50%)`,
              }}
            />
          )}
          <div className="w-full h-full flex items-center justify-center">
            {back}
          </div>
        </div>
      </div>
    </div>
  )
}
