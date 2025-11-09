import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { fetchFollowingFids, fetchProfilesByFids } from "@/lib/farcaster-api"

export async function GET(req: NextRequest) {
  const fidParam = req.nextUrl.searchParams.get("fid")
  const fid = fidParam ? parseInt(fidParam, 10) : NaN

  if (!fid || Number.isNaN(fid)) {
    return NextResponse.json({ error: "Missing or invalid fid" }, { status: 400 })
  }

  // 1) Get following fids
  const following = await fetchFollowingFids(fid)
  if (!following.length) {
    return NextResponse.json({ friends: [] })
  }

  // 2) Query waitlist entries for those fids
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  }
  const supabase = createClient(supabaseUrl, serviceKey)

  const { data, error } = await supabase
    .from("waitlist")
    .select("fid, eth_addresses, custody_address, joined_at")
    .in("fid", following)
    .limit(100)

  if (error) {
    return NextResponse.json({ error: "DB error" }, { status: 500 })
  }

  // 3) Fetch profiles for display
  const fids = (data ?? []).map((d: any) => d.fid)
  const profiles = await fetchProfilesByFids(fids)
  const profileMap = new Map<number, any>()
  profiles.forEach((p) => profileMap.set(p.fid, p))

  const friends = (data ?? []).map((d: any) => ({
    fid: d.fid,
    eth_addresses: d.eth_addresses,
    custody_address: d.custody_address,
    joined_at: d.joined_at,
    profile: profileMap.get(d.fid) || null,
  }))

  return NextResponse.json({ friends })
}
