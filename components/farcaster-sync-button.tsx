"use client"

import { useState, useEffect } from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import { FarcasterIcon } from "@/components/icons/farcaster-icon"
import { usePrivy } from '@privy-io/react-auth'
import { syncFromFarcaster } from "@/app/actions/social-sync"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"

interface FarcasterSyncButtonProps {
  onSyncComplete: (data: Partial<Profile>) => void
  disabled?: boolean
  compact?: boolean
}

export function FarcasterSyncButton({ onSyncComplete, disabled, compact }: FarcasterSyncButtonProps) {
  const { login, user } = usePrivy()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [hasSynced, setHasSynced] = useState(false)

  // Auto-sync when Farcaster is connected
  useEffect(() => {
    if (user?.farcaster?.username && !hasSynced) {
      handleAutoSync()
    }
  }, [user?.farcaster?.username])

  const handleAutoSync = async () => {
    if (!user?.farcaster?.username) return

    setIsSyncing(true)
    setSyncStatus('idle')

    try {
      const result = await syncFromFarcaster(user.farcaster.username)

      if (result.success && result.data) {
        setSyncStatus('success')
        onSyncComplete(result.data)
        setHasSynced(true)
        
        // No toast notification - just visual feedback on button
        setTimeout(() => setSyncStatus('idle'), 3000)
      } else {
        setSyncStatus('error')
        toast.error(result.error || 'Failed to sync from Farcaster')
        setTimeout(() => setSyncStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Error syncing from Farcaster:', error)
      setSyncStatus('error')
      toast.error('An unexpected error occurred')
      setTimeout(() => setSyncStatus('idle'), 3000)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleConnect = () => {
    // Open Privy login directly with Farcaster (skip selection screen)
    login({
      loginMethods: ['farcaster']
    })
  }

  const getButtonColor = () => {
    if (syncStatus === 'success') return 'bg-green-600 hover:bg-green-700'
    if (syncStatus === 'error') return 'bg-red-600 hover:bg-red-700'
    return 'bg-purple-600 hover:bg-purple-700'
  }

  const getButtonContent = () => {
    if (isSyncing) {
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Syncing...
        </>
      )
    }

    if (syncStatus === 'success') {
      return (
        <>
          <Check className="w-5 h-5" />
          Synced!
        </>
      )
    }

    if (syncStatus === 'error') {
      return (
        <>
          <AlertCircle className="w-5 h-5" />
          Sync Failed
        </>
      )
    }

    if (user?.farcaster?.username) {
      return (
        <>
          <Check className="w-5 h-5" />
          Connected
        </>
      )
    }

    return (
      <>
        <FarcasterIcon className="w-5 h-5" />
        Connect Farcaster
      </>
    )
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        if (!user?.farcaster?.username) {
          handleConnect()
        } else {
          handleAutoSync()
        }
      }}
      disabled={disabled || isSyncing}
      className={`w-full py-3.5 ${getButtonColor()} text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg active:scale-95 touch-manipulation`}
    >
      {getButtonContent()}
    </button>
  )
}
