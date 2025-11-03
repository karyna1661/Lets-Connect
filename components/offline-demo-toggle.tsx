"use client"

import { useState, useEffect } from "react"
import { Zap } from "lucide-react"

export function OfflineDemoToggle() {
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("offlineMode")
    if (saved) {
      setIsOfflineMode(JSON.parse(saved))
    }
  }, [])

  const toggleOfflineMode = () => {
    const newState = !isOfflineMode
    setIsOfflineMode(newState)
    localStorage.setItem("offlineMode", JSON.stringify(newState))

    if (newState) {
      // Load demo data
      const demoProfile = {
        user_id: "demo_user",
        name: "Demo User",
        bio: "Testing the app offline",
        linkedin: "linkedin.com/in/demo",
        twitter: "@demouser",
        instagram: "@demouser",
        email: "demo@example.com",
        city: "San Francisco",
        role: "Builder",
        interests: ["Web3", "AI"],
        is_discoverable: true,
        location_sharing: "city",
      }
      localStorage.setItem("profile_demo_user", JSON.stringify(demoProfile))
    }

    window.location.reload()
  }

  return (
    <button
      onClick={toggleOfflineMode}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full glass-effect border-2 border-[var(--color-neon-orange)] hover:border-[var(--color-neon-lime)] transition-all"
      title={isOfflineMode ? "Switch to Online Mode" : "Switch to Offline Demo Mode"}
    >
      <Zap className="w-4 h-4 text-[var(--color-neon-orange)]" />
      <span className="text-sm font-semibold text-[var(--color-neon-orange)]">
        {isOfflineMode ? "OFFLINE" : "ONLINE"}
      </span>
    </button>
  )
}
