"use client"

import { LucideIcon } from "lucide-react"
import { FlipCard } from "./flip-card-simple"

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
      className="w-full h-full rounded-3xl p-6 flex flex-col relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)`,
        minHeight: '280px',
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Icon and title section */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white text-lg font-bold tracking-tight">{backTitle || title}</h3>
            <p className="text-gray-400 text-xs">{backDescription || description}</p>
          </div>
        </div>

        {/* Extra content */}
        {backExtra && <div className="flex-1 mb-4">{backExtra}</div>}

        {/* Spacer if no extra content */}
        {!backExtra && <div className="flex-1" />}

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className="w-full py-3 bg-white text-black rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2 flip-card-button"
          >
            {ctaLabel}
          </button>

          {secondaryLabel && onSecondaryClick && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSecondaryClick()
              }}
              className="w-full py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/20 transition-all border border-white/30 flip-card-button"
            >
              {secondaryLabel}
            </button>
          )}
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