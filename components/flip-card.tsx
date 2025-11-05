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
  duration = 400,
  timingFunction = "cubic-bezier(0.34, 1.56, 0.64, 1)",
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
    console.log('[FlipCard] Mouse down detected')
    setIsPressed(true)
  }
  
  const handleMouseUp = () => {
    console.log('[FlipCard] Mouse up - triggering flip')
    console.log('[FlipCard] Current state:', { isFlipped, isPressed })
    setIsPressed(false)
    setIsFlipped(!isFlipped)
    console.log('[FlipCard] New flip state:', !isFlipped)
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
      onMouseLeave={() => {
        console.log('[FlipCard] Mouse leave')
        setIsPressed(false)
      }}
      style={{
        perspective: "1200px",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Debug indicator */}
      {isFlipped && (
        <div className="absolute top-2 right-2 z-50 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          FLIPPED
        </div>
      )}
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
          className="absolute w-full h-full rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            display: isFlipped ? 'none' : 'block',
            zIndex: isFlipped ? 1 : 2,
          }}
          data-side="front"
        >
          {/* Debug label */}
          <div className="absolute top-2 left-2 z-50 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            FRONT
          </div>
          {/* Subtle gradient overlay based on mouse position */}
          {glowEffect && (
            <div
              className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none z-10"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.4) 0%, transparent 50%)`,
              }}
            />
          )}
          {front}
        </div>

        {/* Back face */}
        <div
          className="absolute w-full h-full rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            display: isFlipped ? 'block' : 'none',
            zIndex: isFlipped ? 2 : 1,
          }}
          data-side="back"
        >
          {/* Debug label */}
          <div className="absolute top-2 left-2 z-50 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            BACK
          </div>
          {/* Glow effect on back as well */}
          {glowEffect && (
            <div
              className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none z-10"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.4) 0%, transparent 50%)`,
              }}
            />
          )}
          {back}
        </div>
      </div>
    </div>
  )
}
