"use client"

import { PrivyProvider } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['wallet', 'email', 'farcaster', 'google', 'twitter', 'discord', 'github'],
        appearance: {
          theme: 'light',
          accentColor: '#000000',
          logo: undefined,
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: 1, // Ethereum mainnet
        supportedChains: [
          1, // Ethereum
          8453, // Base
          10, // Optimism
          137, // Polygon
        ],
      }}
      onSuccess={() => {
        router.refresh()
      }}
    >
      {children}
    </PrivyProvider>
  )
}
