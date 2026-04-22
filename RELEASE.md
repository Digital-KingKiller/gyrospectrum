# 🚀 GyroSpectrum AI Marketing System - Release v1.0

**GyroSpectrum** is an enterprise-grade AI marketing dashboard built with Next.js 15, Supabase, and Gemini AI. It automates competitor analysis, content generation, and lead nurturing.

![System Architecture](https://via.placeholder.com/800x400.png?text=GyroSpectrum+Architecture)

---

## 📦 What's Included

### **1. AI Core**
- **Competitor Analyst**: Web scraping + Sentiment Analysis (Gemini Flash).
- **Content Generator**: Multi-format post generation (Text, Image, Video).
- **Video Engine**: React-based video generation (`Remotion`) with animations, music, and voiceover.

### **2. Dashboard (8 Modules)**
- **Overview**: High-level KPIs and activity feed.
- **Business Profile**: Manage brand voice, audience, and products.
- **Competitors**: Track and analyze rivals.
- **Content Library**: Manage and export generated assets.
- **Leads**: CRM with AI scoring and export to CSV.
- **Bookings**: Appointment management.
- **Workflows**: Visual automation builder for marketing pipelines.
- **Analytics**: Detailed performance charts.

### **3. Infrastructure**
- **Frontend**: Next.js 15 (App Router), TailwindCSS, Lucide Icons.
- **Backend**: Supabase (Postgres, Auth, Storage).
- **Auth**: Secure Login/Signup with Email logic via `@supabase/ssr`.
- **Email**: Transactional emails via Resend.

---

## 🛠️ Installation & Setup

### **1. Clone & Install**
```bash
git clone https://github.com/your-repo/gyrospectrum.git
cd gyrospectrum
npm install
```

### **2. Environment Variables**
Create a `.env.local` file in the root:

```env
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini (AI Intelligence)
# Get key here: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your-gemini-key

# Resend (Email Automation)
# Get key here: https://resend.com
RESEND_API_KEY=re_123456789

# Optional: OpenAI (For DALL-E Image Generation)
# OPENAI_API_KEY=sk-...
```

### **3. Database Setup (Supabase)**
1. Create a new project on [Supabase.com](https://supabase.com).
2. Go to the SQL Editor and run the migration script located at `supabase/migrations/001_initial_schema.sql`.
3. Enable "Email Provider" in Authentication -> Providers.

### **4. Run Locally**
```bash
npm run dev
```
Visit `http://localhost:3000`.

---

## ☁️ Deployment (Vercel)

This project is optimized for Vercel.

1. **Push to GitHub**: Commit all changes and push to a new repo.
2. **Import to Vercel**: 
   - Go to [Vercel Dashboard](https://vercel.com).
   - Click "Add New Project" -> "Import" your repo.
3. **Configure Envrionment Variables**: 
   - Copy all variables from `.env.local` into the Vercel Project Settings.
4. **Deploy**:
   - Click "Deploy".
   - Your system will be live at `https://your-project.vercel.app`.

---

## 🔐 Admin & Security

- **Initial Access**: The first user you create via Signup will be a standard user.
- **RLS Policies**: Row Level Security is enabled by default. Users can only see their own data.
- **Middleware**: All `/dashboard/*` routes are protected. Unauthenticated users are redirected to `/login`.

---

## 💬 Support & Extension

- **Add New Workflow**: Edit `app/dashboard/workflows/page.tsx` to add new visual nodes.
- **Customize Video**: Edit `app/remotion/SlideshowComposition.tsx` to change animations/branding.
- **Change AI Model**: Update `lib/ai/gemini-client.ts` to switch to Gemini Pro/Ultra.

---
*Built with ❤️ by GyroSpectrum Engineering Team*
