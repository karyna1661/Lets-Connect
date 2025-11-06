"use client"

import { useState } from "react"
import { Zap, Loader2, Wallet } from "lucide-react"
import { useWallets } from '@privy-io/react-auth'
import { syncPOAPsFromAPI, getUserPOAPs } from "@/app/actions/poaps"
import { linkWallet } from "@/app/actions/wallets"
import { toast } from "sonner"

interface POAPSyncButtonProps {
  userId: string
  currentWallet?: string
  onSyncComplete?: () => void
}

export function POAPSyncButton({ userId, currentWallet, onSyncComplete }: POAPSyncButtonProps) {
  const { wallets } = useWallets()
  const [isLoading, setIsLoading] = useState(false)
  const [showWalletInput, setShowWalletInput] = useState(!currentWallet && wallets.length === 0)
  const [walletInput, setWalletInput] = useState("")
  
  // Get connected wallet from Privy
  const privyWallet = wallets[0]?.address

  const handleSync = async () => {
    // Priority: Privy wallet > current wallet > manual input
    const walletToSync = privyWallet || currentWallet || walletInput.trim()
    
    if (!walletToSync) {
      toast.error("Please connect a wallet or enter wallet address")
      return
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletToSync)) {
      toast.error("Invalid wallet address format (must start with 0x and contain 40 hex characters)")
      return
    }

    try {
      setIsLoading(true)

      // Link wallet if new
      if (walletToSync !== currentWallet) {
        await linkWallet(userId, walletToSync)
      }

      // Sync POAPs
      const result = await syncPOAPsFromAPI(userId, walletToSync)
      toast.success(`Synced ${result.count} POAPs from ${privyWallet ? 'connected wallet' : 'your wallet'}`)

      // Fetch updated POAPs
      await getUserPOAPs(userId)
      onSyncComplete?.()
      setWalletInput("")
      setShowWalletInput(false)
    } catch (error) {
      console.error("[POAP Sync] Error:", error)
      toast.error("Failed to sync POAPs. Check your wallet address and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // If Privy wallet is connected, show quick sync button
  if (privyWallet) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
          <Wallet className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800 font-medium">
            {privyWallet.slice(0, 6)}...{privyWallet.slice(-4)}
          </span>
          <span className="text-xs text-green-600">(Connected)</span>
        </div>
        <button
          onClick={handleSync}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold disabled:opacity-50 shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Syncing POAPs...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              {currentWallet === privyWallet ? "Re-sync POAPs" : "Sync POAPs from Connected Wallet"}
            </>
          )}
        </button>
      </div>
    )
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
