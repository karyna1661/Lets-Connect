"use client"

import { PrivyProvider } from '@privy-io/react-auth'

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['wallet', 'email', 'farcaster', 'google', 'twitter', 'discord', 'github'],
        appearance: {
          theme: 'light',
          accentColor: '#000000',
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}
