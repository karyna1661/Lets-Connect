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
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          try {
            const profile = JSON.parse(decodedText) as Profile
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
          // Only show errors for significant issues
          if (errorMessage.includes("No MultiFormat Readers")) {
            setError("Camera not supported. Please try a different device.")
          }
        },
      )
    } catch (err: any) {
      let errorMsg = "Failed to start camera"
      
      if (err.message.includes("Permission denied")) {
        errorMsg = "Camera permission denied. Please allow camera access and try again."
      } else if (err.message.includes("NotAllowedError")) {
        errorMsg = "Camera access blocked. Please enable camera permissions in your browser."
      } else if (err.message.includes("NotFoundError")) {
        errorMsg = "No camera found. Please connect a camera and try again."
      } else if (err.message.includes("NotSupportedError")) {
        errorMsg = "Camera not supported on this device."
      } else if (err.message) {
        errorMsg = err.message
      }
      
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
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <div id={scannerDivId} className="rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white w-full" />

      {error && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-100 border-2 border-red-600 rounded-lg sm:rounded-xl">
          <p className="text-red-600 text-xs sm:text-sm font-medium">{error}</p>
        </div>
      )}

      {!isScanning ? (
        <button
          onClick={startScanning}
          className="w-full mt-3 sm:mt-4 bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-200 transition-all duration-200 border-2 border-white active:scale-95"
        >
          Start Camera
        </button>
      ) : (
        <button
          onClick={stopScanning}
          className="w-full mt-3 sm:mt-4 bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-red-700 transition-all duration-200 border-2 border-white active:scale-95"
        >
          Stop Scanning
        </button>
      )}
    </div>
  )
}
