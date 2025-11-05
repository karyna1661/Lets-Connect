"use client"

import { useState } from "react"
import { Twitter, Github, Linkedin, Instagram, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SocialOAuthConnectProps {
  platform: "x" | "github" | "linkedin" | "farcaster" | "instagram" | "tiktok" | "telegram"
  currentValue?: string
  onConnect: (username: string, accessToken?: string) => void
  disabled?: boolean
}

export function SocialOAuthConnect({ platform, currentValue, onConnect, disabled }: SocialOAuthConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(!!currentValue)

  const platformConfig = {
    x: {
      name: "X (Twitter)",
      icon: Twitter,
      color: "bg-black hover:bg-gray-800",
      authUrl: "/api/auth/twitter",
    },
    github: {
      name: "GitHub",
      icon: Github,
      color: "bg-gray-900 hover:bg-gray-800",
      authUrl: "/api/auth/github",
    },
    linkedin: {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      authUrl: "/api/auth/linkedin",
    },
    farcaster: {
      name: "Farcaster",
      icon: Twitter,
      color: "bg-purple-700 hover:bg-purple-800",
      authUrl: "/api/auth/farcaster",
    },
    instagram: {
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      authUrl: "/api/auth/instagram",
    },
    tiktok: {
      name: "TikTok",
      icon: Twitter,
      color: "bg-black hover:bg-gray-800",
      authUrl: "/api/auth/tiktok",
    },
    telegram: {
      name: "Telegram",
      icon: Twitter,
      color: "bg-blue-500 hover:bg-blue-600",
      authUrl: "/api/auth/telegram",
    },
  }

  const config = platformConfig[platform]
  const Icon = config.icon

  const handleConnect = async () => {
    setIsConnecting(true)
    
    try {
      // Open OAuth popup window
      const width = 600
      const height = 700
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      
      const popup = window.open(
        config.authUrl,
        `${platform}_oauth`,
        `width=${width},height=${height},left=${left},top=${top}`
      )

      // Listen for OAuth callback
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === `${platform}_auth_success`) {
          const { username, accessToken } = event.data
          onConnect(username, accessToken)
          setIsConnected(true)
          toast.success(`Connected to ${config.name}!`)
          popup?.close()
          window.removeEventListener("message", handleMessage)
          setIsConnecting(false)
        } else if (event.data.type === `${platform}_auth_error`) {
          toast.error(`Failed to connect to ${config.name}`)
          popup?.close()
          window.removeEventListener("message", handleMessage)
          setIsConnecting(false)
        }
      }

      window.addEventListener("message", handleMessage)

      // Check if popup was blocked
      if (!popup || popup.closed) {
        toast.error("Popup blocked. Please allow popups for this site.")
        setIsConnecting(false)
      }
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error)
      toast.error(`Failed to connect to ${config.name}`)
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    onConnect("")
    setIsConnected(false)
    toast.success(`Disconnected from ${config.name}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      
      {isConnected && currentValue ? (
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs flex items-center gap-2">
            <Check className="w-3 h-3 text-green-400" />
            <span className="flex-1 truncate">{currentValue}</span>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disabled}
            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={disabled || isConnecting}
          className={`flex-1 ${config.color} text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Icon className="w-3 h-3" />
              Connect {config.name}
            </>
          )}
        </button>
      )}
    </div>
  )
}
