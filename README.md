# GyroSpectrum - AI Marketing & Sales Automation System

<TRUNCATED - This system does the following: analyzes competitors, generates branded content, posts to social media, and closes sales automatically.

## Quick Start

### 1. Run Setup Wizard

```bash
npm run setup
```

This will guide you through configuring your environment variables.

### 2. Set Up Database

1. Go to [Supabase Dashboard](https://supabase.com)
2. Open SQL Editor
3. Copy & paste contents of `supabase/migrations/001_initial_schema.sql`
4. Click Run

Verify it worked:

```bash
npm run test-db
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Full guide**: See [GETTING_STARTED.md](GETTING_STARTED.md)

## Features

### 🎯 Competitor Analysis
- AI discovers competitors based on business description
- Analyzes websites, social media presence
- Extracts success factors and techniques
- Provides actionable insights

### ✨ Content Generation
- Generates branded content based on competitive insights
- Platform-specific optimization (Facebook, Instagram, LinkedIn, TikTok, WhatsApp)
- Brand voice customization
- Hashtag and CTA generation

### 🤖 AI Sales Agent
- 24/7 lead engagement and qualification
- Intent detection and sentiment analysis
- Automated booking and deal closing
- Multi-turn conversation handling

### 📊 Multi-Platform Posting (Coming Soon)
- Automatic posting to all major social platforms
- Optimal timing and scheduling
- Analytics tracking

## Architecture

```
app/
├── api/
│   ├── analyze/          # Competitor analysis endpoint
│   ├── business/         # Business CRUD
│   ├── generate-content/ # Content generation
│   └── sales-chat/       # AI sales agent chat
├── page.tsx              # Landing page
└── layout.tsx            # Root layout

lib/
├── ai/
│   ├── competitor-analyzer.ts  # AI competitor analysis
│   ├── content-generator.ts    # AI content generation
│   └── sales-agent.ts          # AI sales agent
└── supabase/
    └── client.ts               # Supabase configuration

types/
└── database.ts                 # TypeScript database types

supabase/
└── migrations/
    └── 001_initial_schema.sql  # Database schema
```

## Database Schema

- **businesses** - Business profiles and branding
- **competitors** - Discovered competitors and analysis results
- **content_templates** - AI-generated content
- **social_posts** - Scheduled and published posts
- **leads** - Captured leads from social media
- **conversations** - AI sales agent interactions
- **bookings** - Completed sales/bookings

## Usage

### 1. Analyze Competitors

```typescript
POST /api/analyze
{
  "businessId": "uuid",
  "businessDescription": "We provide IoT solutions...",
  "industry": "IoT"
}
```

### 2. Generate Content

```typescript
POST /api/generate-content
{
  "businessId": "uuid",
  "platform": "instagram",  // or "all"
  "contentType": "text",
  "count": 5
}
```

### 3. AI Sales Chat

```typescript
POST /api/sales-chat
{
  "businessId": "uuid",
  "leadId": "uuid",
  "message": "I'm interested in your services",
  "platform": "instagram"
}
```

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash
- **Web Scraping**: Axios + Cheerio
- **Deployment**: Netlify/Vercel

## Environment Setup

### Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings → API
3. Run the migration file in the SQL Editor

### Google Gemini API

1. Get an API key from [ai.google.dev](https://ai.google.dev)
2. Add to `.env.local`

## Development

```bash
# Run dev server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Next Steps

- [ ] Implement real social media API integrations
- [ ] Add payment gateway (Stripe)
- [ ] Build analytics dashboard
- [ ] Add team collaboration features
- [ ] Implement A/B testing

## License

MIT

## Support

For questions and support, contact us at support@gyrospectrum.com
