"use client"

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Mail, Globe, Github, MessageCircle } from "lucide-react"

export function PrivyAuthForm() {
  const { ready, authenticated, login, logout, user } = usePrivy()
  const { wallets } = useWallets()

  // Show loading state
  if (!ready) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-white border-2 border-black rounded-3xl shadow-2xl">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-black animate-spin"></div>
              </div>
              <p className="text-black font-bold text-lg">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If authenticated, show user info (this shouldn't normally be visible as the parent handles routing)
  if (authenticated && user) {
    const connectedWallet = wallets[0]
    const walletAddress = connectedWallet?.address
    
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-white border-2 border-black rounded-3xl shadow-2xl">
          <CardHeader className="border-b-2 border-black pb-6">
            <CardTitle className="text-3xl font-bold text-black">
              Welcome Back!
            </CardTitle>
            <CardDescription className="text-black">
              You're signed in
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              {user.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <Mail className="w-5 h-5 text-black" />
                  <span className="text-sm text-black font-medium">{user.email.address}</span>
                </div>
              )}
              
              {user.farcaster && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <MessageCircle className="w-5 h-5 text-black" />
                  <span className="text-sm text-black font-medium">@{user.farcaster.username}</span>
                </div>
              )}
              
              {walletAddress && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <Wallet className="w-5 h-5 text-black" />
                  <span className="text-sm text-black font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={logout}
              className="w-full bg-black text-white hover:bg-black/80 border-2 border-black rounded-xl h-12 font-bold text-base"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show login options
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Card className="bg-white border-2 border-black rounded-3xl shadow-2xl">
        <CardHeader className="border-b-2 border-black pb-6">
          <CardTitle className="text-3xl font-bold text-black">
            Let's Connect
          </CardTitle>
          <CardDescription className="text-black">
            Sign in with your wallet, email, or social account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          {/* Primary Login Button */}
          <Button
            onClick={login}
            className="w-full bg-black text-white hover:bg-black/80 border-2 border-black rounded-xl h-14 font-bold text-base flex items-center justify-center gap-3"
          >
            <Wallet className="w-5 h-5" />
            Connect with Privy
          </Button>

          {/* Info cards about login methods */}
          <div className="pt-4 space-y-3">
            <p className="text-sm text-black font-semibold text-center">Supported login methods:</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <Wallet className="w-4 h-4 text-black" />
                <span className="text-xs text-black font-medium">Web3 Wallets</span>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <MessageCircle className="w-4 h-4 text-black" />
                <span className="text-xs text-black font-medium">Farcaster</span>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <Mail className="w-4 h-4 text-black" />
                <span className="text-xs text-black font-medium">Email</span>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <Globe className="w-4 h-4 text-black" />
                <span className="text-xs text-black font-medium">Social</span>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-2 border-t border-gray-200">
            <p className="text-xs text-center text-gray-600">
              Powered by Privy • Secure wallet-first authentication
            </p>
            <p className="text-xs text-center text-gray-600">
              Your keys, your identity. We never store your private keys.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature highlights */}
      <div className="space-y-2 px-4">
        <div className="flex items-start gap-3 p-4 bg-white border-2 border-black rounded-xl">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">✓</span>
          </div>
          <div>
            <h4 className="font-bold text-black text-sm">Web3-Native</h4>
            <p className="text-xs text-gray-600">Connect with MetaMask, WalletConnect, Coinbase Wallet, and more</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-white border-2 border-black rounded-xl">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">✓</span>
          </div>
          <div>
            <h4 className="font-bold text-black text-sm">Farcaster Integration</h4>
            <p className="text-xs text-gray-600">Sign in with your Farcaster account and bring your social graph</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-white border-2 border-black rounded-xl">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">✓</span>
          </div>
          <div>
            <h4 className="font-bold text-black text-sm">Embedded Wallets</h4>
            <p className="text-xs text-gray-600">Don't have a wallet? We'll create one for you automatically</p>
          </div>
        </div>
      </div>
    </div>
  )
}
