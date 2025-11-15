# Let's Connect

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://connectwithme-app.vercel.app)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com)

## 🎯 Overview

**Let's Connect** is a next-generation social networking platform that revolutionizes professional and personal connections through innovative Web3 and traditional technologies. Built for the modern networker, the platform seamlessly blends QR-based instant networking, Tinder-style discovery, POAP-powered compatibility matching, and comprehensive social integration into one beautiful, mobile-first experience.

### The Vision
In a world of fragmented social networks and missed connections, Let's Connect provides a unified platform where professionals can:
- **Connect instantly** at events through QR code scanning
- **Discover compatible connections** through intelligent matching based on shared interests and event attendance
- **Build meaningful networks** by tracking connections with private notes and context
- **Showcase verified identity** through OAuth-linked social profiles and Web3 credentials

### Why Let's Connect?
- 🎴 **Beautiful Flip Card UI** - Every interaction is delightful with 3D flip animations
- ⚡ **Lightning Fast** - Built on Next.js 16 with Turbopack for instant page loads
- 🔐 **Privacy First** - Privy authentication with granular social visibility controls
- 🌐 **Web3 Native** - POAP integration, wallet support, and Farcaster identity
- 📱 **Mobile Optimized** - PWA-ready with offline support for on-the-go networking
- 🎯 **Smart Matching** - Compatibility scores based on shared events and interests

## 🚀 Live Demo

