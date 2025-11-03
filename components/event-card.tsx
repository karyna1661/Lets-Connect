"use client"

import { Calendar, MapPin, Users } from "lucide-react"

interface EventCardProps {
  eventName: string
  eventDate: string
  city?: string
  attendeeCount: number
  imageUrl?: string
  onViewAttendees: () => void
  isPast?: boolean
}

export function EventCard({
  eventName,
  eventDate,
  city,
  attendeeCount,
  imageUrl,
  onViewAttendees,
  isPast,
}: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-black shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {imageUrl && (
        <div className="aspect-video bg-gray-200 overflow-hidden">
          <img src={imageUrl || "/placeholder.svg"} alt={eventName} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-bold text-black mb-3 line-clamp-2">{eventName}</h3>

        <div className="space-y-2 mb-4">
          {city && (
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{city}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {formatDate(eventDate)} {isPast && "(Past)"}
            </span>
          </div>

          {attendeeCount > 0 && (
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {attendeeCount} attendee{attendeeCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onViewAttendees}
          className="w-full px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold"
        >
          View Attendees
        </button>
      </div>
    </div>
  )
}
