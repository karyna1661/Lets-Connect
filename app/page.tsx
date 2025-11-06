"use client"

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
import { QRScanner } from "@/components/qr-scanner"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"
import { POAPSyncButton } from "@/components/poap-sync-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { ConnectionCard } from "@/components/connection-card"
import { ProfileCard } from "@/components/profile-card"
import { NavCard } from "@/components/nav-card"
import { QRCodeSVG } from "qrcode.react"

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
  const [isLoading, setIsLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({})
  const [savingNotes, setSavingNotes] = useState<{ [key: string]: boolean }>({})
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

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

  useEffect(() => {
    if (ready && authenticated && privyUser) {
      checkAuth()
    } else if (ready && !authenticated) {
      setIsLoading(false)
    }
  }, [ready, authenticated, privyUser])

  const checkAuth = async () => {
    if (!privyUser) {
      setIsLoading(false)
      return
    }

    try {
      // Use Privy user ID instead of Supabase
      const userId = privyUser.id
      await loadData(userId)
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

      const [profileData, connectionsData] = await Promise.all([getProfile(userId), getConnections(userId)])

      if (profileData) {
        setProfile(profileData)
      } else {
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
      setProfile(newProfile)
      await upsertProfile(newProfile)
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

    try {
      const existingConnection = connections.find((conn) => conn.connected_user_id === scannedProfile.user_id)

      if (existingConnection) {
        toast.info("You've already connected with this person!")
        setView("connections")
        return
      }

      await addConnection(privyUser.id, scannedProfile)
      await loadData(privyUser.id)
      setView("connections")
      toast.success(`Connected with ${scannedProfile.name}!`)
    } catch (error) {
      console.error("[v0] Error adding connection:", error)
      toast.error("Failed to add connection. Please try again.")
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
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-black animate-spin"></div>
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
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-black animate-spin"></div>
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
                onClick={() => {
                  if (!profile.name) {
                    toast.error("Please complete your profile first")
                    setView("profile")
                    return
                  }
                  setView("qr")
                }}
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
                secondaryLabel={connections.length > 0 ? "Export" : undefined}
                onSecondaryClick={connections.length > 0 ? () => toast.info("Export coming soon") : undefined}
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
            onSave={async (updatedProfile) => {
              await saveProfile(updatedProfile)
            }}
            isSaving={isSavingProfile}
          />

          <div className="mt-6 bg-white rounded-3xl p-6 border border-gray-200/50"
            style={{
              boxShadow: `
                0 0 0 1px rgba(0,0,0,0.04),
                0 8px 24px rgba(0,0,0,0.06)
              `,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">POAP Sync</h3>
                <p className="text-xs text-gray-600">Connect your wallet</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Ethereum wallet to sync your POAP collection and unlock compatibility matching
            </p>
            <POAPSyncButton userId={privyUser?.id || ""} currentWallet={profile.wallet_hash} />
          </div>
        </div>
      </div>
    )
  }

  if (view === "qr") {
    return (
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

        <QRCodeDisplay profile={profile} />

        {profile.name && (
          <div className="mt-6 text-center">
            <div className="text-2xl font-bold text-white">{profile.name}</div>
            <div className="text-gray-300">{profile.bio}</div>
          </div>
        )}
      </div>
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
