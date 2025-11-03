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
      <Card className="glass-effect border-2 border-[var(--color-neon-pink)] glow-border">
        <CardHeader className="border-b-2 border-[var(--color-neon-cyan)]">
          <CardTitle className="text-2xl font-display text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-lime)] to-[var(--color-neon-pink)] neon-glow">
            {isSignUp ? "Create Account" : "Sign In"}
          </CardTitle>
          <CardDescription className="text-[var(--color-neon-cyan)]">
            {isSignUp ? "Sign up to start networking with QR codes" : "Sign in to access your profile"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--color-neon-lime)]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-[var(--color-neon-cyan)] glass-effect text-white placeholder:text-gray-400 focus:border-[var(--color-neon-lime)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--color-neon-lime)]">
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
                className="border-2 border-[var(--color-neon-cyan)] glass-effect text-white placeholder:text-gray-400 focus:border-[var(--color-neon-lime)]"
              />
            </div>
            {message && (
              <p
                className={`text-sm ${message.includes("error") || message.includes("Invalid") ? "text-red-400" : "text-[var(--color-neon-lime)]"}`}
              >
                {message}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[var(--color-neon-lime)] to-[var(--color-neon-pink)] text-black hover:shadow-lg hover:shadow-[var(--color-neon-pink)] border-2 border-[var(--color-neon-lime)] font-semibold"
            >
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full border-2 border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)]/10 hover:border-[var(--color-neon-lime)]"
            >
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-center text-xs text-[var(--color-neon-cyan)] font-semibold">DEMO ACCOUNTS</p>
        <div className="grid grid-cols-3 gap-2">
          {demoLogins.map((demo, idx) => (
            <button
              key={idx}
              onClick={() => handleDemoLogin(demo.email, demo.password)}
              disabled={loading}
              className="px-3 py-2 glass-effect border-2 border-[var(--color-neon-orange)] text-[var(--color-neon-orange)] hover:bg-[var(--color-neon-orange)]/20 hover:border-[var(--color-neon-lime)] rounded-lg transition-all text-xs font-semibold disabled:opacity-50"
            >
              Demo {idx + 1}
            </button>
          ))}
        </div>
        <p className="text-center text-[10px] text-gray-500">Quick login for testing</p>
      </div>
    </div>
  )
}
