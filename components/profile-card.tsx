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
      className="relative w-full bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl border border-gray-200/50 h-full overflow-hidden p-6"
      style={{
        boxShadow: `
          0 0 0 1px rgba(0,0,0,0.04),
          0 8px 24px rgba(0,0,0,0.06),
          0 16px 48px rgba(0,0,0,0.04)
        `,
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Your Profile</h3>
          <p className="text-sm text-gray-600">View your info</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {editedProfile.profile_image ? (
            <img
              src={editedProfile.profile_image}
              alt={editedProfile.name}
              className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-black"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {editedProfile.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-gray-900">{editedProfile.name || "No name set"}</h4>
            {editedProfile.role && <p className="text-sm font-semibold text-gray-700">{editedProfile.role}</p>}
            {editedProfile.city && (
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {editedProfile.city}
              </p>
            )}
          </div>
        </div>

        {editedProfile.bio && <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{editedProfile.bio}</p>}

        {editedProfile.interests && editedProfile.interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {editedProfile.interests.slice(0, 4).map((interest, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-gray-900 text-xs font-semibold rounded-full border border-gray-300"
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
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
          <span className="text-xs font-semibold text-gray-600">Tap to edit →</span>
        </div>
      </div>
    </div>
  )

  const backContent = (
    <div
      className="w-full rounded-3xl h-full p-6 flex flex-col relative overflow-y-auto"
      style={{
        background: `linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white text-lg font-bold">Edit Profile</h3>
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-4">
        <div>
          <ProfilePhotoUpload
            userId={userId}
            currentImageUrl={editedProfile.profile_image}
            userName={editedProfile.name}
            onUploadSuccess={(imageUrl) => {
              handleChange({ profile_image: imageUrl })
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Name</label>
          <input
            type="text"
            value={editedProfile.name || ""}
            onChange={(e) => {
              e.stopPropagation()
              handleChange({ name: e.target.value })
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Your full name"
            className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Bio</label>
          <textarea
            value={editedProfile.bio || ""}
            onChange={(e) => {
              e.stopPropagation()
              handleChange({ bio: e.target.value })
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Tell people about yourself..."
            rows={2}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">City</label>
            <input
              type="text"
              value={editedProfile.city || ""}
              onChange={(e) => {
                e.stopPropagation()
                handleChange({ city: e.target.value })
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Your city"
              className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Role</label>
            <select
              value={editedProfile.role || "Other"}
              onChange={(e) => {
                e.stopPropagation()
                handleChange({ role: e.target.value })
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {roles.map((role) => (
                <option key={role} value={role} className="bg-gray-800">
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Interests (comma separated)</label>
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
            placeholder="e.g. Web3, AI, Design"
            className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>

        <div className="pt-2 border-t border-white/10">
          <label className="block text-xs font-semibold text-gray-400 mb-2">Social Links & Web3</label>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {/* OAuth-enabled platforms */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-300">Connect with OAuth (Verified)</label>
              
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

            {/* Manual entry platforms */}
            <div className="pt-2 border-t border-white/10">
              <label className="block text-xs font-medium text-gray-300 mb-2">Manual Entry (Web3 & Others)</label>
              {[
                { key: "youtube", icon: Youtube, placeholder: "Channel URL", label: "YouTube" },
                { key: "email", icon: Mail, placeholder: "you@example.com", label: "Email" },
                { key: "ens", icon: Globe2, placeholder: "yourname.eth", label: "ENS" },
                { key: "zora", icon: Globe2, placeholder: "zora.co/username", label: "Zora" },
                { key: "paragraph", icon: Globe2, placeholder: "paragraph.xyz/@username", label: "Paragraph" },
                { key: "substack", icon: Mail, placeholder: "yourname.substack.com", label: "Substack" },
              ].map((social) => {
                const Icon = social.icon
                return (
                  <div key={social.key} className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={(editedProfile[social.key as keyof Profile] as string) || ""}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleChange({ [social.key]: e.target.value })
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={`${social.label}: ${social.placeholder}`}
                      className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-white/50"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {hasChanges && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleSave()
          }}
          disabled={isSaving}
          className="w-full py-3 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      )}
    </div>
  )

  return (
    <div className="w-full" style={{ height: "500px" }}>
      <FlipCard
        front={frontContent}
        back={backContent}
      />
    </div>
  )
}
