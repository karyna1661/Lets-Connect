export const metadata = {
  title: "Let's Connect Waitlist",
  description: "Be one of the first 100 to unlock the digital handshake",
  openGraph: {
    title: "Let's Connect Waitlist",
    description: "Your social life, one scan away",
    images: ["https://connectwithme-app.vercel.app/icon-512.jpg"],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://connectwithme-app.vercel.app/icon-512.jpg",
    "fc:frame:button:1": "🚩 Join Waitlist",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://connectwithme-app.vercel.app/waitlist",
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://connectwithme-app.vercel.app/icon-512.jpg",
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
    })
  }
}

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
