"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import type { Profile } from "@/lib/types"

interface QRScannerProps {
  onScanSuccess: (profile: Profile) => void
  onScanError?: (error: string) => void
}

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerDivId = "qr-reader"

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)

      const html5QrCode = new Html5Qrcode(scannerDivId)
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 30,  // Increased from 10 to 30 for faster scanning
          qrbox: { width: 280, height: 280 },  // Slightly larger scan area
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          try {
            const profile = JSON.parse(decodedText) as Profile
            // Validate that it has required fields
            if (!profile.user_id || !profile.name) {
              const errorMsg = "Invalid QR code - missing user information"
              setError(errorMsg)
              if (onScanError) onScanError(errorMsg)
              return
            }
            onScanSuccess(profile)
            stopScanning()
          } catch (err) {
            const errorMsg = "Invalid QR code format"
            setError(errorMsg)
            if (onScanError) onScanError(errorMsg)
          }
        },
        (errorMessage) => {
          // Ignore scanning errors (they happen continuously while scanning)
        },
      )
    } catch (err: any) {
      const errorMsg = err.message || "Failed to start camera"
      setError(errorMsg)
      if (onScanError) onScanError(errorMsg)
      setIsScanning(false)
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        console.error("[v0] Error stopping scanner:", err)
      }
    }
    setIsScanning(false)
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  return (
    <div className="w-full max-w-md mx-auto">
      <div id={scannerDivId} className="rounded-2xl overflow-hidden border-2 border-white" />

      {error && (
        <div className="mt-4 p-4 bg-red-100 border-2 border-red-600 rounded-xl">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {!isScanning ? (
        <button
          onClick={startScanning}
          className="w-full mt-4 bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors border-2 border-white"
        >
          Start Camera
        </button>
      ) : (
        <button
          onClick={stopScanning}
          className="w-full mt-4 bg-red-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-colors border-2 border-white"
        >
          Stop Scanning
        </button>
      )}
    </div>
  )
}
