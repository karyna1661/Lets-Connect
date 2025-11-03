"use client"

import { useState, useEffect } from "react"
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
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AuthForm } from "@/components/auth-form"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { QRScanner } from "@/components/qr-scanner"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"
import { POAPSyncButton } from "@/components/poap-sync-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { SeedDemoButton } from "@/components/seed-demo-button"

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

const getSocialUrl = (platform, username) => {
  const urls = {
    instagram: `https://instagram.com/${username.replace("@", "")}`,
    twitter: `https://twitter.com/${username.replace("@", "")}`,
    linkedin: username.startsWith("http") ? username : `https://${username}`,
    github: username.startsWith("http") ? username : `https://github.com/${username.replace("@", "")}`,
    facebook: username.startsWith("http") ? username : `https://facebook.com/${username}`,
    youtube: `https://youtube.com/${username}`,
    website: username.startsWith("http") ? username : `https://${username}`,
    email: `mailto:${username}`,
    farcaster: `https://warpcast.com/${username.replace("@", "")}`,
  }
  return urls[platform] || username
}

export default function LetsConnect() {
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
  const [user, setUser] = useState<any>(null)
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({})
  const [savingNotes, setSavingNotes] = useState<{ [key: string]: boolean }>({})
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

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
    if (!supabase) {
      setInitError("Unable to connect to authentication service. Please check your environment variables.")
      setIsLoading(false)
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await loadData(user.id)
      }
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
    if (!supabase) return

    try {
      await supabase.auth.signOut()
      setUser(null)
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
    if (!user) {
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

      await addConnection(user.id, scannedProfile)
      await loadData(user.id)
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
      await loadData(user.id)
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
      await loadData(user.id)
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-neon-lime)] border-r-[var(--color-neon-pink)] animate-spin"></div>
            <div
              className="absolute inset-4 rounded-full border-4 border-transparent border-b-[var(--color-neon-cyan)] animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            ></div>
          </div>
          <p className="text-[var(--color-neon-lime)] font-display text-xl neon-glow">Loading...</p>
        </div>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-black mb-3">Configuration Error</h1>
          <p className="text-gray-700 mb-6">{initError}</p>
          <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-4 text-left">
            <p className="text-sm font-semibold text-gray-900 mb-2">Required Environment Variables:</p>
            <ul className="text-xs text-gray-700 space-y-1 font-mono">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-radial from-[var(--color-neon-pink)] via-transparent to-transparent rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 left-0 w-96 h-96 bg-gradient-radial from-[var(--color-neon-cyan)] via-transparent to-transparent rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-6xl font-display text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-lime)] via-[var(--color-neon-pink)] to-[var(--color-neon-cyan)] mb-3 neon-glow">
            Let's Connect
          </h1>
          <p className="text-[var(--color-neon-cyan)] text-lg font-light">Your social life, one scan away</p>
        </div>
        <AuthForm />
      </div>
    )
  }

  if (view === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-gradient-radial from-[var(--color-neon-lime)] via-transparent to-transparent rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-radial from-[var(--color-neon-pink)] via-transparent to-transparent rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-5xl font-display text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-lime)] to-[var(--color-neon-pink)] mb-3 neon-glow">
                Let's Connect
              </h1>
              <p className="text-[var(--color-neon-cyan)] text-lg">Your social life, one scan away</p>
            </div>
            <div className="flex gap-2">
              {user && <SeedDemoButton userId={user.id} />}
              <button
                onClick={handleSignOut}
                className="p-3 hover:bg-white/10 rounded-full border-2 border-[var(--color-neon-pink)] hover:border-[var(--color-neon-lime)] transition-all glow-border"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 text-[var(--color-neon-pink)]" />
              </button>
            </div>
          </div>

          {!profile.name && (
            <div className="mb-6 p-4 glass-effect border-l-4 border-[var(--color-neon-orange)] rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--color-neon-orange)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-neon-lime)]">Complete your profile</p>
                  <p className="text-xs text-[var(--color-neon-cyan)] mt-1">
                    Add your name and social links to start networking
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => setView("profile")}
              className="w-full glass-effect rounded-2xl p-6 flex items-center justify-between hover:shadow-2xl transition-all duration-300 glow-border group"
            >
              <div className="flex items-center gap-4">
                <User className="w-8 h-8 text-[var(--color-neon-lime)] group-hover:animate-hue" />
                <div className="text-left">
                  <div className="font-display text-lg text-[var(--color-neon-lime)] neon-glow">My Profile</div>
                  <div className="text-sm text-[var(--color-neon-cyan)]">Setup your socials</div>
                </div>
              </div>
              <Edit className="w-5 h-5 text-[var(--color-neon-pink)]" />
            </button>

            <button
              onClick={() => {
                if (!profile.name) {
                  toast.error("Please complete your profile first")
                  setView("profile")
                  return
                }
                window.location.href = "/discover"
              }}
              className="w-full glass-effect rounded-2xl p-6 flex items-center justify-between hover:shadow-2xl transition-all duration-300 glow-border group"
            >
              <div className="flex items-center gap-4">
                <Heart className="w-8 h-8 text-[var(--color-neon-pink)] group-hover:animate-pulse" />
                <div className="text-left">
                  <div className="font-display text-lg text-[var(--color-neon-pink)] neon-glow">Discover</div>
                  <div className="text-sm text-[var(--color-neon-cyan)]">Swipe & match</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => (window.location.href = "/events")}
              className="w-full glass-effect rounded-2xl p-6 flex items-center justify-between hover:shadow-2xl transition-all duration-300 glow-border group"
            >
              <div className="flex items-center gap-4">
                <Calendar className="w-8 h-8 text-[var(--color-neon-cyan)] group-hover:animate-hue" />
                <div className="text-left">
                  <div className="font-display text-lg text-[var(--color-neon-cyan)] neon-glow">Events</div>
                  <div className="text-sm text-[var(--color-neon-pink)]">Find attendees</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                if (!profile.name) {
                  toast.error("Please complete your profile first")
                  setView("profile")
                  return
                }
                setView("qr")
              }}
              className="w-full glass-effect rounded-2xl p-6 flex items-center justify-between hover:shadow-2xl transition-all duration-300 glow-border group"
            >
              <div className="flex items-center gap-4">
                <QrCode className="w-8 h-8 text-[var(--color-neon-lime)] group-hover:animate-spin" />
                <div className="text-left">
                  <div className="font-display text-lg text-[var(--color-neon-lime)] neon-glow">My QR Code</div>
                  <div className="text-sm text-[var(--color-neon-cyan)]">Show & get scanned</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setView("scan")}
              className="w-full glass-effect rounded-2xl p-6 flex items-center justify-between hover:shadow-2xl transition-all duration-300 glow-border group"
            >
              <div className="flex items-center gap-4">
                <Scan className="w-8 h-8 text-[var(--color-neon-orange)] group-hover:animate-bounce" />
                <div className="text-left">
                  <div className="font-display text-lg text-[var(--color-neon-orange)] neon-glow">Scan Code</div>
                  <div className="text-sm text-[var(--color-neon-cyan)]">Save connections</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setView("connections")}
              className="w-full glass-effect rounded-2xl p-6 flex items-center justify-between hover:shadow-2xl transition-all duration-300 glow-border group"
            >
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-[var(--color-neon-pink)] group-hover:animate-pulse" />
                <div className="text-left">
                  <div className="font-display text-lg text-[var(--color-neon-pink)] neon-glow">My Connections</div>
                  <div className="text-sm text-[var(--color-neon-cyan)]">{connections.length} saved</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (view === "profile") {
    const currentProfile = editingProfile || profile
    const roles = ["Builder", "Founder", "Investor", "Creator", "Other"]

    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-black">Your Profile</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingProfile(null)
                  setView("home")
                }}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => saveProfile(currentProfile)}
                disabled={isSavingProfile}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSavingProfile ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border-2 border-black">
            <ProfilePhotoUpload
              userId={user.id}
              currentImageUrl={currentProfile.profile_image}
              userName={currentProfile.name}
              onUploadSuccess={(imageUrl) => {
                const updatedProfile = { ...currentProfile, profile_image: imageUrl }
                setEditingProfile(updatedProfile)
                saveProfile(updatedProfile)
              }}
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border-2 border-black">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={currentProfile.name}
                onChange={(e) =>
                  setEditingProfile({
                    ...(editingProfile || profile),
                    name: e.target.value,
                  })
                }
                placeholder="Your full name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
              <textarea
                value={currentProfile.bio || ""}
                onChange={(e) =>
                  setEditingProfile({
                    ...(editingProfile || profile),
                    bio: e.target.value,
                  })
                }
                placeholder="Tell people about yourself..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                <input
                  type="text"
                  value={currentProfile.city || ""}
                  onChange={(e) =>
                    setEditingProfile({
                      ...(editingProfile || profile),
                      city: e.target.value,
                    })
                  }
                  placeholder="Your city"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Role</label>
                <select
                  value={currentProfile.role || "Other"}
                  onChange={(e) =>
                    setEditingProfile({
                      ...(editingProfile || profile),
                      role: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Interests (comma separated)</label>
              <input
                type="text"
                value={(currentProfile.interests || []).join(", ")}
                onChange={(e) =>
                  setEditingProfile({
                    ...(editingProfile || profile),
                    interests: e.target.value
                      .split(",")
                      .map((i) => i.trim())
                      .filter((i) => i),
                  })
                }
                placeholder="e.g. Web3, AI, Design"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={currentProfile.is_discoverable || true}
                  onChange={(e) =>
                    setEditingProfile({
                      ...(editingProfile || profile),
                      is_discoverable: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-black"
                />
                <span className="text-sm font-semibold text-gray-900">Show in Discovery</span>
              </label>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Location Sharing</label>
                <select
                  value={currentProfile.location_sharing || "off"}
                  onChange={(e) =>
                    setEditingProfile({
                      ...(editingProfile || profile),
                      location_sharing: e.target.value as "off" | "city" | "precise",
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="off">Private</option>
                  <option value="city">City Only</option>
                  <option value="precise">Precise</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border-2 border-black">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-black" />
              <h3 className="text-xl font-bold text-black mb-4">POAP Sync</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Ethereum wallet to sync your POAP collection and unlock compatibility matching
            </p>
            <POAPSyncButton userId={user.id} currentWallet={currentProfile.wallet_hash} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-black">
            <h3 className="text-xl font-bold text-black mb-4">Social Links</h3>

            <div className="space-y-3">
              {[
                { key: "instagram", label: "Instagram", placeholder: "@username" },
                { key: "twitter", label: "Twitter/X", placeholder: "@username" },
                { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/username" },
                { key: "github", label: "GitHub", placeholder: "github.com/username" },
                { key: "facebook", label: "Facebook", placeholder: "facebook.com/username" },
                { key: "youtube", label: "YouTube", placeholder: "@channel" },
                { key: "website", label: "Website", placeholder: "yourwebsite.com" },
                { key: "email", label: "Email", placeholder: "you@example.com" },
              ].map((social) => (
                <div key={social.key} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={(currentProfile[social.key as keyof Profile] as string) || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...(editingProfile || profile),
                        [social.key]: e.target.value,
                      })
                    }
                    placeholder={social.placeholder}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                </div>
              ))}
            </div>
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
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-black">My Connections</h2>
            <button onClick={() => setView("home")} className="p-2 hover:bg-gray-200 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          {connections.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No connections yet</p>
              <p className="text-gray-500 text-sm">Scan QR codes to save profiles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((conn) => {
                const isEditingNote = editingNotes[conn.id!] !== undefined
                const currentNotes = isEditingNote ? editingNotes[conn.id!] : conn.notes || ""

                return (
                  <div key={conn.id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-black">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-16 h-16 border-2 border-black">
                        <AvatarImage
                          src={conn.connection_data.profile_image || undefined}
                          alt={conn.connection_data.name}
                        />
                        <AvatarFallback className="bg-gray-200 text-black font-bold">
                          {conn.connection_data.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-black">{conn.connection_data.name}</h3>
                            <p className="text-gray-700 text-sm">{conn.connection_data.bio}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              Scanned {new Date(conn.created_at!).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${conn.connection_data.name} from connections?`)) {
                                handleDeleteConnection(conn.id!, conn.connection_data.name)
                              }
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <X className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {Object.entries(conn.connection_data)
                            .filter(([key]) =>
                              ["instagram", "twitter", "linkedin", "github", "email", "website"].includes(key),
                            )
                            .filter(([_, value]) => value)
                            .map(([key, value]) => {
                              const Icon = SocialIcons[key as keyof typeof SocialIcons]
                              if (!Icon) return null
                              return (
                                <a
                                  key={key}
                                  href={
                                    key === "email"
                                      ? `mailto:${value}`
                                      : (value as string).startsWith("http")
                                        ? (value as string)
                                        : `https://${value}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm"
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                  <span className="font-medium">{key}</span>
                                </a>
                              )
                            })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-gray-200">
                      <div className="flex items-start gap-2">
                        <StickyNote className="w-5 h-5 text-gray-600 mt-2" />
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Notes</label>
                          <textarea
                            value={currentNotes}
                            onChange={(e) =>
                              setEditingNotes((prev) => ({
                                ...prev,
                                [conn.id!]: e.target.value,
                              }))
                            }
                            placeholder="Add notes about this connection..."
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm resize-none"
                            rows={2}
                          />
                          {isEditingNote && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleSaveNotes(conn.id!)}
                                disabled={savingNotes[conn.id!]}
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
                              >
                                <Save className="w-4 h-4" />
                                {savingNotes[conn.id!] ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={() =>
                                  setEditingNotes((prev) => {
                                    const newState = { ...prev }
                                    delete newState[conn.id!]
                                    return newState
                                  })
                                }
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
