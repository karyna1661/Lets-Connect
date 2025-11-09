"use client"

import { useEffect, useState } from "react"
import { FlipCard } from "@/components/flip-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FarcasterSyncButton } from "@/components/farcaster-sync-button"
import { usePrivy } from "@privy-io/react-auth"


export default function WaitlistPage() {
  const { user } = usePrivy()
  const [count, setCount] = useState<number>(0)
  const [friends, setFriends] = useState<Array<{
    fid: number
    profile: {
      username: string
      displayName: string
      pfp?: { url: string }
    } | null
    joined_at: string
  }>>([])

  useEffect(() => {
    // Fetch waitlist count
    fetch("/api/waitlist/count")
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => setCount(0))
  }, [])

  useEffect(() => {
    // Fetch friends who joined the waitlist if Farcaster connected
    const loadFriends = async () => {
      try {
        const username = user?.farcaster?.username
        if (!username) return
        const res = await fetch(`/api/waitlist/friends?username=${encodeURIComponent(username)}`)
        const data = await res.json()
        setFriends((data.friends ?? []).map((f: any) => ({
          fid: f.fid,
          profile: f.profile ? {
            username: f.profile.username,
            displayName: f.profile.displayName,
            pfp: f.profile.pfp,
          } : null,
          joined_at: f.joined_at,
        })))
      } catch (e) {
        console.error("Failed to load friends", e)
        setFriends([])
      }
    }
    loadFriends()
  }, [user?.farcaster?.username])

  const front = (
    <div className="relative w-full bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl border border-gray-200/50 h-full overflow-hidden p-8 flex flex-col items-center justify-center text-center">
      <img src="/icon-192.jpg" alt="Let's Connect" className="w-24 h-24 rounded-2xl border border-black shadow mb-4" />
      <h1 className="text-2xl font-bold text-gray-900">Your social life, one scan away</h1>
      <p className="text-gray-600 mt-1">Be one of the first 100 to unlock the digital handshake.</p>
      <div className="mt-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white shadow">
          <span className="font-semibold">Current waitlist</span>
          <span className="font-bold">{count}</span>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
          <span className="text-xs font-semibold text-gray-600">Tap to continue →</span>
        </div>
      </div>
    </div>
  )

  const back = (
    <div
      className="w-full rounded-3xl h-full p-6 flex flex-col relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-bold">Your social on the waitlist</h2>
        <div className="w-40" onClick={(e) => e.stopPropagation()}>
          <FarcasterSyncButton
            onSyncComplete={() => {}}
          />
        </div>
      </div>


      {friends.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No friends detected yet. Connect Farcaster to see more.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {friends.slice(0, 12).map((f) => (
            <div key={f.fid} className="text-center">
              <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-white/20">
                <AvatarImage src={f.profile?.pfp?.url || undefined} alt={f.profile?.displayName || f.profile?.username || String(f.fid)} />
                <AvatarFallback className="bg-white text-black text-sm font-bold">
                  {(f.profile?.displayName || f.profile?.username || "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <p className="text-white text-xs font-semibold line-clamp-1">{f.profile?.displayName || f.profile?.username || f.fid}</p>
              <p className="text-gray-400 text-[10px]">Joined {new Date(f.joined_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={(e) => {
            e.stopPropagation()
            window.location.href = "/api/frame/waitlist"
          }}
          className="w-full py-3 bg-white text-black rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2 flip-card-button"
        >
          Join waitlist on Farcaster
        </button>
      </div>

      <div className="text-center py-2 mt-3">
        <span className="text-xs font-semibold text-gray-500">Tap card to flip back</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-[70vh] p-6">
      <div className="max-w-md mx-auto" style={{ height: "420px" }}>
        <FlipCard front={front} back={back} />
      </div>
    </div>
  )
}
