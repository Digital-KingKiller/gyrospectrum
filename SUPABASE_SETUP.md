# Supabase Setup Guide

Follow these steps to set up your Supabase database for the GyroSpectrum AI Marketing System.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create a free account
3. Click "New Project"
4. Fill in the details:
   - **Name**: GyroSpectrum Marketing
   - **Database Password**: (choose a strong password - save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start

## Step 2: Get Your API Credentials

1. Once your project is created, go to **Project Settings** (⚙️ icon in sidebar)
2. Click on **API** in the left menu
3. Copy these values:

```
Project URL: https://xxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Create `.env.local` File

In your project root, create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional - Social Media APIs (for future use)
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
INSTAGRAM_ACCESS_TOKEN=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Run Database Migration

### Option A: Using Supabase Dashboard (Recommended)

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)

You should see: **Success. No rows returned**

### Option B: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migration
supabase db push
```

## Step 5: Verify Tables Were Created

1. In Supabase dashboard, click **Table Editor**
2. You should see these 7 tables:
   - ✅ businesses
   - ✅ competitors
   - ✅ content_templates
   - ✅ social_posts
   - ✅ leads
   - ✅ conversations
   - ✅ bookings

## Step 6: Get Google Gemini API Key

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create a new API key
4. Copy it to your `.env.local` file

## Step 7: Test the Connection

```bash
npm run dev
```

1. Open http://localhost:3000
2. Enter a business description
3. Click "Start Analysis"
4. If everything is working:
   - Competitors will be discovered
   - Analysis results will be displayed
   - Data will be saved to your Supabase database

## Step 8: Verify Data in Supabase

1. Go to **Table Editor** → **competitors**
2. You should see the discovered competitors
3. Go to **businesses** table
4. You should see your business entry

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env.local` exists in the root directory
- Verify the URL and keys are correct
- Restart the dev server after adding env variables

### Error: "Failed to analyze competitors"
- Check your Google Gemini API key is valid
- Verify you have API quota remaining
- Check browser console for detailed errors

### Database connection errors
- Verify your Supabase URL is correct
- Check that the anon key has the right permissions
- Make sure the migration ran successfully

## Next Steps

Once your database is set up and working:

1. **Test All Features**
   - Competitor analysis ✅
   - Content generation
   - Sales agent chat

2. **Deploy to Production**
   - See `DEPLOYMENT.md` for Netlify/Vercel instructions

3. **Add Social Media APIs**
   - See Phase 3 in implementation plan

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env.local` to git (it's in .gitignore)
- Never share your `service_role` key publicly
- Use environment variables in production deployments
- Rotate keys if accidentally exposed

## Getting Help

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Review the browser console for errors
3. Check the Next.js terminal output
4. Verify all environment variables are set correctly
