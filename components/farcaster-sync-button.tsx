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
  currentFarcaster?: string // Already synced Farcaster username
}

export function FarcasterSyncButton({ onSyncComplete, disabled, compact, currentFarcaster }: FarcasterSyncButtonProps) {
  const { login, user } = usePrivy()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Removed auto-sync useEffect - main auto-sync happens in page.tsx on sign-in

  const handleAutoSync = async () => {
    if (!user?.farcaster?.username) return

    setIsSyncing(true)
    setSyncStatus('idle')

    try {
      const result = await syncFromFarcaster(user.farcaster.username)

      if (result.success && result.data) {
        setSyncStatus('success')
        onSyncComplete(result.data)
        
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
          <Loader2 className={`animate-spin ${compact ? "w-4 h-4" : "w-5 h-5"}`} />
          Syncing...
        </>
      )
    }

    // If already synced or has Farcaster data, show "Connected"
    if (currentFarcaster || user?.farcaster?.username) {
      return (
        <>
          <Check className={compact ? "w-4 h-4" : "w-5 h-5"} />
          Connected
        </>
      )
    }

    if (syncStatus === 'error') {
      return (
        <>
          <AlertCircle className={compact ? "w-4 h-4" : "w-5 h-5"} />
          Sync Failed
        </>
      )
    }

    return (
      <>
        <FarcasterIcon className={compact ? "w-4 h-4" : "w-5 h-5"} />
        Connect Farcaster
      </>
    )
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        if (!user?.farcaster?.username && !currentFarcaster) {
          handleConnect()
        } else if (!currentFarcaster) {
          // Only allow re-sync if not already synced to database
          handleAutoSync()
        }
      }}
      disabled={disabled || isSyncing || !!currentFarcaster}
      className={`w-full ${compact ? 'py-2.5 text-sm' : 'py-3.5'} ${getButtonColor()} text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg active:scale-95 touch-manipulation`}
    >
      {getButtonContent()}
    </button>
  )
}
