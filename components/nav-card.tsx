"use client"

import { LucideIcon } from "lucide-react"
import { FlipCard } from "@/components/flip-card-simple"

interface NavCardProps {
  icon: LucideIcon
  title: string
  description: string
  backTitle?: string
  backDescription?: string
  backExtra?: React.ReactNode
  ctaLabel?: string
  secondaryLabel?: string
  onSecondaryClick?: () => void
  onClick: () => void
}

export function NavCard({ icon: Icon, title, description, backTitle, backDescription, backExtra, ctaLabel = "Let's Go", secondaryLabel, onSecondaryClick, onClick }: NavCardProps) {
  const frontContent = (
    <div
      className="w-full h-full bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl border border-gray-200/50 overflow-hidden p-6 flex flex-col justify-center items-center text-center cursor-pointer group touch-manipulation"
      style={{
        boxShadow: `
          0 0 0 1px rgba(0,0,0,0.04),
          0 8px 24px rgba(0,0,0,0.06),
          0 16px 48px rgba(0,0,0,0.04)
        `,
        minHeight: '220px',
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
      <div
        className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300"
        style={{
          flexShrink: 0,
        }}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-xs font-semibold text-gray-600">Tap to continue →</span>
        </div>
      </div>
    </div>
  )

  const backContent = (
    <div
      className="w-full h-full rounded-3xl p-6 flex flex-col justify-between items-center text-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)`,
        boxSizing: "border-box",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)`,
        minHeight: '220px',
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-lg mb-3">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center w-full px-2">
        <h3 className="text-lg font-bold text-white mb-2 leading-tight">{backTitle || title}</h3>
        <p className="text-gray-300 text-xs mb-4 max-w-[200px] leading-relaxed">{backDescription || description}</p>

        {backExtra && <div className="mb-4 w-full max-w-[220px]">{backExtra}</div>}
      </div>

      <div className="flex-shrink-0 w-full max-w-[220px] space-y-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg w-full text-sm touch-manipulation flip-card-button transform hover:scale-105 transition-transform"
          style={{ touchAction: "manipulation" }}
        >
          {ctaLabel}
        </button>

        {secondaryLabel && onSecondaryClick && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSecondaryClick()
            }}
            className="px-4 py-2.5 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all border border-white/30 w-full text-sm touch-manipulation flip-card-button transform hover:scale-105 transition-transform"
            style={{ touchAction: "manipulation" }}
          >
            {secondaryLabel}
          </button>
        )}
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