import { WaitlistFlipCard } from "@/components/waitlist-flip-card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 flex items-center justify-center">
      <div className="w-[300px] h-[400px]">
        <WaitlistFlipCard />
      </div>
    </div>
  )
}
