"use client"

import { useState, useEffect } from "react"
import { Sparkles, Check, AlertCircle, Loader2 } from "lucide-react"
import { useWallets } from '@privy-io/react-auth'
import { syncFromTalentProtocol } from "@/app/actions/social-sync"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"

interface TalentProtocolSyncButtonProps {
  onSyncComplete: (data: Partial<Profile>) => void
  disabled?: boolean
  compact?: boolean
}

export function TalentProtocolSyncButton({ onSyncComplete, disabled, compact }: TalentProtocolSyncButtonProps) {
  const { wallets } = useWallets()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [hasSynced, setHasSynced] = useState(false)

  const walletAddress = wallets[0]?.address

  // Auto-sync when wallet is connected
  useEffect(() => {
    if (walletAddress && !hasSynced) {
      handleAutoSync()
    }
  }, [walletAddress])

  const handleAutoSync = async () => {
    if (!walletAddress) {
      toast.error("Please connect a wallet first")
      return
    }

    setIsSyncing(true)
    setSyncStatus('idle')

    try {
      const result = await syncFromTalentProtocol(walletAddress)

      if (result.success && result.data) {
        setSyncStatus('success')
        onSyncComplete(result.data)
        setHasSynced(true)
        toast.success(`Synced from Talent Protocol!`)
        
        setTimeout(() => setSyncStatus('idle'), 3000)
      } else {
        setSyncStatus('error')
        toast.error(result.error || 'Failed to sync from Talent Protocol')
        setTimeout(() => setSyncStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Error syncing from Talent Protocol:', error)
      setSyncStatus('error')
      toast.error('An unexpected error occurred')
      setTimeout(() => setSyncStatus('idle'), 3000)
    } finally {
      setIsSyncing(false)
    }
  }

  const getButtonColor = () => {
    if (syncStatus === 'success') return 'bg-green-600 hover:bg-green-700'
    if (syncStatus === 'error') return 'bg-red-600 hover:bg-red-700'
    return 'bg-black hover:bg-gray-800'
  }

  const getButtonContent = () => {
    if (isSyncing) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Syncing...
        </>
      )
    }

    if (syncStatus === 'success') {
      return (
        <>
          <Check className="w-4 h-4" />
          Synced!
        </>
      )
    }

    if (syncStatus === 'error') {
      return (
        <>
          <AlertCircle className="w-4 h-4" />
          Sync Failed
        </>
      )
    }

    if (walletAddress) {
      return (
        <>
          <Check className="w-4 h-4" />
          Wallet Connected
        </>
      )
    }

    return (
      <>
        <Sparkles className="w-4 h-4" />
        Connect Talent
      </>
    )
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        handleAutoSync()
      }}
      disabled={disabled || isSyncing || !walletAddress}
      className={`w-full py-3 ${getButtonColor()} text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg`}
    >
      {getButtonContent()}
    </button>
  )
}
