"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Loader2, AlertCircle, X } from "lucide-react"
import { usePrivy } from '@privy-io/react-auth'
import { getEvents, getEventAttendees } from "@/app/actions/events"
import { EventCard } from "@/components/event-card"
import { AttendeeGrid } from "@/components/attendee-grid"
import { toast } from "sonner"
import { DevconnectEventCard } from "@/components/devconnect-event-card"
import type { Profile } from "@/lib/types"

export default function EventsPage() {
  const router = useRouter()
  const { ready, authenticated, user: privyUser } = usePrivy()
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [pastEvents, setPastEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [eventAttendees, setEventAttendees] = useState<Profile[]>([])
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")
  const [cities, setCities] = useState<string[]>([])
  const [showUpcoming, setShowUpcoming] = useState(true)

  useEffect(() => {
    if (ready && authenticated && privyUser) {
      loadEvents(privyUser.id)
    }
  }, [ready, authenticated, privyUser])

  const loadEvents = async (userId: string, city?: string) => {
    try {
      setIsLoading(true)

      const [upcoming, past] = await Promise.all([getEvents(city, true), getEvents(city, false)])

      setUpcomingEvents(upcoming)
      setPastEvents(past)

      // Extract unique cities
      const allEvents = [...upcoming, ...past]
      const uniqueCities = [...new Set(allEvents.map((e) => e.city).filter(Boolean))] as string[]
      setCities(uniqueCities)
    } catch (error) {
      console.error("[v0] Error loading events:", error)
      toast.error("Failed to load events")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewAttendees = async (eventId: string) => {
    if (!privyUser) return

    try {
      setIsLoadingAttendees(true)
      setSelectedEventId(eventId)

      const attendees = await getEventAttendees(eventId, privyUser.id)
      setEventAttendees(attendees)
    } catch (error) {
      console.error("[v0] Error loading attendees:", error)
      toast.error("Failed to load attendees")
    } finally {
      setIsLoadingAttendees(false)
    }
  }

  if (!authenticated || !privyUser) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img src="/icon-512.jpg" alt="Loading" className="w-full h-full rounded-full animate-spin" style={{ animationDuration: '2s' }} />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img src="/icon-512.jpg" alt="Loading" className="w-full h-full rounded-full animate-spin" style={{ animationDuration: '2s' }} />
          </div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  if (selectedEventId) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-black">Event Attendees</h1>
            <button
              onClick={() => setSelectedEventId(null)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {isLoadingAttendees ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
          ) : (
            <AttendeeGrid
              attendees={eventAttendees}
              onSelectAttendee={(profile) => {
                // TODO: Show profile detail or connect
                toast.success(`${profile.name} profile`)
              }}
            />
          )}
        </div>
      </div>
    )
  }

  const events = showUpcoming ? upcomingEvents : pastEvents

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-black">Events</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 hover:bg-gray-200 rounded-xl transition-colors font-semibold"
          >
            Home
          </button>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setShowUpcoming(true)}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors border-2 ${
                showUpcoming ? "bg-black text-white border-black" : "bg-white text-black border-black hover:bg-gray-100"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setShowUpcoming(false)}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors border-2 ${
                !showUpcoming
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-gray-100"
              }`}
            >
              Past
            </button>
          </div>

          {cities.length > 0 && (
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value)
                  loadEvents(privyUser.id, e.target.value || undefined)
                }}
                className="w-full px-4 py-3 border-2 border-black rounded-xl appearance-none bg-white cursor-pointer font-semibold"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Always show DEVCONNECT card for upcoming, then other events */}
        {showUpcoming && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
            <div className="w-full relative" style={{ minHeight: '280px' }}>
              <DevconnectEventCard />
            </div>
            
            {events.map((event) => (
              <div key={event.id} className="w-full relative" style={{ minHeight: '280px' }}>
                <EventCard
                  eventName={event.name}
                  eventDate={event.event_date}
                  city={event.city}
                  attendeeCount={event.attendee_count || 0}
                  imageUrl={event.image_url}
                  isPast={!showUpcoming}
                  onViewAttendees={() => handleViewAttendees(event.id)}
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Past events - no DEVCONNECT card */}
        {!showUpcoming && (
          events.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black mb-2">No Events Found</h2>
              <p className="text-gray-600">No past events</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
              {events.map((event) => (
                <div key={event.id} className="w-full relative" style={{ minHeight: '280px' }}>
                  <EventCard
                    eventName={event.name}
                    eventDate={event.event_date}
                    city={event.city}
                    attendeeCount={event.attendee_count || 0}
                    imageUrl={event.image_url}
                    isPast={!showUpcoming}
                    onViewAttendees={() => handleViewAttendees(event.id)}
                  />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
