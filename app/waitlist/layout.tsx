export const metadata = {
  title: "Let's Connect Waitlist",
  other: {
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
