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
  CheckCircle,
} from "lucide-react"
import { getProfile, upsertProfile } from "./actions/profile"
import { getConnections, addConnection, deleteConnection, updateConnectionNotes } from "./actions/connections"
import type { Profile, Connection } from "@/lib/types"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AuthForm } from "@/components/auth-form"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { QRScanner } from "@/components/qr-scanner"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const SocialIcons: Record<string, React.ComponentType<any>> = {
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

const getSocialUrl = (platform: string, username: string) => {
  const urls: Record<string, string> = {
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
    github: "",
    facebook: "",
    youtube: "",
    website: "",
    farcaster: "",
    phone: "",
    email: "",
    profile_image: "",
    social_visibility: {},
  })
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({})
  const [savingNotes, setSavingNotes] = useState<{ [key: string]: boolean }>({})
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [visibilityToggles, setVisibilityToggles] = useState<Record<string, boolean>>({})
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
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
        // Initialize visibility toggles from profile or default all to true
        const initialToggles = profileData.social_visibility || {}
        const allSocialFields = ['email', 'phone', 'linkedin', 'twitter', 'instagram', 'github', 'facebook', 'youtube', 'website', 'farcaster']
        const defaultToggles = allSocialFields.reduce((acc, field) => {
          acc[field] = initialToggles[field] !== false // Default to true unless explicitly set to false
          return acc
        }, {} as Record<string, boolean>)
        setVisibilityToggles(defaultToggles)
        
        // Auto-redirect new users to profile setup
        if (!profileData.name) {
          setView("profile")
        }
      } else {
        setProfile((prev) => ({ ...prev, user_id: userId }))
        // Default all visibility toggles to true for new users
        const allSocialFields = ['email', 'phone', 'linkedin', 'twitter', 'instagram', 'github', 'facebook', 'youtube', 'website', 'farcaster']
        const defaultToggles = allSocialFields.reduce((acc, field) => {
          acc[field] = true
          return acc
        }, {} as Record<string, boolean>)
        setVisibilityToggles(defaultToggles)
        // Auto-redirect new users to profile setup
        setView("profile")
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
      await supabase.auth.signOut()
      setUser(null)
      setProfile({
        user_id: "",
        name: "",
        bio: "",
        linkedin: "",
        twitter: "",
        instagram: "",
        github: "",
        facebook: "",
        youtube: "",
        website: "",
        farcaster: "",
        phone: "",
        email: "",
        profile_image: "",
        social_visibility: {},
      })
      setVisibilityToggles({})
      setConnections([])
      setView("home")
      toast.success("Signed out successfully", {
        description: "See you next time! 👋"
      })
    } catch (error) {
      console.error("[v0] Error signing out:", error)
      toast.error("Failed to sign out", {
        description: "Please try again or refresh the page"
      })
    }
  }

  const saveProfile = async (newProfile: Profile) => {
    if (!newProfile.name.trim()) {
      toast.error("Name is required", {
        description: "Please enter your full name to continue"
      })
      return
    }

    try {
      setIsSavingProfile(true)
      setProfile(newProfile)
      await upsertProfile(newProfile)
      toast.success("Profile saved!", {
        description: "Your changes have been saved successfully"
      })
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      toast.error("Failed to save profile", {
        description: "Please check your connection and try again"
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleScanSuccess = async (scannedProfile: Profile) => {
    if (!user) {
      toast.error("Sign in required", {
        description: "Please sign in to add connections"
      })
      return
    }

    try {
      const existingConnection = connections.find((conn) => conn.connected_user_id === scannedProfile.user_id)

      if (existingConnection) {
        toast.info("Already connected!", {
          description: `You've already connected with ${scannedProfile.name}`
        })
        setView("connections")
        return
      }

      await addConnection(user.id, scannedProfile)
      await loadData(user.id)
      setView("connections")
      toast.success(`Connected with ${scannedProfile.name}!`, {
        description: "Check your connections to see their profile"
      })
    } catch (error) {
      console.error("[v0] Error adding connection:", error)
      toast.error("Failed to add connection", {
        description: "Please try scanning the QR code again"
      })
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
      toast.success("Notes saved!", {
        description: "Your notes have been updated"
      })
    } catch (error) {
      console.error("[v0] Error saving notes:", error)
      toast.error("Failed to save notes", {
        description: "Please try again or check your connection"
      })
    } finally {
      setSavingNotes((prev) => ({ ...prev, [connectionId]: false }))
    }
  }

  const handleDeleteConnection = async (connectionId: string, connectionName: string) => {
    try {
      await deleteConnection(connectionId)
      await loadData(user.id)
      toast.success(`Removed ${connectionName}`, {
        description: "Connection has been removed from your list"
      })
    } catch (error) {
      console.error("[v0] Error deleting connection:", error)
      toast.error("Failed to remove connection", {
        description: "Please try again or refresh the page"
      })
    }
  }

  const availableSocials = [
    { key: "instagram", label: "Instagram", placeholder: "@username" },
    { key: "twitter", label: "Twitter/X", placeholder: "@username" },
    { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/username" },
    { key: "github", label: "GitHub", placeholder: "github.com/username" },
    { key: "facebook", label: "Facebook", placeholder: "facebook.com/username" },
    { key: "youtube", label: "YouTube", placeholder: "@channel" },
    { key: "website", label: "Website", placeholder: "yourwebsite.com" },
    { key: "farcaster", label: "Farcaster", placeholder: "@username" },
    { key: "phone", label: "Phone/WhatsApp", placeholder: "+1234567890" },
    { key: "email", label: "Email", placeholder: "you@example.com" },
  ]

  useEffect(() => {
    if (view === "qr") {
      setTimeout(() => {}, 100)
    }
  }, [view, profile])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="max-w-sm sm:max-w-md w-full">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="text-center flex-1">
              <Skeleton className="h-8 sm:h-12 w-48 sm:w-64 mx-auto mb-2 sm:mb-3" />
              <Skeleton className="h-4 sm:h-5 w-32 sm:w-40 mx-auto" />
            </div>
            <Skeleton className="w-8 h-8 sm:w-12 sm:h-12 rounded-full" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-gray-200">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-1" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                  </div>
                  <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="text-center mb-6 sm:mb-8 max-w-sm sm:max-w-md">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-2 sm:mb-3">Let's Connect</h1>
          <p className="text-gray-700 text-base sm:text-lg">Your social life, one scan away</p>
        </div>
        <div className="w-full max-w-sm sm:max-w-md">
        <AuthForm />
        </div>
      </div>
    )
  }

  if (view === "home") {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="max-w-sm sm:max-w-md w-full">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="text-center flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-2 sm:mb-3">Let's Connect</h1>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg">Your social life, one scan away</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-full border-2 border-black transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {!profile.name && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border-2 border-yellow-600 rounded-xl flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-yellow-900">Complete your profile</p>
                <p className="text-xs text-yellow-800 mt-1">Add your name and social links to start networking</p>
              </div>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => setView("profile")}
              className="w-full bg-black text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center justify-between hover:bg-gray-800 transition-all duration-200 shadow-lg border-2 border-black active:scale-95 hover-lift group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <User className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-left">
                  <div className="font-bold text-base sm:text-lg">My Profile</div>
                  <div className="text-xs sm:text-sm text-gray-300">Setup your socials</div>
                </div>
              </div>
              <Edit className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-200" />
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
              className="w-full bg-white text-black rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center justify-between hover:bg-gray-100 transition-all duration-200 shadow-lg border-2 border-black active:scale-95 hover-lift group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <QrCode className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-left">
                  <div className="font-bold text-base sm:text-lg">My QR Code</div>
                  <div className="text-xs sm:text-sm text-gray-600">Show & get scanned</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setView("scan")}
              className="w-full bg-black text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center justify-between hover:bg-gray-800 transition-all duration-200 shadow-lg border-2 border-black active:scale-95 hover-lift group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <Scan className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-left">
                  <div className="font-bold text-base sm:text-lg">Scan Code</div>
                  <div className="text-xs sm:text-sm text-gray-300">Save connections</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setView("connections")}
              className="w-full bg-white text-black rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center justify-between hover:bg-gray-100 transition-all duration-200 shadow-lg border-2 border-black active:scale-95 hover-lift group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-left">
                  <div className="font-bold text-base sm:text-lg">My Connections</div>
                  <div className="text-xs sm:text-sm text-gray-600">{connections.length} saved</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (view === "profile") {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-lg sm:max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-black">Your Profile</h2>
            <button onClick={() => setView("home")} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6 border-2 border-black">
            <ProfilePhotoUpload
              userId={user.id}
              currentImageUrl={profile.profile_image}
              userName={profile.name}
              onUploadSuccess={(imageUrl) => saveProfile({ ...profile, profile_image: imageUrl })}
            />
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6 border-2 border-black">
            <div className="mb-3 sm:mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => saveProfile({ ...profile, name: e.target.value })}
                placeholder="Your full name"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-black focus:border-black text-sm sm:text-base"
              />
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
              <textarea
                value={profile.bio || ""}
                onChange={(e) => saveProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell people about yourself..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-black focus:border-black h-20 sm:h-24 text-sm sm:text-base resize-none"
              />
            </div>

            {isSavingProfile && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Saving...</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-black">
            <h3 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Social Links</h3>

            <div className="space-y-2 sm:space-y-3">
              {availableSocials.map((social) => {
                const Icon = SocialIcons[social.key]
                const hasValue = profile[social.key as keyof Profile]

                return (
                  <div key={social.key} className="flex items-center gap-2 sm:gap-3">
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${hasValue ? "text-black" : "text-gray-400"} flex-shrink-0`} />
                    <input
                      type="text"
                      value={(profile[social.key as keyof Profile] as string) || ""}
                      onChange={(e) =>
                        saveProfile({
                          ...profile,
                          [social.key]: e.target.value,
                        })
                      }
                      placeholder={social.placeholder}
                      className="flex-1 px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm sm:text-base"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (view === "qr") {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 flex flex-col items-center justify-center">
        <button
          onClick={() => setView("home")}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>

        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Your QR Code</h2>
          <p className="text-gray-300 text-sm sm:text-base">Let others scan to connect</p>
        </div>

        {/* Visibility Toggles Panel */}
        <div className="w-full max-w-xs sm:max-w-sm mb-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-2 border-black">
            <h3 className="text-lg font-bold text-black mb-4">Choose what to share</h3>
            <div className="space-y-3">
              {availableSocials.map((social) => {
                const hasValue = profile[social.key as keyof Profile]
                if (!hasValue) return null
                
                return (
                  <div key={social.key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{social.label}</span>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibilityToggles[social.key] !== false}
                        onChange={(e) => {
                          const newToggles = { ...visibilityToggles, [social.key]: e.target.checked }
                          setVisibilityToggles(newToggles)
                          // Save visibility preferences
                          saveProfile({ ...profile, social_visibility: newToggles })
                        }}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        visibilityToggles[social.key] !== false ? 'bg-black' : 'bg-gray-300'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          visibilityToggles[social.key] !== false ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs sm:max-w-sm">
        <QRCodeDisplay profile={(() => {
          // Create filtered profile based on visibility toggles
          const filteredProfile = { ...profile }
          
          // Always include required fields
          const requiredFields = ['user_id', 'name']
          
          // Filter out fields that are not visible
          Object.keys(filteredProfile).forEach(key => {
            if (!requiredFields.includes(key) && visibilityToggles[key] === false) {
              delete filteredProfile[key as keyof Profile]
            }
          })
          
          return filteredProfile
        })()} />
        </div>

        {profile.name && (
          <div className="mt-4 sm:mt-6 text-center max-w-sm">
            <div className="text-lg sm:text-2xl font-bold text-white">{profile.name}</div>
            <div className="text-gray-300 text-sm sm:text-base">{profile.bio}</div>
          </div>
        )}
      </div>
    )
  }

  if (view === "scan") {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Scan QR Code</h2>
          <button onClick={() => setView("home")} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-sm sm:max-w-md">
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={(error) => {
              console.error("[v0] Scan error:", error)
              toast.error(error)
            }}
          />
          </div>
        </div>
      </div>
    )
  }

  if (view === "connections") {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-lg sm:max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-black">My Connections</h2>
            <button onClick={() => setView("home")} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {connections.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 text-sm sm:text-base">No connections yet</p>
              <p className="text-gray-500 text-xs sm:text-sm">Scan QR codes to save profiles</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-gray-200">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-2" />
                          <Skeleton className="h-3 sm:h-4 w-full mb-1" />
                          <Skeleton className="h-3 sm:h-4 w-20" />
                        </div>
                        <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                        {[...Array(3)].map((_, j) => (
                          <Skeleton key={j} className="h-6 sm:h-7 w-16 sm:w-20 rounded-full" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-200">
                    <Skeleton className="h-3 sm:h-4 w-12 mb-2" />
                    <Skeleton className="h-16 sm:h-20 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {connections.map((conn) => {
                const isEditingNote = editingNotes[conn.id!] !== undefined
                const currentNotes = isEditingNote ? editingNotes[conn.id!] : conn.notes || ""

                return (
                  <div key={conn.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-black">
                    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-black flex-shrink-0">
                        <AvatarImage
                          src={conn.connection_data.profile_image || undefined}
                          alt={conn.connection_data.name}
                        />
                        <AvatarFallback className="bg-gray-200 text-black font-bold text-xs sm:text-base">
                          {conn.connection_data.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-xl font-bold text-black truncate">{conn.connection_data.name}</h3>
                            <p className="text-gray-700 text-xs sm:text-sm line-clamp-2">{conn.connection_data.bio}</p>
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
                            className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                          {Object.entries(conn.connection_data)
                            .filter(([key]) =>
                              ["instagram", "twitter", "linkedin", "github", "email", "website"].includes(key),
                            )
                            .filter(([_, value]) => value)
                            .map(([key, value]) => {
                              const Icon = SocialIcons[key]
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
                                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-xs sm:text-sm"
                                >
                                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  <span className="font-medium hidden sm:inline">{key}</span>
                                </a>
                              )
                            })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-200">
                      <div className="flex items-start gap-2">
                        <StickyNote className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1 sm:mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Notes</label>
                          <textarea
                            value={currentNotes}
                            onChange={(e) =>
                              setEditingNotes((prev) => ({
                                ...prev,
                                [conn.id!]: e.target.value,
                              }))
                            }
                            placeholder="Add notes about this connection..."
                            className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-xs sm:text-sm resize-none"
                            rows={2}
                          />
                          {isEditingNote && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleSaveNotes(conn.id!)}
                                disabled={savingNotes[conn.id!]}
                                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm disabled:opacity-50"
                              >
                                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
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
                                className="px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm"
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
