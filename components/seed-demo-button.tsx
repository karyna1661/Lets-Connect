"use client"

import { useState } from "react"
import { seedDemoData } from "@/app/actions/demo"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"

export function SeedDemoButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSeedDemo = async () => {
    try {
      setIsLoading(true)
      const result = await seedDemoData(userId)
      toast.success(result.message)
      // Refresh the page to see new data
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error("[v0] Error seeding demo data:", error)
      toast.error("Failed to seed demo data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSeedDemo}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
      title="Load demo profiles to see the full experience"
    >
      <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Loading Demo..." : "Load Demo Data"}
    </button>
  )
}
