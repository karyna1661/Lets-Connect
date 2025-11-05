import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  // Telegram Login Widget sends auth data as URL params
  const id = searchParams.get("id")
  const firstName = searchParams.get("first_name")
  const lastName = searchParams.get("last_name")
  const username = searchParams.get("username")
  const photoUrl = searchParams.get("photo_url")
  const authDate = searchParams.get("auth_date")
  const hash = searchParams.get("hash")

  if (!id || !hash) {
    // Return the Telegram Login Widget HTML
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Connect Telegram</title></head>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
          <div style="text-align: center;">
            <h2>Connect your Telegram</h2>
            <script async src="https://telegram.org/js/telegram-widget.js?22" 
                    data-telegram-login="${TELEGRAM_BOT_TOKEN?.split(':')[0]}" 
                    data-size="large" 
                    data-auth-url="${process.env.NEXT_PUBLIC_APP_URL || "https://connectwithme-app.vercel.app"}/api/auth/telegram"
                    data-request-access="write">
            </script>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  }

  try {
    // Verify the authentication
    const checkString = Object.entries({
      id,
      first_name: firstName,
      last_name: lastName,
      username,
      photo_url: photoUrl,
      auth_date: authDate,
    })
      .filter(([_, value]) => value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")

    const secretKey = crypto.createHash("sha256").update(TELEGRAM_BOT_TOKEN!).digest()
    const checkHash = crypto.createHmac("sha256", secretKey as any).update(checkString).digest("hex")

    if (checkHash !== hash) {
      throw new Error("Invalid hash")
    }

    const displayName = username || `${firstName} ${lastName || ""}`.trim()

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Telegram Connected</title></head>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'telegram_auth_success', 
              username: '@${username || displayName}',
              accessToken: '${id}'
            }, '*');
            window.close();
          </script>
          <p>Connected! Closing...</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  } catch (error) {
    console.error("Telegram auth error:", error)
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'telegram_auth_error', error: 'Failed' }, '*');
            window.close();
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  }
}
