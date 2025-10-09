# Environment Setup Guide

## Setting Up Environment Variables

This project requires Supabase environment variables to function properly.

### Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Settings → API
4. Copy your **Project URL** and **anon/public key**

### Step 2: Create .env.local File

1. In the root directory of the project, create a file named `.env.local`
2. **Important**: Ensure the file is saved with **UTF-8 encoding** (not UTF-16)
3. Add your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Restart Development Server

After creating or modifying `.env.local`, you **must** restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm dev
```

## Troubleshooting

### Error: "Your project's URL and Key are required"

This error means Next.js cannot read your environment variables. Common causes:

1. **File Encoding Issue**: The `.env.local` file must be UTF-8 encoded
   - If you see spaces between characters when opening the file in a hex editor, it's UTF-16
   - Delete the file and recreate it with UTF-8 encoding

2. **File Location**: The `.env.local` file must be in the root directory (same level as `package.json`)

3. **Server Not Restarted**: You must restart the dev server after creating/modifying `.env.local`

4. **Typos in Variable Names**: Ensure variables are named exactly:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Extra Spaces or Quotes**: Don't add quotes around values or extra spaces
   - ✅ Correct: `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co`
   - ❌ Wrong: `NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"`
   - ❌ Wrong: `NEXT_PUBLIC_SUPABASE_URL = https://example.supabase.co`

### Verifying Environment Variables

To check if your environment variables are loaded:

1. Start your dev server
2. Check the console output - the middleware will log whether variables are present or missing
3. If missing, follow the troubleshooting steps above

## Security Notes

- Never commit `.env.local` to version control (it's in `.gitignore`)
- The `NEXT_PUBLIC_` prefix makes these variables available in the browser
- The anon key is safe to expose in the browser (it's protected by Row Level Security)
- Never expose your `SERVICE_ROLE_KEY` in the browser or commit it to git
