"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Profile } from "@/lib/types"

interface AttendeeGridProps {
  attendees: Profile[]
  onSelectAttendee: (profile: Profile) => void
}

export function AttendeeGrid({ attendees, onSelectAttendee }: AttendeeGridProps) {
  if (attendees.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No attendees found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {attendees.map((attendee) => (
        <button
          key={attendee.user_id}
          onClick={() => onSelectAttendee(attendee)}
          className="text-center group cursor-pointer"
        >
          <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-black group-hover:border-gray-600 transition-colors">
            <AvatarImage src={attendee.profile_image || undefined} alt={attendee.name} />
            <AvatarFallback className="text-xl font-bold bg-gray-200">
              {attendee.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?"}
            </AvatarFallback>
          </Avatar>
          <p className="font-bold text-black text-sm line-clamp-1">{attendee.name}</p>
          <p className="text-gray-600 text-xs">{attendee.role || "Attendee"}</p>
        </button>
      ))}
    </div>
  )
}
