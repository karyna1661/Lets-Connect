"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Loader2, AlertCircle } from "lucide-react"
import { getDiscoveryProfiles, getSharedPOAPs } from "@/app/actions/discovery"
import { recordSwipe, getUserMatches } from "@/app/actions/swipes"
import { addConnection } from "@/app/actions/connections"
import { SwipeCard } from "@/components/swipe-card"
import { MatchModal } from "@/components/match-modal"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"

export default function DiscoverPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<(Profile & { compatibility_score: number })[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRecordingSwipe, setIsRecordingSwipe] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")
  const [user, setUser] = useState<any>(null)
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null)
  const [cities, setCities] = useState<string[]>([])
  const [sharedPOAPs, setSharedPOAPs] = useState(0)
  const [devMode, setDevMode] = useState(false) // Dev mode disabled - using real profiles

  useEffect(() => {
    // Use a static user ID to avoid hydration mismatch
    // In production, this will be replaced with actual Privy user ID
    const staticUser = { id: "temp_discover_user" }
    setUser(staticUser)
    loadProfiles(staticUser.id)
  }, [])

  // Removed - using Privy, not Supabase auth
  // const checkAuth = async () => { ... }

  const loadProfiles = async (userId: string, city?: string) => {
    try {
      setIsLoading(true)
      const profilesData = await getDiscoveryProfiles(userId, city, devMode)
      setProfiles(profilesData)
      setCurrentIndex(0)

      // Extract unique cities
      const uniqueCities = [...new Set(profilesData.map((p) => p.city).filter(Boolean))] as string[]
      setCities(uniqueCities)

      setIsLoading(false) // Stop loading immediately after profiles load

      // Load shared POAPs for first profile asynchronously (don't block render)
      if (profilesData.length > 0 && !devMode) {
        getSharedPOAPsCount(userId, profilesData[0].user_id).then(setSharedPOAPs).catch(() => setSharedPOAPs(0))
      } else if (devMode && profilesData.length > 0) {
        // Mock shared POAPs count for dev mode
        setSharedPOAPs(Math.floor(Math.random() * 5))
      }
    } catch (error) {
      console.error("[v0] Error loading profiles:", error)
      toast.error("Failed to load profiles")
      setIsLoading(false)
    }
  }

  const getSharedPOAPsCount = async (userId: string, targetUserId: string) => {
    try {
      const shared = await getSharedPOAPs(userId, targetUserId)
      return (shared || []).length
    } catch {
      return 0
    }
  }

  const handleSwipe = async (direction: "left" | "right") => {
    if (!user || currentIndex >= profiles.length) return

    const targetProfile = profiles[currentIndex]

    try {
      setIsRecordingSwipe(true)
      const result = await recordSwipe(user.id, targetProfile.user_id, direction, devMode)

      if (direction === "right") {
        // In dev mode, use the simulated match result
        if (devMode && result.isMatch) {
          setMatchedProfile(targetProfile)
          toast.success(`You matched with ${targetProfile.name}!`)
          
          // Create connection for matched users (skip in dev mode with mock users)
          if (!targetProfile.user_id.startsWith('mock_')) {
            try {
              await addConnection(user.id, targetProfile)
              console.log('[Match] Connection created successfully')
            } catch (error) {
              console.error('[Match] Failed to create connection:', error)
            }
          } else {
            console.log('[Match] Skipping connection creation for mock user in dev mode')
          }
        } else if (!devMode) {
          // Check if it's a match in normal mode
          const matches = await getUserMatches(user.id)
          const isMatch = matches.some(
            (m) =>
              (m.user_a_id === user.id && m.user_b_id === targetProfile.user_id) ||
              (m.user_b_id === user.id && m.user_a_id === targetProfile.user_id),
          )

          if (isMatch) {
            setMatchedProfile(targetProfile)
            toast.success(`You matched with ${targetProfile.name}!`)
            
            // Create connection for matched users
            try {
              await addConnection(user.id, targetProfile)
              console.log('[Match] Connection created successfully')
            } catch (error) {
              console.error('[Match] Failed to create connection:', error)
            }
          }
        }
      }

      // Move to next profile
      if (currentIndex + 1 < profiles.length) {
        setCurrentIndex(currentIndex + 1)
        const nextProfile = profiles[currentIndex + 1]
        if (!devMode) {
          const sharedCount = await getSharedPOAPsCount(user.id, nextProfile.user_id)
          setSharedPOAPs(sharedCount)
        } else {
          setSharedPOAPs(Math.floor(Math.random() * 5))
        }
      } else {
        setCurrentIndex(profiles.length)
        toast.info("No more profiles to discover")
      }
    } catch (error) {
      console.error("[v0] Error recording swipe:", error)
      toast.error("Failed to record swipe")
    } finally {
      setIsRecordingSwipe(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img src="/icon-512.jpg" alt="Loading" className="w-full h-full rounded-full animate-spin" style={{ animationDuration: '2s' }} />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-black" />
          <p className="text-gray-600">Discovering people...</p>
        </div>
      </div>
    )
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-black mb-3">All Caught Up!</h2>
          <p className="text-gray-600 mb-6">You've swiped through all available profiles. Check back soon!</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-bold"
          >
            Back Home
          </button>
        </div>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-black mb-2">No Profiles Found</h2>
        <p className="text-gray-600 mb-6">Complete your profile and link your wallet to discover people</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-bold"
        >
          Back Home
        </button>
      </div>
    )
  }

  const currentProfile = profiles[currentIndex]

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-black">Discover</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 hover:bg-gray-200 rounded-xl transition-colors font-semibold"
          >
            Home
          </button>
        </div>

        {cities.length > 0 && (
          <div className="mb-8 relative">
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value)
                loadProfiles(user.id, e.target.value || undefined)
              }}
              className="w-full px-4 py-3 border-2 border-black rounded-xl appearance-none bg-white cursor-pointer font-semibold"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
          </div>
        )}

        <div className="flex flex-col items-center gap-6">
          <SwipeCard
            profile={currentProfile}
            compatibilityScore={currentProfile.compatibility_score}
            sharedPOAPs={sharedPOAPs}
            onSwipe={handleSwipe}
            isLoading={isRecordingSwipe}
          />

          <div className="text-center text-gray-600">
            <p className="text-sm">
              {currentIndex + 1} of {profiles.length}
            </p>
          </div>
        </div>
      </div>

      {matchedProfile && <MatchModal profile={matchedProfile} onClose={() => setMatchedProfile(null)} />}
    </div>
  )
}
