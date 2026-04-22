# 🎯 Getting Started - The Easy Way

Welcome! Let's get your AI Marketing System running in **3 simple steps**.

## Step 1: Run the Setup Wizard (2 minutes)

```bash
npm run setup
```

This interactive wizard will:
- 🔑 Ask for your Supabase credentials
- 🤖 Ask for your Google Gemini API key
- 📝 Create your `.env.local` file automatically
- ✅ Validate your inputs

**What you'll need:**
1. **Supabase Account** → [Create free account](https://supabase.com)
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - Anon Key (starts with: `eyJhbGciOiJ...`)
   - Service Role Key (starts with: `eyJhbGciOiJ...`)

2. **Google Gemini API Key** → [Get free key](https://ai.google.dev)
   - Just click "Get API Key" and copy it

> 💡 **Tip**: Keep these credentials handy before running the wizard!

---

## Step 2: Set Up Database (5 minutes)

### Quick Method (Copy & Paste):

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to your project → **SQL Editor**
3. Click **New Query**
4. Copy everything from `supabase/migrations/001_initial_schema.sql`
5. Paste into the editor
6. Click **Run** ▶️

**Expected result:** "Success. No rows returned"

### Verify it worked:

```bash
npm run test-db
```

This will check that all 7 tables were created correctly.

---

## Step 3: Launch! (30 seconds)

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### Test the Demo:

1. Enter a business description (e.g., "We provide IoT solutions for manufacturing")
2. Add an industry (e.g., "IoT")
3. Click "Start Analysis"
4. Watch the AI discover and analyze competitors! 🎉

---

## ✅ Success Checklist

You're ready when:

- [x] Environment variables configured (`.env.local` exists)
- [x] Database tables created (7 tables in Supabase)
- [x] Dev server running (`npm run dev`)
- [x] Demo works (competitors discovered)
- [x] Data saved to Supabase (check Table Editor)

---

## 🚀 Next: Deploy to Production

Once local testing works, deploy in minutes:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🆘 Troubleshooting

### Setup wizard not working?
```bash
# Make sure you have Node.js installed
node --version  # Should be v18+

# Run wizard again
npm run setup
```

### Database connection failed?
```bash
# Check your credentials
npm run test-db

# Common fixes:
# 1. Verify Supabase URL is correct
# 2. Check anon key has no spaces
# 3. Make sure migration ran successfully
```

### "Module not found" errors?
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### AI not generating content?
```bash
# Check Gemini API key
# 1. Make sure it's in .env.local
# 2. Verify no typos
# 3. Check you have quota: https://ai.google.dev
```

---

## 📚 Full Documentation

- [README.md](README.md) - Project overview
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Detailed database guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- [QUICKSTART.md](QUICKSTART.md) - Complete checklist

---

## 🎉 You're All Set!

**Time to completion:** ~10 minutes

1. ✅ Run setup wizard
2. ✅ Create database tables  
3. ✅ Test locally
4. 🚀 Deploy to production

**Questions?** Check the troubleshooting section above or review the full documentation.

**Ready to automate your marketing? Let's go! 🚀**
