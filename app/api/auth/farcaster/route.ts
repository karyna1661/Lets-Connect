import { NextRequest, NextResponse } from "next/server"

const FARCASTER_CLIENT_ID = process.env.FARCASTER_CLIENT_ID
const REDIRECT_URI = (process.env.NEXT_PUBLIC_APP_URL || "https://connectwithme-app.vercel.app") + "/api/auth/farcaster/callback"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    // Farcaster Sign In With Farcaster (SIWF)
    const authUrl = `https://warpcast.com/~/signin?client_id=${FARCASTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    
    return NextResponse.redirect(authUrl)
  }

  try {
    // Farcaster returns user data in the callback
    const userData = searchParams.get("username")
    const fid = searchParams.get("fid")

    if (!userData) {
      throw new Error("No user data received")
    }

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Farcaster Connected</title></head>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'farcaster_auth_success', 
              username: '@${userData}',
              accessToken: '${fid}'
            }, '*');
            window.close();
          </script>
          <p>Connected! Closing...</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  } catch (error) {
    console.error("Farcaster auth error:", error)
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'farcaster_auth_error', error: 'Failed' }, '*');
            window.close();
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  }
}