Visit the live application: **[https://connectwithme-app.vercel.app](https://connectwithme-app.vercel.app)**

## ✨ Key Features

### Core Functionality
- **Interactive Flip Cards**: Modern 3D flip card UI with smooth animations for all major features
- **QR Code Networking**: Generate and scan QR codes to instantly share and collect profiles
- **Profile Management**: Comprehensive profile creation with photo upload, bio, interests, and social links
- **Event Discovery**: Browse and connect with attendees at local events
- **Swipe & Match**: Tinder-style discovery with compatibility scoring based on shared interests and POAPs
- **Connection Management**: Save and manage connections with private notes
- **POAP Integration**: Sync your POAP collection to unlock compatibility matching

### Authentication & Social Integration
- **OAuth Support**: Verified connections for X (Twitter), GitHub, LinkedIn, Instagram, TikTok, Telegram, and Farcaster
- **Supabase Authentication**: Email/password login with session management
- **Multi-Platform Linking**: Connect multiple social accounts to your profile

### Advanced Features
- **Offline Support**: Service worker implementation for offline functionality
- **Real-time Updates**: Live data synchronization with Supabase
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Dark Mode**: Elegant dark-themed flip cards for better UX

## 🛠 Tech Stack

### Frontend
- **Next.js 16.0.1** - React framework with App Router and Turbopack
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **React 19.2.0** - Latest React features

### Backend & Services
- **Supabase** - Backend-as-a-Service for authentication, database, and storage
- **PostgreSQL** - Relational database via Supabase
- **Vercel** - Deployment and hosting platform

### Key Libraries
- **qrcode.react** - QR code generation
- **lucide-react** - Modern icon library
- **sonner** - Toast notifications
- **date-fns** - Date manipulation

## 📦 Project Structure

```
├── app/
│   ├── actions/          # Server actions for data operations
│   ├── api/auth/        # OAuth API routes for social platforms
│   ├── discover/        # Swipe & match discovery page
│   ├── events/          # Event browsing and attendee discovery
│   ├── flip-demo/       # Flip card component demo page
│   ├── globals.css      # Global styles and Tailwind directives
│   ├── layout.tsx       # Root layout with providers
│   └── page.tsx         # Home page with navigation cards
│
├── components/
│   ├── ui/              # shadcn/ui components (avatar, button, card, input, label)
│   ├── flip-card.tsx    # Advanced flip card with glow effects
│   ├── flip-card-simple.tsx  # Basic flip card component
│   ├── nav-card.tsx     # Navigation cards for home page
│   ├── profile-card.tsx # Profile editing flip card
│   ├── connection-card.tsx   # Connection management card
│   ├── swipe-card.tsx   # Tinder-style swipe card
│   ├── event-card.tsx   # Event display card
│   ├── match-modal.tsx  # Match notification modal
│   ├── qr-code-display.tsx   # QR code generation
│   ├── qr-scanner.tsx   # QR code scanner
│   ├── auth-form.tsx    # Authentication form
│   ├── social-oauth-connect.tsx  # OAuth integration component
│   ├── profile-photo-upload.tsx  # Photo upload widget
│   └── poap-sync-button.tsx      # POAP wallet sync
│
├── lib/
│   ├── supabase/        # Supabase client and server utilities
│   ├── types.ts         # TypeScript type definitions
│   ├── utils.ts         # Utility functions
│   └── offline-storage.ts  # Offline data management
│
├── scripts/             # Database migration scripts
│   ├── 001-create-tables.sql
│   ├── 002-fix-rls-policies.sql
│   ├── 003-create-storage-bucket.sql
│   ├── 004-v2-schema-upgrade.sql
│   ├── 005-v2-functions.sql
│   └── 006-create-admin-demo-accounts.sql
│
└── public/
    ├── manifest.json    # PWA manifest
    └── sw.js           # Service worker
```

## 🎨 Component Highlights

### Flip Card System
The application features a sophisticated flip card system with two variants:
- **FlipCard**: Advanced component with customizable duration, timing functions, shadow depth, and glow effects
- **FlipCardSimple**: Lightweight version for basic flip functionality

All flip cards feature:
- Smooth 3D rotation animations
- Proper button event handling (buttons don't trigger flips)
- Enhanced visibility with increased card sizes (min 220px height)
- Consistent styling across all components
- Mobile-optimized touch interactions

### Navigation Cards (Home Page)
- **My Profile**: View and edit your complete profile
- **Discover**: Swipe-based matching with compatibility scores
- **Events**: Browse events and find attendees
- **My QR Code**: Display your profile QR code for scanning
- **Scan Code**: Scan others' QR codes to save connections
- **My Connections**: Manage saved contacts with notes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/karyna1661/Lets-Connect.git
cd "Lets Connect"
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OAuth Credentials (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
# ... other OAuth credentials
```

4. Run database migrations:
Execute the SQL scripts in the `scripts/` folder in your Supabase SQL editor in order.

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄 Database Schema

### Core Tables
- **profiles**: User profile information with social links and Web3 identities
- **connections**: Saved connections between users with private notes
- **events**: Event listings with location and attendee tracking
- **event_attendees**: Many-to-many relationship for event attendance
- **swipes**: Swipe history for discovery feature
- **matches**: Mutual likes between users
- **poaps**: User POAP collections for compatibility matching

### Security
- Row Level Security (RLS) enabled on all tables
- User-specific data access controls
- Secure OAuth token handling

## 🔒 Authentication Flow

1. User signs up/logs in via Supabase Auth
2. Profile is automatically created in the database
3. Users can link OAuth accounts for verified social connections
4. QR codes encode user profile data for offline sharing
5. Scanned profiles are saved to connections table

## 📱 PWA Support

The application includes Progressive Web App features:
- Service worker for offline functionality
- Installable on mobile devices
- Optimized caching strategy
- Responsive design for all screen sizes

## 🎯 Key User Flows

### Profile Creation
1. Sign up with email/password
2. Complete profile (name, bio, photo, interests)
3. Connect social accounts via OAuth
4. Sync POAP wallet (optional)

### Networking
1. Display QR code or scan others' codes
2. Save connections with optional notes
3. View saved connections in card grid layout

### Discovery
1. Swipe through profiles at the same event
2. View compatibility scores based on shared interests/POAPs
3. Match when both users like each other
4. Get notified of matches

### Events
1. Browse upcoming events
2. RSVP to attend
3. See who else is attending
4. Connect with attendees

## 🚢 Deployment

The application is deployed on Vercel with automatic deployments from the `main` branch.

### Environment Variables on Vercel
Set the following in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)
- OAuth credentials for enabled platforms

### GitHub OAuth Configuration
- Homepage URL: `https://connectwithme-app.vercel.app`
- Callback URL: `https://connectwithme-app.vercel.app/api/auth/github/callback`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Backend powered by [Supabase](https://supabase.com)

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Let's Connect** - Making professional networking simple, one scan at a time.