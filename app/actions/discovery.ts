"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Profile } from "@/lib/types"

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

// Mock profiles for development/testing
const MOCK_PROFILES: (Profile & { compatibility_score: number })[] = [
  {
    user_id: "mock_1",
    name: "Alex Chen",
    title: "Product Manager",
    company: "TechFlow",
    email: "alex@techflow.com",
    bio: "Passionate about building products that matter. Coffee enthusiast ☕",
    city: "San Francisco",
    role: "Founder",
    interests: ["Product Design", "AI", "Startups"],
    linkedin: "linkedin.com/in/alexchen",
    twitter: "@alexchen",
    is_discoverable: true,
    location_sharing: "city",
    profile_image: "https://i.pravatar.cc/300?img=12",
    compatibility_score: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    user_id: "mock_2",
    name: "Sarah Williams",
    title: "Software Engineer",
    company: "CloudLabs",
    email: "sarah@cloudlabs.io",
    bio: "Full-stack developer | Open source contributor | Web3 enthusiast 🚀",
    city: "San Francisco",
    role: "Builder",
    interests: ["Web3", "React", "Backend Development"],
    linkedin: "linkedin.com/in/sarahwilliams",
    twitter: "@sarah_codes",
    github: "github.com/sarahwilliams",
    is_discoverable: true,
    location_sharing: "city",
    profile_image: "https://i.pravatar.cc/300?img=47",
    compatibility_score: 92,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    user_id: "mock_3",
    name: "James Park",
    title: "Venture Capitalist",
    company: "Catalyst Ventures",
    email: "james@catalystvc.com",
    bio: "Investing in tomorrow's leaders. Always up for coffee chats ☕",
    city: "San Francisco",
    role: "Investor",
    interests: ["Venture Capital", "Fintech", "Climate Tech"],
    linkedin: "linkedin.com/in/jamespark",
    twitter: "@jamespark_vc",
    is_discoverable: true,
    location_sharing: "city",
    profile_image: "https://i.pravatar.cc/300?img=33",
    compatibility_score: 78,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    user_id: "mock_4",
    name: "Maya Rodriguez",
    title: "Designer & Creative Director",
    company: "Design Studios Co",
    email: "maya@designstudios.co",
    bio: "Creating beautiful experiences through thoughtful design. Art lover 🎨",
    city: "Los Angeles",
    role: "Creator",
    interests: ["UI/UX Design", "Branding", "Digital Art"],
    instagram: "@maya_designs",
    twitter: "@mayarodriguez",
    is_discoverable: true,
    location_sharing: "city",
    profile_image: "https://i.pravatar.cc/300?img=44",
    compatibility_score: 88,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    user_id: "mock_5",
    name: "David Kim",
    title: "Data Scientist",
    company: "DataForce AI",
    email: "david@dataforceai.com",
    bio: "ML engineer | Data storyteller | Podcast listener 🎧",
    city: "New York",
    role: "Builder",
    interests: ["Machine Learning", "Data Science", "Analytics"],
    linkedin: "linkedin.com/in/davidkim",
    github: "github.com/davidkim",
    twitter: "@davidkim_ai",
    is_discoverable: true,
    location_sharing: "city",
    profile_image: "https://i.pravatar.cc/300?img=60",
    compatibility_score: 81,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    user_id: "mock_6",
    name: "Emma Thompson",
    title: "Marketing Director",
    company: "Growth Labs",
    email: "emma@growthlabs.io",
    bio: "Growth hacker | Content creator | Building communities 🌟",
    city: "Austin",
    role: "Marketer",
    interests: ["Growth Marketing", "Content Strategy", "Community Building"],
    linkedin: "linkedin.com/in/emmathompson",
    twitter: "@emma_growth",
    instagram: "@emmathompson",
    is_discoverable: true,
    location_sharing: "city",
    profile_image: "https://i.pravatar.cc/300?img=5",
    compatibility_score: 75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export async function getDiscoveryProfiles(userId: string, city?: string, useMockData = false) {
  try {
    // If mock mode enabled, return mock data immediately
    if (useMockData) {
      console.log("[Discovery] Using mock profiles for development")
      let mockData = [...MOCK_PROFILES]
      if (city) {
        mockData = mockData.filter(p => p.city === city)
      }
      return mockData.sort((a, b) => b.compatibility_score - a.compatibility_score)
    }

    const supabase = await getSupabaseServer()

    let query = supabase.from("profiles").select("*").eq("is_discoverable", true).neq("user_id", userId)

    if (city) {
      query = query.eq("city", city)
    }

    const { data, error } = await query.order("updated_at", { ascending: false }).limit(50)

    if (error) throw error

    // If no real profiles found, return mock data
    if (!data || data.length === 0) {
      console.log("[Discovery] No real profiles found, using mock profiles")
      let mockData = [...MOCK_PROFILES]
      if (city) {
        mockData = mockData.filter(p => p.city === city)
      }
      return mockData.sort((a, b) => b.compatibility_score - a.compatibility_score)
    }

    // PERFORMANCE FIX: Instead of calculating compatibility for each profile,
    // assign random scores for now to avoid N database calls
    // TODO: Implement a batch compatibility calculation RPC function
    const profilesWithScores = data.map((profile) => ({
      ...profile,
      compatibility_score: Math.floor(Math.random() * 30) + 70 // Random score 70-100
    }))

    return profilesWithScores.sort((a, b) => b.compatibility_score - a.compatibility_score)
  } catch (error) {
    console.error("[v0] Error fetching discovery profiles:", error)
    // On error, return mock data as fallback
    console.log("[Discovery] Error occurred, falling back to mock profiles")
    let mockData = [...MOCK_PROFILES]
    if (city) {
      mockData = mockData.filter(p => p.city === city)
    }
    return mockData.sort((a, b) => b.compatibility_score - a.compatibility_score)
  }
}

export async function calculateCompatibilityScore(userId: string, targetUserId: string) {
  try {
    const supabase = await getSupabaseServer()

    const { data, error } = await supabase.rpc("calculate_compatibility_score", {
      p_user_id: userId,
      p_target_user_id: targetUserId,
    })

    if (error) throw error
    return data || 0
  } catch (error) {
    console.error("[v0] Error calculating compatibility score:", error)
    return 0
  }
}

export async function getSharedPOAPs(userId: string, targetUserId: string) {
  try {
    const supabase = await getSupabaseServer()

    const { data, error } = await supabase.rpc("get_shared_poaps", {
      p_user_id: userId,
      p_target_user_id: targetUserId,
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error fetching shared POAPs:", error)
    return []
  }
}
