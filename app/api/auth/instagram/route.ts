import { NextRequest, NextResponse } from "next/server"

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET
const REDIRECT_URI = (process.env.NEXT_PUBLIC_APP_URL || "https://connectwithme-app.vercel.app") + "/api/auth/instagram/callback"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user_profile&response_type=code`
    
    return NextResponse.redirect(authUrl)
  }

  try {
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_CLIENT_ID!,
        client_secret: INSTAGRAM_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const userId = tokenData.user_id

    if (!accessToken) {
      throw new Error("Failed to get access token")
    }

    const userResponse = await fetch(`https://graph.instagram.com/${userId}?fields=username&access_token=${accessToken}`)
    const userData = await userResponse.json()
    const username = userData.username

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Instagram Connected</title></head>
        <body>
          <script>
            window.opener.postMessage({ type: 'instagram_auth_success', username: '@${username}', accessToken: '${accessToken}' }, '*');
            window.close();
          </script>
          <p>Connected! Closing...</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  } catch (error) {
    console.error("Instagram OAuth error:", error)
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'instagram_auth_error', error: 'Failed' }, '*');
            window.close();
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  }
}
