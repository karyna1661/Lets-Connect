import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Let's Connect - Flip Card Demo",
  description: "Your social life, one scan away",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
