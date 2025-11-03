"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function seedDemoData(userId: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
      },
    },
  })

  const demoProfiles = [
    {
      user_id: "demo_alex_1",
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
      instagram: "@alexchen",
      is_discoverable: true,
      location_sharing: "city",
    },
    {
      user_id: "demo_sarah_1",
      name: "Sarah Williams",
      title: "Software Engineer",
      company: "CloudLabs",
      email: "sarah@cloudlabs.io",
      bio: "Full-stack developer | Open source contributor | Web3 enthusiast",
      city: "San Francisco",
      role: "Builder",
      interests: ["Web3", "React", "Backend Development"],
      linkedin: "linkedin.com/in/sarahwilliams",
      twitter: "@sarah_codes",
      github: "github.com/sarahwilliams",
      is_discoverable: true,
      location_sharing: "city",
    },
    {
      user_id: "demo_james_1",
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
    },
    {
      user_id: "demo_maya_1",
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
      website: "mayarodriguez.design",
      is_discoverable: true,
      location_sharing: "city",
    },
    {
      user_id: "demo_david_1",
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
    },
  ]

  // Seed demo profiles
  for (const profile of demoProfiles) {
    const { error } = await supabase
      .from("profiles")
      .insert([
        {
          user_id: profile.user_id,
          name: profile.name,
          title: profile.title,
          company: profile.company,
          email: profile.email,
          bio: profile.bio,
          city: profile.city,
          role: profile.role,
          interests: profile.interests,
          linkedin: profile.linkedin,
          twitter: profile.twitter,
          instagram: profile.instagram,
          github: profile.github,
          website: profile.website,
          is_discoverable: profile.is_discoverable,
          location_sharing: profile.location_sharing,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error seeding profile:", error)
      continue
    }
  }

  // Seed demo connections for the current user
  const demoConnections = [
    {
      user_id: userId,
      connected_user_id: "demo_alex_1",
      connection_data: demoProfiles[0],
      connection_type: "qr",
      notes: "Met at Product Meetup. Great insights on product-market fit.",
    },
    {
      user_id: userId,
      connected_user_id: "demo_sarah_1",
      connection_data: demoProfiles[1],
      connection_type: "swipe",
      notes: "Matched on discovery! Shared interest in Web3.",
    },
    {
      user_id: userId,
      connected_user_id: "demo_james_1",
      connection_data: demoProfiles[2],
      connection_type: "qr",
      notes: "Interested in discussing our startup idea.",
    },
  ]

  for (const connection of demoConnections) {
    const { error } = await supabase
      .from("connections")
      .insert([
        {
          user_id: connection.user_id,
          connected_user_id: connection.connected_user_id,
          connection_data: connection.connection_data,
          connection_type: connection.connection_type,
          notes: connection.notes,
        },
      ])
      .select()

    if (error && !error.message.includes("duplicate key")) {
      console.error("[v0] Error seeding connection:", error)
    }
  }

  return {
    success: true,
    message: `Seeded ${demoProfiles.length} demo profiles and ${demoConnections.length} demo connections`,
  }
}
