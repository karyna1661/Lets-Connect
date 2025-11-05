import { NextRequest, NextResponse } from "next/server"

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET
const REDIRECT_URI = (process.env.NEXT_PUBLIC_APP_URL || "https://connectwithme-app.vercel.app") + "/api/auth/tiktok/callback"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    const csrfState = Math.random().toString(36).substring(7)
    const authUrl = `https://www.tiktok.com/v2/auth/authorize?client_key=${TIKTOK_CLIENT_KEY}&scope=user.info.basic&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${csrfState}`
    
    return NextResponse.redirect(authUrl)
  }

  try {
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY!,
        client_secret: TIKTOK_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.data?.access_token

    if (!accessToken) {
      throw new Error("Failed to get access token")
    }

    const userResponse = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const userData = await userResponse.json()
    const username = userData.data?.user?.display_name || userData.data?.user?.open_id

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>TikTok Connected</title></head>
        <body>
          <script>
            window.opener.postMessage({ type: 'tiktok_auth_success', username: '@${username}', accessToken: '${accessToken}' }, '*');
            window.close();
          </script>
          <p>Connected! Closing...</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  } catch (error) {
    console.error("TikTok OAuth error:", error)
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'tiktok_auth_error', error: 'Failed' }, '*');
            window.close();
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  }
}
