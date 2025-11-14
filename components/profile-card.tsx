"use client"

import { useState, useEffect } from "react"
import { Save, User, MapPin, Briefcase, Heart, Globe2, Instagram, Linkedin, Github, Mail, Zap, Youtube } from "lucide-react"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"
import { POAPSyncButton } from "@/components/poap-sync-button"
import { FarcasterSyncButton } from "@/components/farcaster-sync-button"
import type { Profile } from "@/lib/types"

interface ProfileCardProps {
  profile: Profile
  userId: string
  onSave: (profile: Profile) => void
  isSaving?: boolean
  poaps?: any[]
  onPoapSync?: () => void
}

const roles = ["Developer", "Designer", "Founder", "Student", "Investor", "Creator", "Other"]

export function ProfileCard({ profile, userId, onSave, isSaving, poaps = [], onPoapSync }: ProfileCardProps) {
  const [editedProfile, setEditedProfile] = useState<Profile>(profile)
  const [hasChanges, setHasChanges] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Update editedProfile when profile prop changes (after save)
  useEffect(() => {
    // Ensure interests is always an array
    const normalizedProfile = {
      ...profile,
      interests: Array.isArray(profile.interests) 
        ? profile.interests 
        : profile.interests 
          ? [profile.interests as any].flat() 
          : []
    }
    setEditedProfile(normalizedProfile)
  }, [profile])

  const handleChange = (updates: Partial<Profile>) => {
    setEditedProfile((prev) => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(editedProfile)
    setHasChanges(false)
  }

  const frontContent = (
    <div
      className="relative w-full bg-white rounded-3xl border-2 border-black h-auto p-6 flex flex-col"
      style={{
        boxShadow: `0 0 0 1px rgba(0,0,0,1), 0 8px 24px rgba(0,0,0,0.1)`
      }}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {editedProfile.profile_image ? (
            <img
              src={editedProfile.profile_image}
              alt={editedProfile.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-black"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center text-white text-2xl font-bold">
              {editedProfile.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-black">{editedProfile.name || "No name set"}</h4>
            {editedProfile.role && <p className="text-sm font-semibold text-black">{editedProfile.role}</p>}
            {editedProfile.city && (
              <p className="text-sm text-black flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {editedProfile.city}
              </p>
            )}
          </div>
        </div>

        {editedProfile.bio && <p className="text-sm text-black leading-relaxed line-clamp-2">{editedProfile.bio}</p>}

        {editedProfile.interests && editedProfile.interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {editedProfile.interests.slice(0, 4).map((interest, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full border border-black"
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {[
            { key: "instagram", icon: Instagram, useIcon: false },
            { key: "x", icon: null, useIcon: true, iconPath: "/x-icon.svg" },
            { key: "linkedin", icon: Linkedin, useIcon: false },
            { key: "github", icon: Github, useIcon: false },
            { key: "email", icon: Mail, useIcon: false },
            { key: "youtube", icon: Youtube, useIcon: false },
          ].map((platform) => {
            const value = editedProfile[platform.key as keyof Profile]
            if (!value) return null
            const Icon = platform.icon
            return (
              <div key={platform.key} className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                {platform.useIcon && platform.iconPath ? (
                  <img src={platform.iconPath} alt={platform.key} className="w-4 h-4" style={{ filter: 'invert(1)' }} />
                ) : Icon ? (
                  <Icon className="w-4 h-4 text-white" />
                ) : null}
              </div>
            )
          })}
        </div>

        {/* Wallet Address Display - Moved above Quick Setup */}
        {editedProfile.wallet_address && (
          <div className="mt-4 pt-4 border-t-2 border-black">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="text-xs font-semibold text-purple-900 mb-1">Wallet Connected</p>
              <p className="text-xs font-mono text-purple-700 truncate">
                {editedProfile.wallet_address.slice(0, 6)}...{editedProfile.wallet_address.slice(-4)}
              </p>
            </div>
          </div>
        )}

        {/* POAPs Display Section */}
        {poaps && poaps.length > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-black">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-black uppercase tracking-wide">POAPs</p>
              <span className="text-xs font-semibold text-black bg-purple-100 px-2 py-1 rounded-full">
                {poaps.length}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {poaps.map((poap, idx) => (
                <div key={idx} className="flex-shrink-0">
                  <img
                    src={poap.image_url}
                    alt={poap.event_name}
                    className="w-full aspect-square rounded-xl object-cover border-2 border-black"
                    title={poap.event_name}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Sync Actions */}
        <div className="space-y-2 mt-4 pt-4 border-t-2 border-black" onClick={(e) => e.stopPropagation()}>
          <p className="text-xs font-bold text-black uppercase tracking-wide mb-3">Quick Setup</p>
          <div onClick={(e) => e.stopPropagation()}>
            <FarcasterSyncButton
              onSyncComplete={(data) => {
                handleChange(data)
              }}
              disabled={isSaving}
              currentFarcaster={editedProfile.farcaster}
              compact
            />
          </div>
          
          {/* POAP Sync Button */}
          {editedProfile.wallet_address && onPoapSync && (
            <div onClick={(e) => e.stopPropagation()}>
              <POAPSyncButton 
                userId={userId} 
                currentWallet={editedProfile.wallet_address}
                onSyncComplete={onPoapSync}
                compact
              />
            </div>
          )}
          
          <p className="text-xs text-gray-600 mt-2 text-center leading-relaxed">Sync from Farcaster to auto-fill your profile</p>
        </div>
      </div>

      {/* Tap to edit button - fixed at bottom of card */}
      <div className="pt-4 flex justify-center cursor-pointer" onClick={() => setIsFullScreen(true)}>
        <div className="bg-white border border-black px-3 py-1.5 rounded-full shadow-lg">
          <span className="text-xs font-semibold text-black">Tap to edit →</span>
        </div>
      </div>
    </div>
  )

  const backContent = (
    <div
      className="w-full rounded-3xl h-full flex flex-col relative overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      style={{
        background: `linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)`,
        minHeight: '600px',  // Ensure minimum height for visibility
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Content area - uses main page scrollbar */}
      <div className="relative z-10 px-6 pt-6 pb-4">
        {/* Form Fields */}
        <div className="space-y-5">
          {/* Profile Photo Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
            <label className="block text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider">Profile Photo</label>
            <ProfilePhotoUpload
              userId={userId}
              currentImageUrl={editedProfile.profile_image}
              userName={editedProfile.name}
              onUploadSuccess={(imageUrl) => {
                handleChange({ profile_image: imageUrl })
              }}
            />
          </div>

          {/* Basic Info Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
            <label className="block text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Basic Information
            </label>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={editedProfile.name || ""}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleChange({ name: e.target.value })
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Enter your full name"
                  className="w-full bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
                <textarea
                  value={editedProfile.bio || ""}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleChange({ bio: e.target.value })
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Tell the DevConnect community about yourself..."
                  rows={3}
                  className="w-full bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    City
                  </label>
                  <input
                    type="text"
                    value={editedProfile.city || ""}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleChange({ city: e.target.value })
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Bangkok"
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    Role
                  </label>
                  <select
                    value={editedProfile.role || "Other"}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleChange({ role: e.target.value })
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role} className="bg-gray-800 text-white">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  Interests
                </label>
                <textarea
                  value={(editedProfile.interests || []).join(", ")}
                  onChange={(e) => {
                    e.stopPropagation()
                    const value = e.target.value
                    handleChange({
                      interests: value
                        .split(/[,.]/)  // Split by comma OR period
                        .map((i) => i.trim())
                        .filter((i) => i),
                    })
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Web3, Ethereum, DeFi, ZK Proofs"
                  rows={2}
                  className="w-full bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1.5">Separate with commas or periods</p>
              </div>
            </div>
          </div>

          {/* Wallet Address Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
            <label className="block text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              Wallet Address
            </label>
            <div className="bg-gray-900/30 rounded-lg px-3 py-2 border border-white/5">
              <p className="text-white text-xs font-mono break-all">
                {editedProfile.wallet_address || "No wallet connected"}
              </p>
              <p className="text-gray-500 text-[10px] mt-1">Auto-imported from Farcaster or wallet connection</p>
            </div>
          </div>

          {/* Social Links & Web3 Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
            <label className="block text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Globe2 className="w-3.5 h-3.5" />
              Social & Web3 Profiles
            </label>
            
            <div className="space-y-2">
              {[
                { key: "farcaster", icon: User, placeholder: "@username", label: "Farcaster", useIcon: false },
                { key: "x", icon: null, placeholder: "@username", label: "X (Twitter)", useIcon: true, iconPath: "/x-icon.svg" },
                { key: "github", icon: Github, placeholder: "username", label: "GitHub", useIcon: false },
                { key: "linkedin", icon: Linkedin, placeholder: "linkedin.com/in/username", label: "LinkedIn", useIcon: false },
                { key: "instagram", icon: Instagram, placeholder: "@username", label: "Instagram", useIcon: false },
                { key: "telegram", icon: null, placeholder: "@username", label: "Telegram", useIcon: true, iconPath: "/telegram-icon.svg" },
                { key: "tiktok", icon: null, placeholder: "@username", label: "TikTok", useIcon: true, iconPath: "/tiktok-icon.svg" },
                { key: "youtube", icon: Youtube, placeholder: "youtube.com/c/yourchannel", label: "YouTube", useIcon: false },
                { key: "email", icon: Mail, placeholder: "you@example.com", label: "Email", useIcon: false },
                { key: "ens", icon: Globe2, placeholder: "yourname.eth", label: "ENS Domain", useIcon: false },
                { key: "zora", icon: null, placeholder: "zora.co/username", label: "Zora", useIcon: true, iconPath: "/zora-icon.svg" },
                { key: "paragraph", icon: Globe2, placeholder: "paragraph.xyz/@username", label: "Paragraph", useIcon: false },
                { key: "substack", icon: Mail, placeholder: "yourname.substack.com", label: "Substack", useIcon: false },
              ].map((social) => {
                const Icon = social.icon
                return (
                  <div key={social.key} className="group">
                    <label className="block text-xs font-medium text-gray-400 mb-1">{social.label}</label>
                    <div className="flex items-center gap-2 bg-gray-900/30 rounded-lg px-3 py-2 border border-white/5 group-hover:border-white/10 transition-all">
                      {social.useIcon && social.iconPath ? (
                        <img src={social.iconPath} alt={social.label} className="w-4 h-4 flex-shrink-0" />
                      ) : Icon ? (
                        <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : null}
                      <input
                        type="text"
                        value={(editedProfile[social.key as keyof Profile] as string) || ""}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleChange({ [social.key]: e.target.value })
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={social.placeholder}
                        className="flex-1 bg-transparent border-none text-white text-xs placeholder:text-gray-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {/* Save Button */}
        <div className="mt-6">
          {hasChanges && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSave()
              }}
              disabled={isSaving}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 ring-2 ring-white/10 hover:ring-white/20 flip-card-button"
            >
              <Save className="w-5 h-5" />
              {isSaving ? "Saving Changes..." : "Save Profile"}
            </button>
          )}
          {!hasChanges && (
            <div className="w-full py-3.5 bg-white/5 border border-white/10 text-gray-400 rounded-2xl font-medium flex items-center justify-center gap-2">
              <span className="text-sm">✓ All changes saved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Show full-screen edit mode when isFullScreen is true
  if (isFullScreen) {
    return (
      <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ 
          width: '100vw', 
          height: '100vh',
          background: `linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)`,
        }}
      >
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          }}
        />

        {/* Content container */}
        <div className="relative z-10 min-h-full flex flex-col">
          {/* Header with close button */}
          <div className="sticky top-0 bg-gradient-to-b from-gray-900 via-gray-900/95 to-transparent px-6 pt-6 pb-4 z-20">
            <div className="flex items-center justify-end">
              <button
                onClick={() => {
                  setIsFullScreen(false)
                  setEditedProfile(profile)
                  setHasChanges(false)
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                aria-label="Close"
              >
                <span className="text-white text-2xl leading-none">&times;</span>
              </button>
            </div>
          </div>

          {/* Scrollable form content */}
          <div className="flex-1 px-6 pb-6">
            <div className="max-w-4xl mx-auto">
              {/* Form Fields - Same content as backContent */}
              <div className="space-y-5">
                {/* Profile Photo Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
                  <label className="block text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider">Profile Photo</label>
                  <ProfilePhotoUpload
                    userId={userId}
                    currentImageUrl={editedProfile.profile_image}
                    userName={editedProfile.name}
                    onUploadSuccess={(imageUrl) => {
                      handleChange({ profile_image: imageUrl })
                    }}
                  />
                </div>

                {/* Basic Info Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
                  <label className="block text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Basic Information
                  </label>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        value={editedProfile.name || ""}
                        onChange={(e) => handleChange({ name: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
                      <textarea
                        value={editedProfile.bio || ""}
                        onChange={(e) => handleChange({ bio: e.target.value })}
                        placeholder="Tell the DevConnect community about yourself..."
                        rows={3}
                        className="w-full bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          City
                        </label>
                        <input
                          type="text"
                          value={editedProfile.city || ""}
                          onChange={(e) => handleChange({ city: e.target.value })}
                          placeholder="Bangkok"
                          className="w-full bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          Role
                        </label>
                        <select
                          value={editedProfile.role || "Other"}
                          onChange={(e) => handleChange({ role: e.target.value })}
                          className="w-full bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                        >
                          {roles.map((role) => (
                            <option key={role} value={role} className="bg-gray-800 text-white">
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        Interests
                      </label>
                      <textarea
                        value={(editedProfile.interests || []).join(", ")}
                        onChange={(e) => {
                          const value = e.target.value
                          handleChange({
                            interests: value
                              .split(",")
                              .map((i) => i.trim())
                              .filter((i) => i),
                          })
                        }}
                        placeholder="Web3, Ethereum, DeFi, ZK Proofs"
                        rows={2}
                        className="w-full bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1.5">Separate with commas</p>
                    </div>
                  </div>
                </div>

                {/* Wallet Address Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
                  <label className="block text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    Wallet Address
                  </label>
                  <div className="bg-gray-900/30 rounded-lg px-3 py-2 border border-white/5">
                    <p className="text-white text-xs font-mono break-all">
                      {editedProfile.wallet_address || "No wallet connected"}
                    </p>
                    <p className="text-gray-500 text-[10px] mt-1">Auto-imported from Farcaster or wallet connection</p>
                  </div>
                </div>

                {/* Social Links & Web3 Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
                  <label className="block text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Globe2 className="w-3.5 h-3.5" />
                    Social & Web3 Profiles
                  </label>
                  
                  <div className="space-y-2">
                    {[
                      { key: "farcaster", icon: User, placeholder: "@username", label: "Farcaster", useIcon: false },
                      { key: "x", icon: null, placeholder: "@username", label: "X (Twitter)", useIcon: true, iconPath: "/x-icon.svg" },
                      { key: "github", icon: Github, placeholder: "username", label: "GitHub", useIcon: false },
                      { key: "linkedin", icon: Linkedin, placeholder: "linkedin.com/in/username", label: "LinkedIn", useIcon: false },
                      { key: "instagram", icon: Instagram, placeholder: "@username", label: "Instagram", useIcon: false },
                      { key: "telegram", icon: null, placeholder: "@username", label: "Telegram", useIcon: true, iconPath: "/telegram-icon.svg" },
                      { key: "tiktok", icon: null, placeholder: "@username", label: "TikTok", useIcon: true, iconPath: "/tiktok-icon.svg" },
                      { key: "youtube", icon: Youtube, placeholder: "youtube.com/c/yourchannel", label: "YouTube", useIcon: false },
                      { key: "email", icon: Mail, placeholder: "you@example.com", label: "Email", useIcon: false },
                      { key: "ens", icon: Globe2, placeholder: "yourname.eth", label: "ENS Domain", useIcon: false },
                      { key: "zora", icon: Zap, placeholder: "zora.co/username", label: "Zora", useIcon: false },
                      { key: "paragraph", icon: Globe2, placeholder: "paragraph.xyz/@username", label: "Paragraph", useIcon: false },
                      { key: "substack", icon: Mail, placeholder: "yourname.substack.com", label: "Substack", useIcon: false },
                    ].map((social) => {
                      const Icon = social.icon
                      return (
                        <div key={social.key} className="group">
                          <label className="block text-xs font-medium text-gray-400 mb-1">{social.label}</label>
                          <div className="flex items-center gap-2 bg-gray-900/30 rounded-lg px-3 py-2 border border-white/5 group-hover:border-white/10 transition-all">
                            {social.useIcon && social.iconPath ? (
                              <img src={social.iconPath} alt={social.label} className="w-4 h-4 flex-shrink-0" />
                            ) : Icon ? (
                              <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            ) : null}
                            <input
                              type="text"
                              value={(editedProfile[social.key as keyof Profile] as string) || ""}
                              onChange={(e) => handleChange({ [social.key]: e.target.value })}
                              placeholder={social.placeholder}
                              className="flex-1 bg-transparent border-none text-white text-xs placeholder:text-gray-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Save Button */}
          <div className="sticky bottom-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent px-6 py-4 z-20">
            <div className="max-w-4xl mx-auto">
              {hasChanges && (
                <button
                  onClick={() => {
                    handleSave()
                    setTimeout(() => setIsFullScreen(false), 500)
                  }}
                  disabled={isSaving}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 ring-2 ring-white/10 hover:ring-white/20"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? "Saving Changes..." : "Save Profile"}
                </button>
              )}
              {!hasChanges && (
                <div className="w-full py-3.5 bg-white/5 border border-white/10 text-gray-400 rounded-2xl font-medium flex items-center justify-center gap-2">
                  <span className="text-sm">✓ All changes saved</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default: show front card only (no flip animation)
  return (
    <div className="w-full">
      {frontContent}
    </div>
  )
}
