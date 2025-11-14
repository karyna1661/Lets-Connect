"use client"

// Optimized for mobile - v2.0
import { useState, useEffect } from "react"
import { usePrivy, useWallets } from '@privy-io/react-auth'
import {
  QrCode,
  User,
  Scan,
  Users,
  Edit,
  X,
  Instagram,
  Linkedin,
  Twitter,
  Github,
  Facebook,
  Youtube,
  Globe,
  Mail,
  LogOut,
  Save,
  StickyNote,
  AlertCircle,
  Heart,
  Calendar,
  Zap,
} from "lucide-react"
import { getProfile, upsertProfile } from "./actions/profile"
import { getConnections, addConnection, deleteConnection, updateConnectionNotes } from "./actions/connections"
import type { Profile, Connection } from "@/lib/types"
import { PrivyAuthForm } from "@/components/privy-auth-form"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { QRCodeEditor } from "@/components/qr-code-editor"
import { QRScanner } from "@/components/qr-scanner"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"
import { POAPSyncButton } from "@/components/poap-sync-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { ConnectionCard } from "@/components/connection-card"
import { ProfileCard } from "@/components/profile-card"
import { NavCard } from "@/components/nav-card"
import { DevconnectEventCard } from "@/components/devconnect-event-card"
import { QRCodeSVG } from "qrcode.react"
import { getUserPOAPs } from "./actions/poaps"
import { syncFromFarcaster } from "./actions/social-sync"

const SocialIcons = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  website: Globe,
  email: Mail,
  farcaster: User,
}

