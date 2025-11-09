import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Frame: Join Waitlist (standalone mini app)
// Path: /api/frame/waitlist

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const postUrl = `${origin}/api/frame/waitlist`

  const html = `
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://placehold.co/1200x630?text=Join+Waitlist" />
        <meta property="fc:frame:button:1" content="Join waitlist" />
        <meta property="fc:frame:post_url" content="${postUrl}" />
      </head>
      <body></body>
    </html>`

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const messageBytes = body?.trustedData?.messageBytes
    if (!messageBytes) {
      return NextResponse.json({ error: "Missing frame message" }, { status: 400 })
    }

    // Verify the frame action via Neynar
    const verifyRes = await fetch("https://api.neynar.com/v2/frames/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": process.env.NEYNAR_API_KEY ?? "",
      },
      body: JSON.stringify({ message_bytes_in_hex: messageBytes }),
    })

    if (!verifyRes.ok) {
      return NextResponse.json({ error: "Frame validation failed" }, { status: 400 })
    }

    const verify = await verifyRes.json()
    if (!verify?.valid) {
      return NextResponse.json({ error: "Invalid frame" }, { status: 400 })
    }

    const fid: number | undefined = verify?.action?.interactor?.fid
    const ethAddresses: string[] = verify?.action?.interactor?.verified_addresses?.eth_addresses ?? []
    const custody: string | undefined = verify?.action?.interactor?.custody_address

    if (!fid) {
      return NextResponse.json({ error: "Missing FID" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.error("Missing Supabase env for server insert")
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const allAddresses = Array.from(new Set([...(ethAddresses ?? []), ...(custody ? [custody] : [])]))

    const { error } = await supabase
      .from("waitlist")
      .upsert(
        {
          fid,
          eth_addresses: allAddresses,
          custody_address: custody ?? null,
          joined_at: new Date().toISOString(),
          source: "frame",
        },
        { onConflict: "fid" }
      )

    if (error) {
      console.error("Supabase insert error", error)
      return NextResponse.json({ error: "DB error" }, { status: 500 })
    }

    const origin = req.nextUrl.origin

    const html = `
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://placehold.co/1200x630?text=You're+on+the+waitlist!" />
          <meta property="fc:frame:button:1" content="Share" />
          <meta property="fc:frame:button:1:action" content="link" />
          <meta property="fc:frame:button:1:target" content="${origin}" />
        </head>
        <body></body>
      </html>`

    return new NextResponse(html, { headers: { "Content-Type": "text/html" } })
  } catch (e) {
    console.error("Frame handler error", e)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
