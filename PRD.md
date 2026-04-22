# GyroSpectrum - Product Requirements Document (PRD)

## Executive Summary

**Product:** GyroSpectrum AI Marketing Hub  
**Version:** 1.0  
**Status:** MVP Complete (~90%)  
**Goal:** Autonomous AI-powered marketing platform for content creation, social automation, lead management, and video production.

---

## Product Vision

An all-in-one AI marketing platform that enables businesses to:
1. Generate and schedule social media content across platforms
2. Analyze competitors and market positioning
3. Capture, qualify, and nurture leads automatically
4. Create professional video advertisements with AI
5. Track analytics and optimize marketing performance

---

## Current State (Implemented)

### Core Features ✅

| Feature | Status | Description |
|---------|--------|-------------|
| LinkedIn OAuth | ✅ | Personal profile posting (company pages blocked by permissions) |
| AI Content Generation | ✅ | Groq-powered post creation |
| Scheduled Posts | ✅ | Local queue with cron processing |
| Competitor Scraper | ✅ | Cheerio-based metadata extraction |
| Competitor AI Analysis | ✅ | SWOT, threat level, positioning |
| Lead Capture Webhook | ✅ | Public API for lead ingestion |
| AI Lead Qualification | ✅ | Scoring 0-100, intent classification |
| Auto-Reply System | ✅ | Resend email integration |
| AI Video Studio | ✅ | Generate ads with Remotion + music |
| Video Upload Analysis | ✅ | AI suggestions for improvements |
| Analytics Dashboard | ✅ | Recharts visualizations |
| Bookings Management | ✅ | Calendar and appointment tracking |

### Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **AI:** Groq (Llama 3.3 70B)
- **Video:** Remotion, @remotion/media
- **Email:** Resend
- **Auth:** Supabase Auth + LinkedIn OAuth

---

## Remaining Features (Priority Order)

### P0 - Critical

1. **Production Deployment**
   - Deploy to Netlify/Vercel
   - Environment variables setup
   - Database production instance

2. **Multi-Platform Social Integration**
   - Twitter/X OAuth + Posting
   - Instagram Business API
   - Facebook Pages API
   - TikTok for Business
   - WhatsApp Business API

### P1 - High Priority

3. **Auto-Booking System (Phase 4 of Sales Agent)**
   - Google Calendar API integration
   - Automatic meeting scheduling with qualified leads
   - Confirmation emails

4. **Video Export Pipeline**
   - Server-side Remotion rendering
   - MP4/WebM export to Supabase Storage
   - Download functionality

5. **Multi-Tenant Architecture**
   - Organization management
   - Team member roles
   - Agency white-labeling

### P2 - Medium Priority

6. **AI Voiceover Generation**
   - Text-to-speech integration (ElevenLabs/OpenAI)
   - Sync narration with video scenes

7. **Content Calendar**
   - Visual calendar view
   - Drag-and-drop scheduling
   - Bulk content planning

8. **Email Marketing Suite**
   - Campaign builder
   - Template library
   - A/B testing

### P3 - Nice to Have

9. **Mobile App**
   - React Native companion app
   - Push notifications
   - Quick post creation

10. **AI Chat Assistant**
    - In-app chatbot for marketing advice
    - Strategy recommendations

---

## Technical Requirements

### Performance
- Page load < 2s
- API response < 500ms
- Video preview load < 3s

### Security
- Row Level Security (RLS) on all tables
- API rate limiting
- Input validation (Zod)

### Scalability
- Serverless architecture
- Edge function support
- CDN for static assets

---

## Success Metrics

| Metric | Target |
|--------|--------|
| User Activation Rate | 60% |
| Posts Scheduled/User/Week | 5+ |
| Lead Conversion Rate | 15% |
| Video Generation Success | 95% |
| User Retention (30-day) | 40% |

---

## Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | Week 1 | Production deployment |
| Phase 2 | Week 2-3 | Multi-platform social |
| Phase 3 | Week 4 | Auto-booking + Calendar |
| Phase 4 | Week 5-6 | Video export + Voiceover |
| Phase 5 | Week 7-8 | Multi-tenant + Polish |

---

## Constraints

- LinkedIn Marketing Platform access requires separate application
- Remotion server rendering needs Lambda or dedicated server
- TikTok API requires business verification
- Budget: Minimize external API costs (prefer Groq over OpenAI)

---

## Appendix

### Database Schema (Key Tables)
- `businesses` - Company profiles
- `leads` - Lead capture and scoring
- `competitors` - Competitor analysis
- `content_templates` - Generated content
- `scheduled_posts` - Queue for posting
- `bookings` - Appointments

### API Endpoints
- `/api/ai/generate-post` - Content generation
- `/api/ai/qualify-lead` - Lead scoring
- `/api/video/generate` - Video creation
- `/api/competitors/analyze` - Competitor analysis
- `/api/leads/capture` - Webhook
- `/api/social/linkedin/post` - LinkedIn publishing
