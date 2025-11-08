"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { POAPIcon } from "@/components/icons/poap-icon"
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
  
  // Get connected wallet from Privy
  const privyWallet = wallets[0]?.address

  const handleSync = async () => {
    // Priority: Privy wallet > current wallet from profile
    const walletToSync = privyWallet || currentWallet
    
    if (!walletToSync) {
      toast.error("No wallet found. Please sync with Farcaster first to get your wallet address.")
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
      
      // Show specific error message
      const errorMessage = error instanceof Error ? error.message : "Failed to sync POAPs. Please try again."
      
      if (errorMessage.includes("API key")) {
        toast.error("POAP API key not configured. Please contact support.")
      } else if (errorMessage.includes("Invalid wallet")) {
        toast.error("Invalid wallet address format. Please sync with Farcaster first.")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={isLoading || (!privyWallet && !currentWallet)}
      className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg active:scale-95 touch-manipulation"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <POAPIcon className="w-5 h-5" />
          Sync POAP
        </>
      )}
    </button>
  )
}
