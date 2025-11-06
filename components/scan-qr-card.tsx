"use client"

import { ScanLine, Camera } from "lucide-react"
import { FlipCard } from "@/components/flip-card"
import { QRScanner } from "@/components/qr-scanner"
import type { Profile } from "@/lib/types"

interface ScanQRCardProps {
  onScanSuccess: (profile: Profile) => void
  onScanError?: (error: string) => void
}

export function ScanQRCard({ onScanSuccess, onScanError }: ScanQRCardProps) {
  const frontContent = (
    <div
      className="relative w-full bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl border border-gray-200/50 h-full overflow-hidden p-6 flex flex-col items-center justify-center"
      style={{
        boxShadow: `
          0 0 0 1px rgba(0,0,0,0.04),
          0 8px 24px rgba(0,0,0,0.06),
          0 16px 48px rgba(0,0,0,0.04)
        `,
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-lg">
          <ScanLine className="w-8 h-8 text-white" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">Scan QR Code</h3>
      <p className="text-gray-600 text-center mb-6">Connect with others by scanning their QR codes</p>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
          <span className="text-xs font-semibold text-gray-600">Tap to scan →</span>
        </div>
      </div>
    </div>
  )

  const backContent = (
    <div
      className="w-full rounded-3xl h-full p-6 flex flex-col relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)`,
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white text-lg font-bold tracking-tight">Scan QR Code</h3>
            <p className="text-gray-400 text-xs">Start camera to scan</p>
          </div>
        </div>

        {/* QR Scanner */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <QRScanner onScanSuccess={onScanSuccess} onScanError={onScanError} />
        </div>

        {/* Info text */}
        <div className="text-center py-3">
          <span className="text-xs font-semibold text-gray-500">Position QR code within the frame</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full" style={{ height: "500px" }}>
      <FlipCard
        front={frontContent}
        back={backContent}
        duration={500}
        timingFunction="cubic-bezier(0.34, 1.56, 0.64, 1)"
        zDepth="lg"
        glowEffect={true}
      />
    </div>
  )
}