export default function LetsConnect() {
  const { ready, authenticated, user: privyUser, logout } = usePrivy()
  const { wallets } = useWallets()
  const farcasterUsername: string = typeof (privyUser as any)?.farcaster?.username === 'string' ? ((privyUser as any).farcaster.username as string) : ""
  
  const [view, setView] = useState("home")
  const [profile, setProfile] = useState<Profile>({
    user_id: "",
    name: "",
    bio: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    email: "",
    profile_image: "",
    city: "",
    role: "Other",
    interests: [],
    is_discoverable: true,
    location_sharing: "off",
  })
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [poaps, setPoaps] = useState<any[]>([])
  const [hasAutoSyncedFarcaster, setHasAutoSyncedFarcaster] = useState(false)
  const [lastSyncedUser, setLastSyncedUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({})
  const [savingNotes, setSavingNotes] = useState<{ [key: string]: boolean }>({})
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [isQREditorOpen, setIsQREditorOpen] = useState(false)

  // Helper functions
  const getProfileCompletion = (profile: Profile): number => {
    let completed = 0
    let total = 5
    if (profile.name?.trim()) completed++
    if (profile.bio?.trim()) completed++
    if (profile.email?.trim() || profile.linkedin?.trim() || profile.twitter?.trim() || profile.instagram?.trim()) completed++
    if (profile.city?.trim()) completed++
    if (profile.role && profile.role !== "Other") completed++
    return Math.round((completed / total) * 100)
  }

  const getInitials = (name: string): string => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  }

  const getConnectionsPreview = (connections: Connection[], n = 2): Connection[] => {
    return connections.slice(0, n)
  }

  const buildQrPayload = (profile: Profile): string => {
    return JSON.stringify({
      user_id: profile.user_id,
      name: profile.name,
      username: profile.username,
      bio: profile.bio,
      profile_image: profile.profile_image,
      city: profile.city,
      role: profile.role,
      interests: profile.interests,
      // Social links
      email: profile.email,
      x: profile.x,
      instagram: profile.instagram,
      linkedin: profile.linkedin,
      github: profile.github,
      youtube: profile.youtube,
      tiktok: profile.tiktok,
      telegram: profile.telegram,
      // Web3 profiles
      ens: profile.ens,
      farcaster: profile.farcaster,
      zora: profile.zora,
      paragraph: profile.paragraph,
      substack: profile.substack,
    })
  }

  let supabase = null

  // Initialize and check auth when Privy is ready
  useEffect(() => {
    if (ready) {
      checkAuth()
    }
  }, [ready, authenticated, privyUser])

  useEffect(() => {
    // Auto-sync Farcaster once immediately after Privy login with Farcaster
    // Only sync if we haven't synced for this specific user yet
    if (ready && authenticated && farcasterUsername && privyUser?.id && lastSyncedUser !== privyUser.id) {
      (async () => {
        try {
          console.log('[Auto Sync] Starting Farcaster sync for:', farcasterUsername)
          console.log('[Auto Sync] Privy user ID:', privyUser?.id)
          
          // First load existing profile from DB
          const existingProfile = await getProfile(privyUser.id)
          console.log('[Auto Sync] Existing profile from DB:', existingProfile)
          
          const result = await syncFromFarcaster(farcasterUsername)
          console.log('[Auto Sync] Sync result:', result)
          
          if (result.success && result.data) {
            // MERGE: Only fill in fields that are currently empty
            // Keep user's manually entered data (email, city, interests, etc.)
            
            // Consolidate twitter and x fields (they're the same thing)
            const twitterHandle = result.data.x || result.data.twitter || existingProfile?.x || existingProfile?.twitter || ''
            
            const mergedProfile = {
              ...existingProfile,  // Start with existing data
              ...result.data,      // Add Farcaster data
              // Preserve manually entered fields if they exist
              email: existingProfile?.email || result.data.email || '',
              city: existingProfile?.city || result.data.city || '',
              role: existingProfile?.role || result.data.role || 'Other',
              interests: existingProfile?.interests || result.data.interests || [],
              linkedin: existingProfile?.linkedin || result.data.linkedin || '',
              instagram: existingProfile?.instagram || result.data.instagram || '',
              youtube: existingProfile?.youtube || result.data.youtube || '',
              // Consolidate twitter and x to prevent duplicates
              x: twitterHandle,
              twitter: twitterHandle,  // Keep both synced for backwards compatibility
              user_id: privyUser.id
            }
            console.log('[Auto Sync] Merged profile (preserving manual data):', mergedProfile)
            console.log('[Auto Sync] Twitter/X consolidated to:', twitterHandle)
            
            // Auto-save the merged profile to database
            try {
              console.log('[Auto Sync] Calling upsertProfile with merged data')
              const savedProfile = await upsertProfile(mergedProfile)
              console.log('[Auto Sync] Profile saved successfully:', savedProfile)
              console.log('[Auto Sync] Wallet address saved:', result.data.wallet_address)
              
              // Update local state with saved data
              setProfile(savedProfile)
              
              // Mark this user as synced
              setLastSyncedUser(privyUser.id)
            } catch (saveError) {
              console.error('[Auto Sync] Failed to save profile:', saveError)
              console.error('[Auto Sync] Error details:', JSON.stringify(saveError, null, 2))
              
              // Still update UI even if save failed
              setProfile(mergedProfile)
            }
            
            // Refresh POAPs after wallet is set
            try {
              const p = await getUserPOAPs(privyUser.id)
              setPoaps(p)
              console.log('[Auto Sync] POAPs loaded:', p.length)
            } catch (poapError) {
              console.error('[Auto Sync] Failed to load POAPs:', poapError)
            }
          } else {
            console.error('[Auto Sync] Sync failed:', result.error)
          }
        } catch (e) {
          console.error("[Auto Farcaster Sync] Error:", e)
        }
      })()
    }
  }, [ready, authenticated, farcasterUsername, privyUser?.id, lastSyncedUser])

  const checkAuth = async () => {
    if (!privyUser) {
      setIsLoading(false)
      return
    }

    try {
      // Use Privy user ID instead of Supabase
      const userId = privyUser.id
      
      // Check if user has email and try to merge profiles
      const userEmail = (privyUser as any)?.email?.address
      if (userEmail) {
        try {
          const { mergeProfileOnAccountLink } = await import('./actions/profile')
          await mergeProfileOnAccountLink(userId, userEmail)
        } catch (mergeError) {
          console.log('[Profile Merge] No merge needed or error:', mergeError)
        }
      }
      
      await loadData(userId)
      try {
        const p = await getUserPOAPs(userId)
        setPoaps(p)
      } catch {}

    } catch (error) {
      console.error("[v0] Error checking auth:", error)
      toast.error("Failed to authenticate. Please refresh the page.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = async (userId: string) => {
    try {
      setIsLoading(true)
      console.log('[Load Data] Loading profile for userId:', userId)

      const [profileData, connectionsData] = await Promise.all([getProfile(userId), getConnections(userId)])

      console.log('[Load Data] Profile received from DB:', JSON.stringify(profileData, null, 2))
      console.log('[Load Data] Email:', profileData?.email)
      console.log('[Load Data] City:', profileData?.city)
      console.log('[Load Data] LinkedIn:', profileData?.linkedin)
      console.log('[Load Data] X:', profileData?.x)
      console.log('[Load Data] Instagram:', profileData?.instagram)
      console.log('[Load Data] GitHub:', profileData?.github)
      console.log('[Load Data] Interests:', profileData?.interests)

      if (profileData) {
        setProfile(profileData)
      } else {
        console.log('[Load Data] No profile found, creating new profile state')
        setProfile((prev) => ({ ...prev, user_id: userId }))
      }

      setConnections(connectionsData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      toast.error("Failed to load your data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await logout()
      setProfile({
        user_id: "",
        name: "",
        bio: "",
        linkedin: "",
        twitter: "",
        instagram: "",
        email: "",
        profile_image: "",
        city: "",
        role: "Other",
        interests: [],
        is_discoverable: true,
        location_sharing: "off",
      })
      setConnections([])
      setLastSyncedUser(null) // Reset sync tracker on sign out
      setView("home")
      toast.success("Signed out successfully")
    } catch (error) {
      console.error("[v0] Error signing out:", error)
      toast.error("Failed to sign out. Please try again.")
    }
  }

  const saveProfile = async (newProfile: Profile) => {
    if (!newProfile.name.trim()) {
      toast.error("Please enter your name")
      return
    }

    try {
      setIsSavingProfile(true)
      console.log('[Save Profile] Saving profile with city:', newProfile.city, 'and email:', newProfile.email)
      console.log('[Save Profile] Full profile data:', JSON.stringify(newProfile, null, 2))
      
      const savedProfile = await upsertProfile(newProfile)
      console.log('[Save Profile] Profile saved, returned data:', JSON.stringify(savedProfile, null, 2))
      
      // Update local state immediately with saved data
      setProfile(savedProfile)
      
      setEditingProfile(null)
      toast.success("Profile saved successfully")
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      toast.error("Failed to save profile. Please try again.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleScanSuccess = async (scannedProfile: Profile) => {
    if (!privyUser) {
      toast.error("Please sign in to add connections")
      return
    }

    console.log('[Scan] Scanned profile:', { user_id: scannedProfile.user_id, name: scannedProfile.name })
    console.log('[Scan] Current user:', privyUser.id)

    try {
      const existingConnection = connections.find((conn) => conn.connected_user_id === scannedProfile.user_id)

      if (existingConnection) {
        toast.info("You've already connected with this person!")
        setView("connections")
        return
      }

      console.log('[Scan] Adding connection...')
      console.log('[Scan] Current connections count BEFORE:', connections.length)
      
      // Add connection first before showing success
      const newConnection = await addConnection(privyUser.id, scannedProfile)
      console.log('[Scan] Connection added successfully, returned:', newConnection)
      
      // Reload data immediately - this will refresh connections list
      console.log('[Scan] Reloading connections from database...')
      const [updatedProfile, updatedConnections] = await Promise.all([
        getProfile(privyUser.id),
        getConnections(privyUser.id)
      ])
      
      console.log('[Scan] Connections reloaded from DB, count:', updatedConnections.length)
      console.log('[Scan] Updated connections:', updatedConnections.map(c => ({ id: c.id, name: c.connection_data.name })))
      
      // Update state with fresh data
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      setConnections(updatedConnections)
      
      // Show success feedback AFTER state is updated
      toast.success(`✓ Connected with ${scannedProfile.name}!`, { duration: 3000 })
      
      // Wait a bit for React to re-render with new state
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('[Scan] Navigating to connections view with', updatedConnections.length, 'connections')
      setView("connections")
    } catch (error) {
      console.error("[Scan] Error adding connection:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      console.error("[Scan] Error details:", errorMessage)
      toast.error(`Failed to add connection: ${errorMessage}`)
      setView("home")
    }
  }

  const handleSaveNotes = async (connectionId: string) => {
    const notes = editingNotes[connectionId]
    if (notes === undefined) return

    try {
      setSavingNotes((prev) => ({ ...prev, [connectionId]: true }))
      await updateConnectionNotes(connectionId, notes)
      if (privyUser) {
        await loadData(privyUser.id)
      }
      setEditingNotes((prev) => {
        const newState = { ...prev }
        delete newState[connectionId]
        return newState
      })
      toast.success("Notes saved successfully")
    } catch (error) {
      console.error("[v0] Error saving notes:", error)
      toast.error("Failed to save notes. Please try again.")
    } finally {
      setSavingNotes((prev) => ({ ...prev, [connectionId]: false }))
    }
  }

  const handleDeleteConnection = async (connectionId: string, connectionName: string) => {
    try {
      await deleteConnection(connectionId)
      if (privyUser) {
        await loadData(privyUser.id)
      }
      toast.success(`Removed ${connectionName} from connections`)
    } catch (error) {
      console.error("[v0] Error deleting connection:", error)
      toast.error("Failed to delete connection. Please try again.")
    }
  }

  useEffect(() => {
    if (view === "qr") {
      setTimeout(() => {}, 100)
    }
  }, [view, profile])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img src="/icon-512.jpg" alt="Loading" className="w-full h-full rounded-full animate-spin" style={{ animationDuration: '2s' }} />
          </div>
          <p className="text-black font-bold text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-black mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-black mb-3">Configuration Error</h1>
          <p className="text-black mb-6">{initError}</p>
          <div className="bg-white border-2 border-black rounded-xl p-4 text-left">
            <p className="text-sm font-semibold text-black mb-2">Required Environment Variables:</p>
            <ul className="text-xs text-black space-y-1 font-mono">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-black text-white rounded-xl hover:bg-black/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!ready || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img src="/icon-512.jpg" alt="Loading" className="w-full h-full rounded-full animate-spin" style={{ animationDuration: '2s' }} />
          </div>
          <p className="text-black font-bold text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-bold text-black mb-3">
            Let's Connect
          </h1>
          <p className="text-black text-lg">Your social life, one scan away</p>
        </div>
        <PrivyAuthForm />
      </div>
    )
  }

  if (view === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 gap-4 relative z-20">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2 truncate">Let's Connect</h1>
              <p className="text-gray-600 text-sm sm:text-lg">Your social life, one scan away</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold shadow-md text-sm whitespace-nowrap flex-shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Sign Out</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr relative z-10" style={{ minHeight: '600px' }}>
            <div className="w-full relative" style={{ minHeight: '280px' }}>
              <NavCard
                icon={User}
                title="My Profile"
                description="Setup your info"
                backTitle="Edit Profile"
                backDescription="Add your name, bio and socials"
                ctaLabel="Edit Profile"
                backExtra={
                  <div className="space-y-3">
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${getProfileCompletion(profile)}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-400">{getProfileCompletion(profile)}% complete</span>
                    </div>
                  </div>
                }
                onClick={() => setView("profile")}
              />
            </div>

            <div className="w-full relative" style={{ minHeight: '280px' }}>
              <NavCard
                icon={Heart}
                title="Discover"
                description="Swipe & match"
                backTitle="Find Connections"
                backDescription="Meet people attending the same event"
                ctaLabel="Start Swiping"
                backExtra={
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-white/40" />
                      </div>
                    ))}
                  </div>
                }
                onClick={() => {
                  if (!profile.name) {
                    toast.error("Please complete your profile first")
                    setView("profile")
                    return
                  }
                  window.location.href = "/discover"
                }}
              />
            </div>

            <div className="w-full relative" style={{ minHeight: '280px' }}>
              <NavCard
                icon={Calendar}
                title="Events"
                description="Find attendees"
                backTitle="Browse Events"
                backDescription="See events around you and who's attending"
                ctaLabel="Browse Events"
                backExtra={
                  <div className="flex justify-center">
                    <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-full">
                      <span className="text-xs text-white/80">Upcoming events</span>
                    </div>
                  </div>
                }
                onClick={() => (window.location.href = "/events")}
              />
            </div>

            <div className="w-full relative" style={{ minHeight: '280px' }}>
              <NavCard
                icon={QrCode}
                title="My QR Code"
                description="Get scanned"
                backTitle="Share Your QR"
                backDescription="Show this to someone so they can connect"
                ctaLabel="Show QR Code"
                backExtra={
                  <div className="flex justify-center">
                    <div className="bg-white rounded-xl p-2">
                      <QRCodeSVG value={buildQrPayload(profile)} size={64} level="H" includeMargin={false} />
                    </div>
                  </div>
                }
                onClick={() => setView("qr")}
              />
            </div>

            <div className="w-full relative" style={{ minHeight: '280px' }}>
              <NavCard
                icon={Scan}
                title="Scan Code"
                description="Save connections"
                backTitle="Scan QR Code"
                backDescription="Scan a QR code to collect a profile"
                ctaLabel="Open Scanner"
                backExtra={
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-16 h-16 border-2 border-dashed border-white/40 rounded-xl flex items-center justify-center">
                      <Scan className="w-8 h-8 text-white/60" />
                    </div>
                    <span className="text-xs text-white/60">Open the scanner</span>
                </div>
                }
                onClick={() => setView("scan")}
              />
            </div>

            <div className="w-full relative" style={{ minHeight: '280px' }}>
              <NavCard
                icon={Users}
                title="My Connections"
                description={`${connections.length} saved`}
                backTitle="View Connections"
                backDescription="View and manage saved contacts"
                ctaLabel="View All"
                backExtra={
                  <div className="flex flex-col items-center gap-3">
                    {connections.length > 0 ? (
                      <>
                        <div className="flex -space-x-3">
                          {getConnectionsPreview(connections).map((conn, idx) => (
                            <Avatar key={idx} className="w-12 h-12 border-2 border-gray-900">
                              <AvatarImage src={conn.connection_data.profile_image || undefined} />
                              <AvatarFallback className="bg-white text-black text-sm font-bold">
                                {getInitials(conn.connection_data.name)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <div className="px-3 py-1 bg-white/10 rounded-full">
                          <span className="text-xs text-white/80">{connections.length} saved</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <span className="text-xs text-white/60">No connections yet</span>
                      </div>
                    )}
                  </div>
                }
                onClick={() => setView("connections")}
              />
            </div>

            {/* Placeholder cards - Hidden until ready to implement */}
            {/* <div className="w-full relative" style={{ minHeight: '280px' }}>
              <NavCard
                icon={Heart}
                title=""
                description=""
                backTitle=""
                backDescription=""
                ctaLabel=""
                onClick={() => {}}
              />
            </div>

            <div className="w-full relative" style={{ minHeight: '280px' }}>
              <NavCard
                icon={Heart}
                title=""
                description=""
                backTitle=""
                backDescription=""
                ctaLabel=""
                onClick={() => {}}
              />
            </div> */}
          </div>
        </div>
      </div>
    )
  }

  if (view === "profile") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-1">Your Profile</h2>
              <p className="text-gray-600">Tap card to edit your information</p>
            </div>
            <button
              onClick={() => {
                setEditingProfile(null)
                setView("home")
              }}
              className="p-3 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <ProfileCard
            profile={profile}
            userId={privyUser?.id || ""}
            poaps={poaps}
            onPoapSync={async () => {
              if (privyUser?.id) {
                const p = await getUserPOAPs(privyUser.id)
                setPoaps(p)
              }
            }}
            onSave={async (updatedProfile) => {
              await saveProfile(updatedProfile)
            }}
            isSaving={isSavingProfile}
          />
        </div>
      </div>
    )
  }

  if (view === "qr") {
    return (
      <>
        {isQREditorOpen && (
          <QRCodeEditor 
            profile={profile} 
            onClose={() => setIsQREditorOpen(false)} 
          />
        )}
        
        {!isQREditorOpen && (
          <div className="min-h-screen bg-black p-6 flex flex-col items-center justify-center">
            <button
              onClick={() => setView("home")}
              className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Your QR Code</h2>
              <p className="text-gray-300">Let others scan to connect</p>
            </div>

            <div onClick={() => setIsQREditorOpen(true)} className="cursor-pointer">
              <QRCodeDisplay profile={profile} />
            </div>

            {/* Tap to edit button */}
            <div className="mt-6 cursor-pointer" onClick={() => setIsQREditorOpen(true)}>
              <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-full hover:bg-white/20 transition-colors">
                <span className="text-sm font-semibold text-white">Tap to customize →</span>
              </div>
            </div>

            {profile.name && (
              <div className="mt-6 text-center">
                <div className="text-2xl font-bold text-white">{profile.name}</div>
                {profile.bio && <div className="text-gray-300 mb-2">{profile.bio}</div>}
                {profile.farcaster && (
                  <div className="text-purple-400 text-sm font-semibold">
                    {profile.farcaster}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  if (view === "scan") {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Scan QR Code</h2>
          <button onClick={() => setView("home")} className="p-2 bg-white/20 hover:bg-white/30 rounded-full">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={(error) => {
              console.error("[v0] Scan error:", error)
              toast.error(error)
            }}
          />
        </div>
      </div>
    )
  }

  if (view === "connections") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-1">My Connections</h2>
              <p className="text-gray-600">Tap cards to view and edit notes</p>
            </div>
            <button onClick={() => setView("home")} className="p-3 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {connections.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No connections yet</h3>
              <p className="text-gray-600">Scan QR codes to save profiles and build your network</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((conn) => (
                <ConnectionCard
                  key={conn.id}
                  connection={conn}
                  onDelete={handleDeleteConnection}
                  onSaveNotes={async (connectionId, notes) => {
                    try {
                      setSavingNotes((prev) => ({ ...prev, [connectionId]: true }))
                      await updateConnectionNotes(connectionId, notes)
                      if (privyUser) {
                        await loadData(privyUser.id)
                      }
                      toast.success("Notes saved successfully")
                    } catch (error) {
                      console.error("[v0] Error saving notes:", error)
                      toast.error("Failed to save notes")
                    } finally {
                      setSavingNotes((prev) => ({ ...prev, [connectionId]: false }))
                    }
                  }}
                  isSavingNotes={savingNotes[conn.id!]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
