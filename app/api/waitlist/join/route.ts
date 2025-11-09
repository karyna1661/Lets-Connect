import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fid, username, displayName, pfpUrl, verifications, custodyAddress } = body

    if (!fid) {
      return NextResponse.json({ error: "Missing FID" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Collect all wallet addresses
    const ethAddresses: string[] = verifications || []
    const allAddresses = Array.from(new Set([...ethAddresses, ...(custodyAddress ? [custodyAddress] : [])]))

    const { error } = await supabase
      .from("waitlist")
      .upsert(
        {
          fid,
          eth_addresses: allAddresses,
          custody_address: custodyAddress ?? null,
          joined_at: new Date().toISOString(),
          source: "miniapp",
        },
        { onConflict: "fid" }
      )

    if (error) {
      console.error("Supabase insert error", error)
      return NextResponse.json({ error: "DB error" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Join handler error", e)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
