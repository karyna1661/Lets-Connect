"use client"

import { useEffect, useState } from "react"
import { FlipCard } from "@/components/flip-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FarcasterSyncButton } from "@/components/farcaster-sync-button"
import { usePrivy } from "@privy-io/react-auth"
import { sdk } from "@farcaster/miniapp-sdk"

export const metadata = {
  title: "Let's Connect Waitlist",
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://connectwithme-app.vercel.app/icon-512.jpg",
      button: {
        title: "🚩 Join Waitlist",
        action: {
          type: "launch_frame",
          name: "Let's Connect Waitlist",
          url: "https://connectwithme-app.vercel.app/waitlist",
          splashImageUrl: "https://connectwithme-app.vercel.app/icon-512.jpg",
          splashBackgroundColor: "#FFFFFF"
        }
      }
    })
  }
}


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
    // Signal to Farcaster that the app is ready
    sdk.actions.ready().catch((e) => console.error("SDK ready error:", e))
  }, [])

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
    <div className="relative w-full bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl border-2 border-gray-200 h-full overflow-hidden p-8 flex flex-col items-center justify-center text-center shadow-xl">
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
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border-2 border-gray-700 p-6 flex flex-col shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-xl font-bold mb-2">Friends on the waitlist</h2>
        <p className="text-gray-400 text-sm">See who from your network has joined</p>
      </div>

      {/* Friends Grid or Connect Prompt */}
      <div className="flex-1 overflow-auto mb-6">
        {!user?.farcaster?.username ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-400 text-sm mb-4">Connect Farcaster to see your friends</p>
            <div onClick={(e) => e.stopPropagation()}>
              <FarcasterSyncButton onSyncComplete={() => {}} />
            </div>
          </div>
        ) : friends.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">None of your friends have joined yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {friends.slice(0, 9).map((f) => (
              <div key={f.fid} className="flex flex-col items-center">
                <Avatar className="w-14 h-14 mb-1.5 border-2 border-white/10">
                  <AvatarImage src={f.profile?.pfp?.url} alt={f.profile?.displayName || f.profile?.username || String(f.fid)} />
                  <AvatarFallback className="bg-white text-black text-xs font-bold">
                    {(f.profile?.displayName || f.profile?.username || "?")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-white text-[10px] font-medium line-clamp-1">
                  {f.profile?.displayName || f.profile?.username || f.fid}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          window.location.href = "/api/frame/waitlist"
        }}
        className="w-full py-3 bg-white text-black rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg"
      >
        Join waitlist
      </button>
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
