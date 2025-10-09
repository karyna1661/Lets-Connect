# Let's Connect

**Your social life, one scan away** - A Progressive Web App (PWA) for instant networking at events, conferences, and social gatherings.

## 🚀 What is Let's Connect?

Let's Connect is a modern Progressive Web App designed for seamless social networking at events. Instead of fumbling with business cards or typing contact information, users simply scan QR codes to instantly exchange profiles and build meaningful connections.

### 🎯 Perfect for Events & Networking
- **Conferences & Meetups**: Quickly connect with speakers, attendees, and vendors
- **Networking Events**: Exchange contact information without business cards
- **Social Gatherings**: Share social media profiles instantly
- **Professional Events**: Build your professional network efficiently

### 📱 Progressive Web App (PWA)
- **Installable**: Add to home screen on any device (iOS, Android, Desktop)
- **Offline Capable**: Works without internet connection for scanning
- **Fast Loading**: Optimized performance with service worker caching
- **Native Feel**: App-like experience with standalone display mode

## ✨ Key Features

### 🔐 Smart Profile Management
- **Complete Profile Setup**: Name, bio, profile photo, and social links
- **Selective Sharing**: Choose which social platforms to include in your QR code
- **Privacy Controls**: Hide sensitive information while sharing professional details
- **Profile Photos**: Upload and manage profile pictures with cloud storage

### 📊 QR Code System
- **Personalized QR Codes**: Unique codes containing your complete profile
- **Instant Scanning**: Scan others' codes to save their information
- **Visibility Toggles**: Control what information appears in your QR code
- **Real-time Updates**: Changes reflect immediately in your QR code

### 👥 Connection Management
- **Digital Rolodex**: All connections stored securely in the cloud
- **Personal Notes**: Add context and reminders for each connection
- **Search & Filter**: Easily find specific connections
- **Export Options**: Access your network data anytime

### 🌐 Social Media Integration
- **Comprehensive Support**: LinkedIn, Twitter/X, Instagram, GitHub, Facebook, YouTube, Website, Farcaster, Phone/WhatsApp, Email
- **Smart URL Handling**: Automatically formats social media links
- **Platform Recognition**: Icons and labels for each social platform
- **Flexible Input**: Accepts usernames, URLs, or email addresses

## 🛠️ Technical Architecture

### Frontend Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful, consistent icons
- **PWA Features**: Service worker, manifest, offline support

### Backend Infrastructure
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database with Row Level Security
  - Authentication with email/password
  - File storage for profile images
  - Real-time subscriptions
- **QR Code Generation**: qrcode.react library
- **Form Handling**: Server actions with validation

### PWA Configuration
- **Service Worker**: Caching strategy for offline functionality
- **Web App Manifest**: Installation and display settings
- **Responsive Design**: Works on all device sizes
- **Performance Optimization**: Code splitting and lazy loading

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account
- Modern web browser with PWA support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lets-connect.git
   cd lets-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up database**
   - Create a new Supabase project
   - Run the SQL scripts in the `scripts/` directory:
     ```sql
     -- Run in order:
     -- 001-create-tables.sql
     -- 002-fix-rls-policies.sql
     -- 003-create-storage-bucket.sql
     -- 004-add-social-fields.sql
     ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Install as PWA**
   - Open the app in your browser
   - Look for the "Install" button or "Add to Home Screen" option
   - The app will be available offline after installation

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Visit the website
2. Click the install icon in the address bar
3. Confirm installation
4. App appears in your applications list

### Mobile (iOS/Android)
1. Open the website in Safari/Chrome
2. Tap "Share" → "Add to Home Screen"
3. Customize the name and icon
4. Tap "Add" to install

### Offline Usage
- App works offline for scanning QR codes
- Profile data is cached for offline access
- New connections sync when back online

## 🔧 Configuration

### Database Schema
The app uses PostgreSQL with the following main tables:
- `profiles`: User profile information and social links
- `connections`: Saved connections between users
- `storage.objects`: Profile images and files

### Security Features
- Row Level Security (RLS) policies
- User authentication required for all operations
- File upload restrictions and validation
- CORS configuration for secure API access

## 🌟 Recent Updates

### Profile Photo Upload Enhancement
- Fixed storage path issues for reliable uploads
- Automatic redirect to profile setup for new users
- Support for JPG, PNG, GIF up to 5MB
- Improved error handling and user feedback

### Social Media Visibility Controls
- Toggle which social platforms appear in QR codes
- Granular privacy controls
- Saved preferences per user
- Examples: share email but hide WhatsApp

### Expanded Social Media Support
- Added GitHub, Facebook, YouTube, Website, Farcaster, Phone/WhatsApp
- Smart URL formatting and validation
- Platform-specific icons and labels
- Flexible input handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` folder for detailed guides
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions for help and ideas

---

**Built with ❤️ for the networking community**