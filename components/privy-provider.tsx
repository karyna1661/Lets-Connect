"use client"

import { PrivyProvider } from '@privy-io/react-auth'

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  
  if (!appId) {
    console.error('[Privy] NEXT_PUBLIC_PRIVY_APP_ID is not set!')
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Configuration Error</h1>
          <p className="text-gray-700">NEXT_PUBLIC_PRIVY_APP_ID is missing from environment variables</p>
        </div>
      </div>
    )
  }
  
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'farcaster', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#000000',
          walletList: ['base_account', 'metamask', 'coinbase_wallet', 'wallet_connect', 'rainbow'],
        },
        supportedChains: [
          {
            id: 8453, // Base
            name: 'Base',
            network: 'base',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: { http: ['https://mainnet.base.org'] },
              public: { http: ['https://mainnet.base.org'] },
            },
            blockExplorers: {
              default: { name: 'BaseScan', url: 'https://basescan.org' },
            },
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  )
}
