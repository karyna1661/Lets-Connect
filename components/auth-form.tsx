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
      const errorMessage = error.message || "An error occurred"
      if (errorMessage.includes("Invalid login credentials")) {
        setMessage("Invalid email or password. Please check your credentials.")
      } else if (errorMessage.includes("User already registered")) {
        setMessage("An account with this email already exists. Please sign in instead.")
      } else if (errorMessage.includes("Password should be at least")) {
        setMessage("Password must be at least 6 characters long.")
      } else if (errorMessage.includes("Invalid email")) {
        setMessage("Please enter a valid email address.")
      } else {
        setMessage(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm sm:max-w-md mx-auto bg-white border-2 border-black">
      <CardHeader className="border-b-2 border-black">
        <CardTitle className="text-xl sm:text-2xl font-bold">{isSignUp ? "Create Account" : "Sign In"}</CardTitle>
        <CardDescription className="text-gray-600 text-sm sm:text-base">
          {isSignUp ? "Sign up to start networking with QR codes" : "Sign in to access your profile"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6">
        <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-2 border-black text-sm sm:text-base"
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="border-2 border-black text-sm sm:text-base"
            />
          </div>
          {message && (
            <p
              className={`text-xs sm:text-sm ${message.includes("error") || message.includes("Invalid") ? "text-red-600" : "text-green-600"}`}
            >
              {message}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black text-sm sm:text-base transition-all duration-200 active:scale-95"
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full border-2 border-black hover:bg-gray-100 text-sm sm:text-base transition-all duration-200"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
