import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Suspense } from "react"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Let's Connect",
  description: "Your social life, one scan away",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Let's Connect",
  },
  icons: {
    icon: "/icon-192.jpg",
    shortcut: "/icon-192.jpg",
    apple: "/icon-192.jpg",
  },
}

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Let's Connect" />
      </head>
      <body>
        <Suspense fallback={null}>{children}</Suspense>
        <Toaster position="top-center" richColors closeButton />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Temporarily disabled during development
              console.log('[v0] Service worker disabled for development');
              // Unregister any existing service workers
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                    console.log('[v0] Unregistered service worker');
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}