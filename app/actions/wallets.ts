"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import crypto from "crypto"

const getSupabaseServer = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    },
  )
}

function hashWalletAddress(address: string): string {
  return crypto.createHash("sha256").update(address.toLowerCase()).digest("hex")
}

export async function linkWallet(userId: string, walletAddress: string) {
  try {
    // Validate wallet format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new Error("Invalid wallet address format")
    }

    const supabase = getSupabaseServer()
    const walletHash = hashWalletAddress(walletAddress)

    // Upsert wallet
    const { error: walletError } = await supabase.from("wallets").upsert(
      {
        user_id: userId,
        wallet_hash: walletHash,
      },
      { onConflict: "user_id" },
    )

    if (walletError) throw walletError

    // Update profile with wallet hash
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ wallet_hash: walletHash })
      .eq("user_id", userId)

    if (profileError) throw profileError

    return { success: true }
  } catch (error) {
    console.error("[v0] Error linking wallet:", error)
    throw error
  }
}

export async function getWallet(userId: string) {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase.from("wallets").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") throw error
    return data || null
  } catch (error) {
    console.error("[v0] Error fetching wallet:", error)
    throw error
  }
}

export async function removeWallet(userId: string) {
  try {
    const supabase = getSupabaseServer()

    const { error: walletError } = await supabase.from("wallets").delete().eq("user_id", userId)

    if (walletError) throw walletError

    const { error: profileError } = await supabase.from("profiles").update({ wallet_hash: null }).eq("user_id", userId)

    if (profileError) throw profileError

    return { success: true }
  } catch (error) {
    console.error("[v0] Error removing wallet:", error)
    throw error
  }
}
