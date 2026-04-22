# Deployment Guide

Deploy your GyroSpectrum AI Marketing System to production.

## Deployment Options

### Option 1: Netlify (Recommended for Full-Stack)

#### Prerequisites
- Netlify account (free)
- GitHub repository (optional but recommended)

#### Steps

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**
```bash
netlify login
```

3. **Initialize Netlify**
```bash
netlify init
```
- Choose "Create & configure a new site"
- Select your team
- Site name: `gyrospectrum` (or your choice)
- Build command: `npm run build`
- Publish directory: `.next`

4. **Set Environment Variables**
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your_supabase_url"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_anon_key"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your_service_role_key"
netlify env:set GOOGLE_GEMINI_API_KEY "your_gemini_api_key"
netlify env:set NEXT_PUBLIC_APP_URL "https://your-site.netlify.app"
```

5. **Deploy**
```bash
netlify deploy --prod
```

#### Alternative: Deploy from GitHub

1. Push your code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repo
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables in Netlify UI
7. Click "Deploy"

---

### Option 2: Vercel (Optimized for Next.js)

#### Prerequisites
- Vercel account (free)
- GitHub repository (optional)

#### Steps

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```
- Follow the prompts
- Choose project name
- Select build settings (auto-detected for Next.js)

4. **Set Environment Variables**

Go to your project dashboard on [vercel.com](https://vercel.com):
1. Click on your project
2. Go to Settings → Environment Variables
3. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_GEMINI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your vercel.app URL)

5. **Redeploy**
```bash
vercel --prod
```

#### Alternative: Deploy from GitHub

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure project (Next.js auto-detected)
6. Add environment variables
7. Click "Deploy"

---

## Post-Deployment Checklist

### 1. Test Core Functionality
- [ ] Visit your deployed URL
- [ ] Test competitor analysis
- [ ] Test content generation
- [ ] Verify database writes (check Supabase)

### 2. Update Environment Variables
```bash
# Update NEXT_PUBLIC_APP_URL to your production URL
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
# or
NEXT_PUBLIC_APP_URL=https://your-site.vercel.app
```

### 3. Configure Custom Domain (Optional)

#### Netlify
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

#### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records

### 4. Set Up Monitoring

#### Error Tracking
Consider adding:
- [Sentry](https://sentry.io) for error tracking
- Vercel Analytics (built-in)
- Google Analytics

#### Performance Monitoring
- Vercel Speed Insights
- Lighthouse CI
- Web Vitals tracking

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Server-side service key |
| `GOOGLE_GEMINI_API_KEY` | ✅ Yes | Gemini AI API key |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Your production URL |
| Social Media API Keys | ❌ Optional | For Phase 3 integration |

---

## Troubleshooting

### Build Errors

**"Module not found"**
```bash
# Make sure all dependencies are in package.json
npm install
```

**TypeScript errors**
```bash
# Run type check locally first
npm run type-check
```

### Runtime Errors

**"Missing environment variables"**
- Double-check all env vars are set in deployment platform
- Restart/redeploy after adding env vars

**API routes returning 500**
- Check deployment logs
- Verify Supabase credentials are correct
- Test API routes individually

### Performance Issues

**Slow cold starts**
- This is normal for serverless functions
- Consider upgrading to pro plan for faster cold starts

**High API usage**
- Monitor Gemini API usage
- Implement rate limiting
- Add caching for competitor analysis

---

## Continuous Deployment

### Netlify
Automatic deploys on git push:
1. Connect repository in Netlify dashboard
2. Configure branch deploys
3. Enable deploy previews for PRs

### Vercel
Automatic deploys on git push:
1. Connect GitHub repository
2. Configure production branch
3. Preview deployments automatic for all branches

---

## Security Best Practices

1. **API Keys**
   - Never commit `.env.local` to git
   - Use platform environment variables
   - Rotate keys if exposed

2. **Rate Limiting**
   - Implement API rate limits
   - Use Vercel's built-in protection
   - Monitor unusual traffic

3. **Database Security**
   - Enable Row Level Security (RLS) in Supabase
   - Limit service role key usage to server-side only
   - Regular security audits

4. **CORS Configuration**
   - Configure allowed origins
   - Restrict API access to your domain

---

## Scaling Considerations

### Free Tier Limits

**Netlify Free**
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

**Vercel Free**
- 100GB bandwidth/month
- Unlimited deployments
- Serverless function limits

**Supabase Free**
- 500MB database
- 1GB file storage
- 2GB bandwidth

### When to Upgrade

Consider paid plans when:
- Exceeding free tier limits
- Need faster builds/deploys
- Require team collaboration
- Need increased function execution time

---

## Next Steps After Deployment

1. **Set up monitoring and alerts**
2. **Configure custom domain**
3. **Add social media API integrations** (Phase 3)
4. **Implement analytics dashboard**
5. **Add payment processing** (Stripe)
6. **Set up email notifications**

---

## Support

For deployment issues:
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
