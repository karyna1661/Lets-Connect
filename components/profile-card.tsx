"use client"

import { useState } from "react"
import { Save, User, MapPin, Briefcase, Heart, Globe2, Instagram, Linkedin, Twitter, Github, Mail, Zap, Youtube } from "lucide-react"
import { FlipCard } from "@/components/flip-card-simple"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"
import { POAPSyncButton } from "@/components/poap-sync-button"
import { SocialOAuthConnect } from "@/components/social-oauth-connect"
import type { Profile } from "@/lib/types"

interface ProfileCardProps {
  profile: Profile
  userId: string
  onSave: (profile: Profile) => void
  isSaving?: boolean
}

const roles = ["Developer", "Designer", "Founder", "Student", "Investor", "Creator", "Other"]

export function ProfileCard({ profile, userId, onSave, isSaving }: ProfileCardProps) {
  const [editedProfile, setEditedProfile] = useState<Profile>(profile)
  const [hasChanges, setHasChanges] = useState(false)

  // Update editedProfile when profile prop changes (after save)
  useState(() => {
    setEditedProfile(profile)
  })

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
      className="relative w-full bg-white rounded-3xl border-2 border-black h-full overflow-hidden p-6"
      style={{
        boxShadow: `0 0 0 1px rgba(0,0,0,1), 0 8px 24px rgba(0,0,0,0.1)`
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-black">Your Profile</h3>
          <p className="text-sm text-black">View your info</p>
        </div>
      </div>

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
            { key: "instagram", icon: Instagram },
            { key: "x", icon: Twitter },
            { key: "linkedin", icon: Linkedin },
            { key: "github", icon: Github },
            { key: "email", icon: Mail },
            { key: "youtube", icon: Youtube },
          ].map((platform) => {
            const value = editedProfile[platform.key as keyof Profile]
            if (!value) return null
            const Icon = platform.icon
            return (
              <div key={platform.key} className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <Icon className="w-4 h-4 text-white" />
              </div>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white border border-black px-3 py-1.5 rounded-full">
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
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Scrollable content area - no nested scrollbar */}
      <div className="relative z-10 flex-1 px-6 pt-6 pb-4" style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sticky top-0 bg-gradient-to-b from-gray-900 to-transparent pb-4 -mt-6 pt-6 z-20">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-2 ring-white/10">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white text-lg font-bold tracking-tight">Edit Profile</h3>
          </div>
        </div>

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
                <input
                  type="text"
                  value={(editedProfile.interests || []).join(", ")}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleChange({
                      interests: e.target.value
                        .split(",")
                        .map((i) => i.trim())
                        .filter((i) => i),
                    })
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Web3, Ethereum, DeFi, ZK Proofs"
                  className="w-full bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1.5">Separate with commas</p>
              </div>
            </div>
          </div>

          {/* Social Links & Web3 Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
            <label className="block text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Globe2 className="w-3.5 h-3.5" />
              Social & Web3 Profiles
            </label>
            
            <div className="space-y-4">
              {/* OAuth-enabled platforms */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-purple-300 mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Verified OAuth Connections
                </p>
                
                <div className="grid grid-cols-1 gap-2">
                  <SocialOAuthConnect
                    platform="x"
                    currentValue={editedProfile.x}
                    onConnect={(username) => handleChange({ x: username })}
                    disabled={isSaving}
                  />

                  <SocialOAuthConnect
                    platform="github"
                    currentValue={editedProfile.github}
                    onConnect={(username) => handleChange({ github: username })}
                    disabled={isSaving}
                  />

                  <SocialOAuthConnect
                    platform="linkedin"
                    currentValue={editedProfile.linkedin}
                    onConnect={(username) => handleChange({ linkedin: username })}
                    disabled={isSaving}
                  />

                  <SocialOAuthConnect
                    platform="instagram"
                    currentValue={editedProfile.instagram}
                    onConnect={(username) => handleChange({ instagram: username })}
                    disabled={isSaving}
                  />

                  <SocialOAuthConnect
                    platform="tiktok"
                    currentValue={editedProfile.tiktok}
                    onConnect={(username) => handleChange({ tiktok: username })}
                    disabled={isSaving}
                  />

                  <SocialOAuthConnect
                    platform="telegram"
                    currentValue={editedProfile.telegram}
                    onConnect={(username) => handleChange({ telegram: username })}
                    disabled={isSaving}
                  />

                  <SocialOAuthConnect
                    platform="farcaster"
                    currentValue={editedProfile.farcaster}
                    onConnect={(username) => handleChange({ farcaster: username })}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Manual entry platforms */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs font-medium text-gray-300 mb-3">Manual Entry</p>
                <div className="space-y-2">
                  {[
                    { key: "youtube", icon: Youtube, placeholder: "youtube.com/c/yourchannel", label: "YouTube" },
                    { key: "email", icon: Mail, placeholder: "you@example.com", label: "Email" },
                    { key: "ens", icon: Globe2, placeholder: "yourname.eth", label: "ENS Domain" },
                    { key: "zora", icon: Zap, placeholder: "zora.co/username", label: "Zora" },
                    { key: "paragraph", icon: Globe2, placeholder: "paragraph.xyz/@username", label: "Paragraph" },
                    { key: "substack", icon: Mail, placeholder: "yourname.substack.com", label: "Substack" },
                  ].map((social) => {
                    const Icon = social.icon
                    return (
                      <div key={social.key} className="group">
                        <label className="block text-xs font-medium text-gray-400 mb-1">{social.label}</label>
                        <div className="flex items-center gap-2 bg-gray-900/30 rounded-lg px-3 py-2 border border-white/5 group-hover:border-white/10 transition-all">
                          <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="relative z-20 px-6 py-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent">
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
  )

  return (
    <div className="w-full" style={{ height: "600px" }}>
      <FlipCard
        front={frontContent}
        back={backContent}
      />
    </div>
  )
}
