"use client"

import { useState } from "react"
import { Zap, Loader2, Wallet } from "lucide-react"
import { useWallets, useLogin } from '@privy-io/react-auth'
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
  const { login } = useLogin()
  const [isLoading, setIsLoading] = useState(false)
  
  // Get connected wallet from Privy
  const privyWallet = wallets[0]?.address

  const handleConnectWallet = () => {
    login()
  }

  const handleSync = async () => {
    // Priority: Privy wallet > current wallet
    const walletToSync = privyWallet || currentWallet
    
    if (!walletToSync) {
      toast.error("Please connect a wallet first")
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
      toast.success(`Synced ${result.count} POAPs from your wallet`)

      // Fetch updated POAPs
      await getUserPOAPs(userId)
      onSyncComplete?.()
    } catch (error) {
      console.error("[POAP Sync] Error:", error)
      toast.error("Failed to sync POAPs. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Wallet status indicator */}
      {privyWallet && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
          <Wallet className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800 font-medium">
            {privyWallet.slice(0, 6)}...{privyWallet.slice(-4)}
          </span>
          <span className="text-xs text-green-600">(Connected)</span>
        </div>
      )}
      
      {/* Two equal-sized buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleConnectWallet}
          disabled={!!privyWallet}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wallet className="w-4 h-4" />
          {privyWallet ? "Connected" : "Connect Wallet"}
        </button>
        
        <button
          onClick={handleSync}
          disabled={isLoading || !privyWallet}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
      </div>
    </div>
  )
}
