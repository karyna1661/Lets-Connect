"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const getSupabaseServer = async () => {
  const cookieStore = await cookies()
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

export async function getEvents(city?: string, upcoming = true) {
  try {
    const supabase = await getSupabaseServer()

    let query = supabase.from("events").select("*")

    if (city) {
      query = query.eq("city", city)
    }

    const now = new Date().toISOString()
    if (upcoming) {
      query = query.gte("event_date", now)
    } else {
      query = query.lt("event_date", now)
    }

    const { data, error } = await query.order("event_date", { ascending: !upcoming }).limit(50)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error fetching events:", error)
    throw error
  }
}

export async function getEventAttendees(eventId: string, userId: string) {
  try {
    const supabase = await getSupabaseServer()

    // Find all users who have a POAP for this event
    const { data, error } = await supabase
      .from("poaps")
      .select("user_id, profiles!inner(*)")
      .eq("event_id", eventId)
      .neq("user_id", userId)

    if (error) throw error

    return (data || []).map((item: any) => item.profiles).filter((p: any) => p?.is_discoverable)
  } catch (error) {
    console.error("[v0] Error fetching event attendees:", error)
    throw error
  }
}

export async function getEventDetails(eventId: string) {
  try {
    const supabase = await getSupabaseServer()

    const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("[v0] Error fetching event details:", error)
    throw error
  }
}
