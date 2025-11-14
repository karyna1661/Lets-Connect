"use client"

import { useState } from "react"
import { X, Save, StickyNote, Instagram, Linkedin, Twitter, Github, Facebook, Youtube, Globe, Mail } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FlipCard } from "@/components/flip-card"
import type { Connection } from "@/lib/types"

const SocialIcons = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  website: Globe,
  email: Mail,
  farcaster: Globe,
  telegram: Globe,
  tiktok: Globe,
}

const getSocialUrl = (platform: string, username: string) => {
  const urls: Record<string, string> = {
    instagram: `https://instagram.com/${username.replace("@", "")}`,
    twitter: `https://twitter.com/${username.replace("@", "")}`,
    x: `https://twitter.com/${username.replace("@", "")}`,
    linkedin: username.startsWith("http") ? username : `https://linkedin.com/in/${username}`,
    github: username.startsWith("http") ? username : `https://github.com/${username.replace("@", "")}`,
    facebook: username.startsWith("http") ? username : `https://facebook.com/${username}`,
    youtube: username.startsWith("http") ? username : `https://youtube.com/${username}`,
    tiktok: username.startsWith("http") ? username : `https://tiktok.com/@${username.replace("@", "")}`,
    telegram: username.startsWith("http") ? username : `https://t.me/${username.replace("@", "")}`,
    farcaster: username.startsWith("http") ? username : `https://farcaster.xyz/${username.replace("@", "")}`,
    website: username.startsWith("http") ? username : `https://${username}`,
    email: `mailto:${username}`,
  }
  return urls[platform] || username
}

interface ConnectionCardProps {
  connection: Connection
  onDelete: (connectionId: string, connectionName: string) => void
  onSaveNotes: (connectionId: string, notes: string) => void
  isSavingNotes?: boolean
}

export function ConnectionCard({ connection, onDelete, onSaveNotes, isSavingNotes }: ConnectionCardProps) {
  const [notes, setNotes] = useState(connection.notes || "")
  const [hasChanges, setHasChanges] = useState(false)

  const handleNotesChange = (value: string) => {
    setNotes(value)
    setHasChanges(value !== (connection.notes || ""))
  }

  const handleSave = () => {
    onSaveNotes(connection.id!, notes)
    setHasChanges(false)
  }

  const frontContent = (
    <div className="relative w-full bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl border border-gray-200/50 h-full overflow-hidden"
      style={{
        boxShadow: `
          0 0 0 1px rgba(0,0,0,0.04),
          0 8px 24px rgba(0,0,0,0.06),
          0 16px 48px rgba(0,0,0,0.04)
        `,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (confirm(`Remove ${connection.connection_data.name} from connections?`)) {
            onDelete(connection.id!, connection.connection_data.name)
          }
        }}
        className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-red-50 rounded-full shadow-md transition-colors flip-card-button"
      >
        <X className="w-5 h-5 text-gray-600 hover:text-red-600" />
      </button>

      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-20 h-20 border-2 border-gray-200 shadow-md">
            <AvatarImage
              src={connection.connection_data.profile_image || undefined}
              alt={connection.connection_data.name}
            />
            <AvatarFallback className="bg-black text-white text-2xl font-bold">
              {connection.connection_data.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-1">{connection.connection_data.name}</h3>
            {connection.connection_data.role && (
              <p className="text-sm font-semibold text-gray-700 mb-1">{connection.connection_data.role}</p>
            )}
            {connection.connection_data.city && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className="text-xs">📍</span>
                {connection.connection_data.city}
              </p>
            )}
          </div>
        </div>

        {connection.connection_data.bio && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">{connection.connection_data.bio}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(connection.connection_data)
            .filter(([key]) => ["instagram", "twitter", "x", "linkedin", "github", "email", "website", "farcaster"].includes(key))
            .filter(([_, value]) => value)
            .slice(0, 4)
            .map(([key, value]) => {
              const Icon = SocialIcons[key as keyof typeof SocialIcons]
              if (!Icon) return null
              return (
                <a
                  key={key}
                  href={getSocialUrl(key, value as string)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors text-xs font-medium shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="capitalize">{key === "x" ? "X" : key}</span>
                </a>
              )
            })}
        </div>

        <div className="text-xs text-gray-400 flex items-center gap-1">
          <span>Connected {new Date(connection.created_at!).toLocaleDateString()}</span>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
            <span className="text-xs font-semibold text-gray-600">Tap for notes →</span>
          </div>
        </div>
      </div>
    </div>
  )

  const backContent = (
    <div
      className="w-full rounded-3xl h-full p-6 flex flex-col relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Profile Header */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12 border-2 border-white/20">
            <AvatarImage
              src={connection.connection_data.profile_image || undefined}
              alt={connection.connection_data.name}
            />
            <AvatarFallback className="bg-white text-black text-sm font-bold">
              {connection.connection_data.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-white text-lg font-bold tracking-tight">{connection.connection_data.name}</h3>
            {connection.connection_data.role && (
              <p className="text-gray-400 text-xs">{connection.connection_data.role}</p>
            )}
          </div>
        </div>

        {/* Social Links Section */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Connect on Social</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(connection.connection_data)
              .filter(([key]) => ["instagram", "twitter", "x", "linkedin", "github", "email", "farcaster", "telegram", "tiktok", "youtube"].includes(key))
              .filter(([_, value]) => value)
              .map(([key, value]) => {
                const Icon = SocialIcons[key as keyof typeof SocialIcons] || Globe
                return (
                  <a
                    key={key}
                    href={getSocialUrl(key, value as string)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all text-white text-xs font-medium flip-card-button"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="capitalize truncate">{key === "x" ? "X (Twitter)" : key}</span>
                  </a>
                )
              })}
          </div>
        </div>

        {/* Notes Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="w-4 h-4 text-white" />
            <p className="text-xs font-semibold text-white uppercase tracking-wide">Private Notes</p>
          </div>
          
          <textarea
            value={notes}
            onChange={(e) => {
              e.stopPropagation()
              handleNotesChange(e.target.value)
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Add private notes about this connection..."
            className="flex-1 min-h-[80px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent resize-none text-sm"
            style={{
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)",
            }}
          />
        </div>

        {/* Save Button */}
        {hasChanges && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleSave()
            }}
            disabled={isSavingNotes}
            className="w-full mt-3 py-2.5 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg flip-card-button"
          >
            <Save className="w-4 h-4" />
            {isSavingNotes ? "Saving..." : "Save Notes"}
          </button>
        )}

        {!hasChanges && (
          <div className="text-center py-2 mt-3">
            <span className="text-xs font-semibold text-gray-500">Tap card to flip back</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="w-full rounded-3xl overflow-hidden" style={{ height: "400px" }}>
      <FlipCard
        front={frontContent}
        back={backContent}
        duration={500}
        timingFunction="cubic-bezier(0.34, 1.56, 0.64, 1)"
        zDepth="lg"
        glowEffect={true}
      />
    </div>
  )
}
