import { NextRequest, NextResponse } from "next/server"

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const REDIRECT_URI = (process.env.NEXT_PUBLIC_APP_URL || "https://connectwithme-app.vercel.app") + "/api/auth/github/callback"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  // If no code, redirect to GitHub OAuth
  if (!code) {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=read:user`
    
    return NextResponse.redirect(githubAuthUrl)
  }

  // If code exists, this is the callback
  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      throw new Error("Failed to get access token")
    }

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    const userData = await userResponse.json()
    const username = userData.login

    // Return HTML that posts message to parent window
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GitHub Connected</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'github_auth_success',
              username: '${username}',
              accessToken: '${accessToken}'
            }, '*');
            window.close();
          </script>
          <p>Connected! This window will close automatically.</p>
        </body>
      </html>
      `,
      {
        headers: { "Content-Type": "text/html" },
      }
    )
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Connection Failed</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'github_auth_error',
              error: 'Failed to connect'
            }, '*');
            window.close();
          </script>
          <p>Connection failed. This window will close automatically.</p>
        </body>
      </html>
      `,
      {
        headers: { "Content-Type": "text/html" },
      }
    )
  }
}
