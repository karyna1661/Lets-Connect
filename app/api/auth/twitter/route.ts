import { NextRequest, NextResponse } from "next/server"

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET
const REDIRECT_URI = (process.env.NEXT_PUBLIC_APP_URL || "https://connectwithme-app.vercel.app") + "/api/auth/twitter/callback"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    
    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=tweet.read%20users.read&state=${codeVerifier}&code_challenge=${codeChallenge}&code_challenge_method=S256`
    
    return NextResponse.redirect(authUrl)
  }

  try {
    const state = searchParams.get("state") || ""
    
    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
        code_verifier: state,
      }),
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      throw new Error("Failed to get access token")
    }

    const userResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const userData = await userResponse.json()
    const username = userData.data?.username

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>X Connected</title></head>
        <body>
          <script>
            window.opener.postMessage({ type: 'x_auth_success', username: '@${username}', accessToken: '${accessToken}' }, '*');
            window.close();
          </script>
          <p>Connected! Closing...</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  } catch (error) {
    console.error("Twitter OAuth error:", error)
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'x_auth_error', error: 'Failed to connect' }, '*');
            window.close();
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  }
}

function generateCodeVerifier() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString("base64url")
}

async function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Buffer.from(hash).toString("base64url")
}
