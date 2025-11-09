import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Let's Connect Waitlist",
  description: "Be one of the first 100 to unlock the digital handshake",
  metadataBase: new URL("https://connectwithme-app.vercel.app"),
  openGraph: {
    title: "Let's Connect Waitlist",
    description: "Your social life, one scan away",
    url: "https://connectwithme-app.vercel.app/waitlist",
    siteName: "Let's Connect",
    images: [{
      url: "/waitlist/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Let's Connect Waitlist",
    }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Let's Connect Waitlist",
    description: "Your social life, one scan away",
    images: ["/waitlist/opengraph-image"],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://connectwithme-app.vercel.app/waitlist/opengraph-image",
    "fc:frame:image:aspect_ratio": "1.91:1",
    "fc:frame:button:1": "🚩 Join Waitlist",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://connectwithme-app.vercel.app/waitlist",
  }
}

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <head>
        <meta property="fc:miniapp" content={JSON.stringify({
          version: "1",
          imageUrl: "https://connectwithme-app.vercel.app/waitlist/opengraph-image",
          button: {
            title: "🚩 Join Waitlist",
            action: {
              type: "launch_frame",
              name: "Let's Connect Waitlist",
              url: "https://connectwithme-app.vercel.app/waitlist",
              splashImageUrl: "https://connectwithme-app.vercel.app/icon-512.jpg",
              splashBackgroundColor: "#FFFFFF"
            }
          }
        })} />
      </head>
      {children}
    </>
  )
}
