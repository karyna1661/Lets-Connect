"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage("Check your email to confirm your account!")
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        window.location.reload()
      }
    } catch (error: any) {
      setMessage(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const demoLogins = [
    { email: "demo1@test.com", password: "demo123456" },
    { email: "demo2@test.com", password: "demo123456" },
    { email: "demo3@test.com", password: "demo123456" },
  ]

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setLoading(true)
    setMessage("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })
      if (error) throw error
      window.location.reload()
    } catch (error: any) {
      setMessage(error.message || "Demo login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Card className="bg-white border-2 border-black rounded-3xl shadow-2xl">
        <CardHeader className="border-b-2 border-black pb-6">
          <CardTitle className="text-3xl font-bold text-black" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            {isSignUp ? "Create Account" : "Sign In"}
          </CardTitle>
          <CardDescription className="text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
            {isSignUp ? "Sign up to start networking with QR codes" : "Sign in to access your profile"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-black bg-white text-black placeholder:text-black/40 focus:border-black rounded-xl h-12"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-2 border-black bg-white text-black placeholder:text-black/40 focus:border-black rounded-xl h-12"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            {message && (
              <p
                className={`text-sm ${message.includes("error") || message.includes("Invalid") ? "text-black font-bold" : "text-black"}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {message}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white hover:bg-black/80 border-2 border-black rounded-xl h-12 font-bold text-base"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full border-2 border-black text-black hover:bg-black/5 rounded-xl h-12"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-center text-sm text-black font-bold" style={{ fontFamily: 'Satoshi, sans-serif' }}>DEMO ACCOUNTS</p>
        <div className="grid grid-cols-3 gap-2">
          {demoLogins.map((demo, idx) => (
            <button
              key={idx}
              onClick={() => handleDemoLogin(demo.email, demo.password)}
              disabled={loading}
              className="px-3 py-2.5 bg-white border-2 border-black text-black hover:bg-black hover:text-white rounded-xl transition-all text-xs font-semibold disabled:opacity-50"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Demo {idx + 1}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-black" style={{ fontFamily: 'Inter, sans-serif' }}>Quick login for testing</p>
      </div>
    </div>
  )
}
