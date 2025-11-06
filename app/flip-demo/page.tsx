"use client"

import { FlipCard } from "@/components/flip-card"

export default function FlipCardDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Let's Connect - Flip Card Demo</h1>
          <p className="text-slate-600">Tap any card to reveal more information</p>
        </div>

        {/* Example 1: Contact Card */}
        <FlipCard
          duration={400}
          zDepth="xl"
          glowEffect={true}
          front={
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 h-[280px] flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-white/20 rounded-full mb-4 flex items-center justify-center text-3xl">
                  👋
                </div>
                <h2 className="text-2xl font-bold mb-2">Sarah Chen</h2>
                <p className="text-blue-100">Product Designer</p>
              </div>
              <div className="text-sm text-blue-100 opacity-75">
                Tap to see contact info →
              </div>
            </div>
          }
          back={
            <div className="bg-white p-8 h-[280px] flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Contact Info</h3>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="text-xl">📧</span>
                  <span>sarah.chen@example.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="text-xl">📱</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="text-xl">🔗</span>
                  <span>linkedin.com/in/sarachen</span>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                Tap to flip back ←
              </div>
            </div>
          }
        />

        {/* Example 2: Feature Card */}
        <FlipCard
          duration={350}
          zDepth="lg"
          timingFunction="cubic-bezier(0.34, 1.56, 0.64, 1)"
          front={
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-8 h-[280px] flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-4">✨</div>
                <h2 className="text-2xl font-bold mb-2">Premium Features</h2>
                <p className="text-purple-100">Unlock the full potential</p>
              </div>
              <div className="text-sm text-purple-100 opacity-75">
                Tap to explore →
              </div>
            </div>
          }
          back={
            <div className="bg-white p-8 h-[280px] flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">What's Included</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Priority customer support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Custom integrations</span>
                  </li>
                </ul>
              </div>
              <div className="text-sm text-slate-400">
                Tap to flip back ←
              </div>
            </div>
          }
        />

        {/* Example 3: Event Card */}
        <FlipCard
          duration={400}
          zDepth="xl"
          front={
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-8 h-[280px] flex flex-col justify-between">
              <div>
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">Design Workshop</h2>
                <p className="text-emerald-100">Join us for an interactive session</p>
                <div className="mt-4 text-sm text-emerald-100">
                  December 15, 2024 • 2:00 PM
                </div>
              </div>
              <div className="text-sm text-emerald-100 opacity-75">
                Tap for details →
              </div>
            </div>
          }
          back={
            <div className="bg-white p-8 h-[280px] flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-800 mb-3">Event Details</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Learn the latest design systems and prototyping techniques. Perfect for designers of all levels.
                </p>
                <div className="pt-2 space-y-2 text-sm text-slate-600">
                  <div><strong>Location:</strong> Virtual (Zoom)</div>
                  <div><strong>Duration:</strong> 2 hours</div>
                  <div><strong>Cost:</strong> Free</div>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                Tap to flip back ←
              </div>
            </div>
          }
        />

        {/* Example 4: Profile Card (Tinder-style) */}
        <FlipCard
          duration={400}
          zDepth="xl"
          glowEffect={true}
          front={
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white p-8 h-[320px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 flex items-center justify-center text-4xl border-2 border-white/30">
                  💎
                </div>
                <h2 className="text-3xl font-bold mb-2">Alex Rivera</h2>
                <p className="text-pink-100 font-semibold">Blockchain Developer</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-pink-100">
                  <span>📍</span>
                  <span>San Francisco, CA</span>
                </div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <span className="text-xl">⚡</span>
                  <span className="font-bold">92% Match</span>
                </div>
                <div className="text-sm text-pink-100 opacity-75">
                  Tap to see full profile →
                </div>
              </div>
            </div>
          }
          back={
            <div 
              className="h-[320px] p-8 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)`,
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg">
                    A
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">Alex Rivera</h3>
                    <p className="text-gray-400 text-sm">Blockchain Developer</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {["Web3", "DeFi", "NFTs", "Smart Contracts"].map((interest) => (
                      <span 
                        key={interest}
                        className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">About</p>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    Passionate about building decentralized applications and creating the future of Web3.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl hover:bg-white/20 transition-all font-semibold flip-card-button">
                  ✕ Pass
                </button>
                <button 
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-pink-500 to-rose-600 text-white border border-pink-400/30 rounded-2xl hover:from-pink-600 hover:to-rose-700 transition-all font-semibold flip-card-button"
                  style={{
                    boxShadow: `0 4px 16px rgba(236, 72, 153, 0.4), 0 8px 32px rgba(236, 72, 153, 0.2)`,
                  }}
                >
                  ♥ Like
                </button>
              </div>
            </div>
          }
        />

        {/* Usage Guide */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Component Props</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">front</code>
                <p className="mt-1">React node for front face</p>
              </div>
              <div>
                <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">back</code>
                <p className="mt-1">React node for back face</p>
              </div>
              <div>
                <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">duration</code>
                <p className="mt-1">Animation time (ms) - default: 400</p>
              </div>
              <div>
                <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">timingFunction</code>
                <p className="mt-1">CSS easing - default: spring bounce</p>
              </div>
              <div>
                <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">zDepth</code>
                <p className="mt-1">Shadow depth: sm | md | lg | xl</p>
              </div>
              <div>
                <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">glowEffect</code>
                <p className="mt-1">Mouse-following glow - default: true</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
