import { NextRequest, NextResponse } from "next/server"

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const REDIRECT_URI = (process.env.NEXT_PUBLIC_APP_URL || "https://connectwithme-app.vercel.app") + "/api/auth/linkedin/callback"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20profile%20email`
    
    return NextResponse.redirect(authUrl)
  }

  try {
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID!,
        client_secret: LINKEDIN_CLIENT_SECRET!,
      }),
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      throw new Error("Failed to get access token")
    }

    const userResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const userData = await userResponse.json()
    const username = userData.sub || userData.name

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>LinkedIn Connected</title></head>
        <body>
          <script>
            window.opener.postMessage({ type: 'linkedin_auth_success', username: '${username}', accessToken: '${accessToken}' }, '*');
            window.close();
          </script>
          <p>Connected! Closing...</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  } catch (error) {
    console.error("LinkedIn OAuth error:", error)
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'linkedin_auth_error', error: 'Failed' }, '*');
            window.close();
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  }
}
