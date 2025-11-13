"use client"

import { NavCard } from "@/components/nav-card"
import { Heart } from "lucide-react"

export default function TestCardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-4 relative z-20">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2 truncate">Test Page</h1>
            <p className="text-gray-600 text-sm sm:text-lg">Verify card design works</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr relative z-10" style={{ minHeight: '600px' }}>
          <div className="w-full relative" style={{ minHeight: '280px' }}>
            <NavCard
              icon={Heart}
              title=""
              description=""
              backTitle=""
              backDescription=""
              ctaLabel=""
              onClick={() => {}}
            />
          </div>
          <div className="w-full relative" style={{ minHeight: '280px' }}>
            <NavCard
              icon={Heart}
              title=""
              description=""
              backTitle=""
              backDescription=""
              ctaLabel=""
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
