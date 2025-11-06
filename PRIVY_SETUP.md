# Privy Integration Setup Guide

## Overview
Your app now uses **Privy** for authentication, enabling Web3-native sign-in with wallets, Farcaster, and social accounts.

## Setup Steps

### 1. Get Your Privy App ID

1. Go to [https://dashboard.privy.io](https://dashboard.privy.io)
2. Sign up or log in
3. Create a new app or use an existing one
4. Copy your **App ID** from the dashboard

### 2. Configure Environment Variables

Add your Privy App ID to `.env.local`:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_actual_privy_app_id
```

**Note:** You still need Supabase credentials for the database:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configure Privy Dashboard

In your Privy dashboard ([https://dashboard.privy.io](https://dashboard.privy.io)):

1. **Login Methods**: Enable the methods you want:
   - ✅ Wallet (MetaMask, WalletConnect, Coinbase Wallet, etc.)
   - ✅ Farcaster
   - ✅ Email
   - ✅ Google
   - ✅ Twitter
   - ✅ Discord
   - ✅ GitHub

2. **Allowed Domains**: Add your domains:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

3. **Embedded Wallets**: 
   - Enable "Create wallet for users without one"
   - This gives email/social users an embedded wallet automatically

4. **Chains**: Already configured for:
   - Ethereum (mainnet)
   - Base
   - Optimism
   - Polygon

### 4. Test the Integration

1. Start your dev server:
   ```bash
   pnpm dev
   ```

2. Visit `http://localhost:3000`

3. Click "Connect with Privy" and try:
   - Connecting a wallet (MetaMask, WalletConnect, etc.)
   - Signing in with Farcaster
   - Using email or social login

## What Changed

### Authentication Flow
- **Before**: Supabase email/password only
- **After**: Privy with multiple options:
  - 🔐 Web3 wallets (MetaMask, Coinbase, WalletConnect, etc.)
  - 🎭 Farcaster
  - 📧 Email
  - 🌐 Social (Google, Twitter, GitHub, Discord)

### User Identity
- **User ID**: Now uses Privy user ID (`privyUser.id`)
- **Wallet Access**: Can access connected wallets via `wallets` array
- **Profile Data**: Email, Farcaster username automatically available

### Database
- **Supabase**: Still used for storing profiles, connections, events, etc.
- **Row Level Security**: User IDs now come from Privy instead of Supabase Auth

## Features Enabled

### 1. Wallet-First Authentication
Users can sign in with any Ethereum wallet:
- MetaMask
- WalletConnect (mobile wallets)
- Coinbase Wallet
- Rainbow
- Trust Wallet
- And 100+ more

### 2. Farcaster Integration
Users can sign in with their Farcaster account:
- Brings their Farcaster username
- Can access their Farcaster social graph
- Perfect for Web3 social networking

### 3. Embedded Wallets
Users without wallets get one automatically:
- Email/social users get an embedded wallet
- Wallet is custodied by Privy (secure)
- Users can export private keys later

### 4. Social Login
Traditional social options still available:
- Google
- Twitter
- GitHub
- Discord

## Deployment

### Vercel Environment Variables

Add to your Vercel project settings:
```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Privy Dashboard - Production Domain

Add your production domain to allowed domains:
```
https://connectwithme-app.vercel.app
```

## Troubleshooting

### "Invalid App ID" Error
- Check that `NEXT_PUBLIC_PRIVY_APP_ID` is set correctly
- Verify the App ID in your Privy dashboard
- Restart your dev server after adding env variables

### Wallet Not Connecting
- Check that your domain is in Privy's allowed domains
- Ensure you're on a supported chain
- Try a different browser/wallet

### Farcaster Login Not Working
- Verify Farcaster is enabled in Privy dashboard
- Check that you're using a Farcaster-compatible wallet
- Ensure your Farcaster account is properly linked

## Migration Notes

### Existing Users
- Existing Supabase users will need to re-authenticate with Privy
- Their profiles will remain intact (matched by new Privy user ID)
- Consider building a migration script if needed

### Database Updates
The database structure remains the same, just the `user_id` field now stores Privy IDs instead of Supabase UUIDs.

## Next Steps

1. **Test all login methods** in development
2. **Update Privy dashboard** with production domain
3. **Deploy to production** with environment variables
4. **Monitor Privy analytics** in the dashboard
5. **Customize branding** in Privy settings (logo, colors, etc.)

## Support

- **Privy Docs**: [https://docs.privy.io](https://docs.privy.io)
- **Privy Discord**: [https://discord.gg/privy](https://discord.gg/privy)
- **Dashboard**: [https://dashboard.privy.io](https://dashboard.privy.io)

## Security Notes

- ✅ Private keys never leave the user's wallet
- ✅ Privy uses industry-standard security practices
- ✅ Embedded wallets are encrypted and secure
- ✅ All authentication is client-side verified
- ✅ Supabase RLS still protects database access
