"use client"

import { useState } from "react"
import { Zap, Loader2 } from "lucide-react"
import { syncPOAPsFromAPI, getUserPOAPs } from "@/app/actions/poaps"
import { linkWallet } from "@/app/actions/wallets"
import { toast } from "sonner"

interface POAPSyncButtonProps {
  userId: string
  currentWallet?: string
  onSyncComplete?: () => void
}

export function POAPSyncButton({ userId, currentWallet, onSyncComplete }: POAPSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showWalletInput, setShowWalletInput] = useState(!currentWallet)
  const [walletInput, setWalletInput] = useState("")

  const handleSync = async () => {
    if (!currentWallet && !walletInput.trim()) {
      toast.error("Please enter your wallet address")
      return
    }

    const walletToSync = currentWallet || walletInput.trim()

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletToSync)) {
      toast.error("Invalid wallet address format (must start with 0x and contain 40 hex characters)")
      return
    }

    try {
      setIsLoading(true)

      // Link wallet if new
      if (!currentWallet && walletInput.trim()) {
        await linkWallet(userId, walletToSync)
      }

      // Sync POAPs
      const result = await syncPOAPsFromAPI(userId, walletToSync)
      toast.success(`Synced ${result.count} POAPs from your wallet`)

      // Fetch updated POAPs
      await getUserPOAPs(userId)
      onSyncComplete?.()
      setWalletInput("")
      setShowWalletInput(false)
    } catch (error) {
      console.error("[v0] Error syncing POAPs:", error)
      toast.error("Failed to sync POAPs. Check your wallet address and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {showWalletInput && !currentWallet ? (
        <>
          <input
            type="text"
            value={walletInput}
            onChange={(e) => setWalletInput(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black font-mono text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Sync POAPs
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowWalletInput(false)
                setWalletInput("")
              }}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={handleSync}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              {currentWallet ? "Re-sync POAPs" : "Add Wallet & Sync POAPs"}
            </>
          )}
        </button>
      )}
    </div>
  )
}
