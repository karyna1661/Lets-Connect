"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"

async function hashWalletAddress(address: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(address.toLowerCase())
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

export async function linkWallet(userId: string, walletAddress: string) {
  try {
    // Validate wallet format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new Error("Invalid wallet address format")
    }

    const supabase = await getSupabaseServerClient()
    const walletHash = await hashWalletAddress(walletAddress)

    // Upsert wallet
    const { error: walletError } = await supabase.from("wallets").upsert(
      {
        user_id: userId,
        wallet_hash: walletHash,
      },
      { onConflict: "user_id" },
    )

    if (walletError) throw walletError

    // Update profile with both wallet_hash AND wallet_address
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
        wallet_hash: walletHash,
        wallet_address: walletAddress  // Save the actual wallet address for POAP API
      })
      .eq("user_id", userId)

    if (profileError) throw profileError

    console.log('[Link Wallet] Successfully linked wallet:', walletAddress)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error linking wallet:", error)
    throw error
  }
}

export async function getWallet(userId: string) {
  try {
    const supabase = await getSupabaseServerClient()

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
    const supabase = await getSupabaseServerClient()

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
