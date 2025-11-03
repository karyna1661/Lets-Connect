"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Loader2, AlertCircle } from "lucide-react"
import { getDiscoveryProfiles, getSharedPOAPs } from "@/app/actions/discovery"
import { recordSwipe, getUserMatches } from "@/app/actions/swipes"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
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

  let supabase: ReturnType<typeof getSupabaseBrowserClient> | null = null
  try {
    supabase = getSupabaseBrowserClient()
  } catch (error) {
    console.error("[v0] Supabase initialization error:", error)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    if (!supabase) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await loadProfiles(user.id)
      }
    } catch (error) {
      console.error("[v0] Error checking auth:", error)
    }
  }

  const loadProfiles = async (userId: string, city?: string) => {
    try {
      setIsLoading(true)
      const profilesData = await getDiscoveryProfiles(userId, city)
      setProfiles(profilesData)
      setCurrentIndex(0)

      // Extract unique cities
      const uniqueCities = [...new Set(profilesData.map((p) => p.city).filter(Boolean))] as string[]
      setCities(uniqueCities)

      // Load shared POAPs for first profile
      if (profilesData.length > 0) {
        const sharedCount = await getSharedPOAPsCount(userId, profilesData[0].user_id)
        setSharedPOAPs(sharedCount)
      }
    } catch (error) {
      console.error("[v0] Error loading profiles:", error)
      toast.error("Failed to load profiles")
    } finally {
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
      await recordSwipe(user.id, targetProfile.user_id, direction)

      if (direction === "right") {
        // Check if it's a match
        const matches = await getUserMatches(user.id)
        const isMatch = matches.some(
          (m) =>
            (m.user_a_id === user.id && m.user_b_id === targetProfile.user_id) ||
            (m.user_b_id === user.id && m.user_a_id === targetProfile.user_id),
        )

        if (isMatch) {
          setMatchedProfile(targetProfile)
          toast.success(`You matched with ${targetProfile.name}!`)
        }
      }

      // Move to next profile
      if (currentIndex + 1 < profiles.length) {
        setCurrentIndex(currentIndex + 1)
        const nextProfile = profiles[currentIndex + 1]
        const sharedCount = await getSharedPOAPsCount(user.id, nextProfile.user_id)
        setSharedPOAPs(sharedCount)
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
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-black" />
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
