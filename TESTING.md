# GyroSpectrum - Development & Testing Guide

## Quick Test Commands

```bash
# Setup & Configuration
npm run setup          # Interactive setup wizard
npm run test-db        # Test database connection

# Development
npm run dev            # Start dev server
npm run type-check     # Check TypeScript

# Testing
npm run seed           # Add sample data for testing
curl http://localhost:3000/api/health  # Check system health
```

---

## Testing the System

### 1. Health Check

Once your dev server is running, check system health:

```bash
# Terminal
curl http://localhost:3000/api/health

# Or visit in browser
http://localhost:3000/api/health
```

**What it checks:**
- ✅ Environment variables
- ✅ Database connection
- ✅ All 7 tables exist
- ✅ AI service (Gemini)

**Expected response:**
```json
{
  "timestamp": "2026-01-24T...",
  "status": "healthy",
  "checks": {
    "environment": { "status": "ok" },
    "database": { "status": "ok" },
    "tables": { "status": "ok", "total": 7, "healthy": 7 },
    "ai": { "status": "ok", "model": "gemini-2.0-flash-exp" }
  }
}
```

---

### 2. Seed Sample Data

Add realistic test data to your database:

```bash
npm run seed
```

**What it creates:**
- 1 Sample business (TechVision IoT Solutions)
- 2 Sample competitors with analysis
- 2 Content templates (LinkedIn & Instagram)
- 1 Sample lead with conversation history

**Use this to:**
- Test the UI without entering data manually
- Verify all database tables work
- See what the system looks like with real data

---

### 3. Test Competitor Analysis

**Manual Test:**

1. Visit http://localhost:3000
2. Enter this test description:
   ```
   We build AI-powered chatbots for customer service teams in e-commerce
   ```
3. Industry: `AI & SaaS`
4. Click "Start Analysis"

**Expected:**
- Takes 20-30 seconds (AI + web scraping)
- Discovers 5-10 competitors
- Shows success factors and techniques
- Data saved to `competitors` table in Supabase

**API Test:**

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-id",
    "businessDescription": "We build AI chatbots for e-commerce",
    "industry": "AI"
  }'
```

---

### 4. Test Content Generation

**API Test:**

```bash
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-id",
    "platform": "instagram",
    "contentType": "text",
    "count": 3
  }'
```

**Expected:**
- Returns 3 Instagram-optimized posts
- Each has text, hashtags, CTA
- Content based on competitor insights
- Saves to `content_templates` table

---

### 5. Test AI Sales Agent

**API Test:**

```bash
curl -X POST http://localhost:3000/api/sales-chat \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-id",
    "leadId": "your-lead-id",
    "message": "I need help with my order",
    "platform": "instagram"
  }'
```

**Expected:**
- AI responds naturally
- Detects intent (support, booking, inquiry)
- Analyzes sentiment
- Scores lead quality
- Saves conversation to database

---

## Debugging Tips

### Check Logs

**Browser Console:**
```javascript
// Open dev tools (F12)
// Check console for errors
```

**Server Logs:**
```bash
# Terminal where npm run dev is running
# Shows API errors, database errors, etc.
```

### Common Issues

**"Missing environment variables"**
```bash
# Check .env.local exists
ls -la .env.local

# Restart dev server
# Ctrl+C, then npm run dev
```

**"Database connection failed"**
```bash
# Test connection
npm run test-db

# Check Supabase dashboard is accessible
# Verify URL and keys in .env.local
```

**"AI not generating content"**
```bash
# Check Gemini API key
# Visit https://ai.google.dev
# Verify quota not exceeded
```

**Health check shows errors**
```bash
# Visit http://localhost:3000/api/health
# Look at "checks" object
# Fix the specific failing component
```

---

## Performance Testing

### Load Testing

Test how many requests the system can handle:

```bash
# Install Apache Bench
# Ubuntu/Debian: sudo apt-get install apache2-utils
# Mac: brew install ab

# Test endpoint
ab -n 100 -c 10 http://localhost:3000/api/health

# 100 requests, 10 concurrent
```

### Database Query Performance

Monitor query times in Supabase dashboard:
1. Go to Database → Query Performance
2. Look for slow queries
3. Add indexes if needed

---

## Testing Checklist

Before deploying to production:

- [ ] Health check returns "healthy"
- [ ] All environment variables set
- [ ] Database migration successful
- [ ] All 7 tables exist and accessible
- [ ] Competitor analysis works
- [ ] Content generation works
- [ ] Sales agent responds correctly
- [ ] Sample data loads successfully
- [ ] No console errors
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)

---

## Continuous Testing

### During Development

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Watch for changes
npm run type-check -- --watch

# Terminal 3: Health checks
watch -n 5 'curl -s http://localhost:3000/api/health | jq'
```

### Pre-Deployment

```bash
# 1. Type check
npm run type-check

# 2. Build
npm run build

# 3. Test health
npm run dev &
sleep 5
curl http://localhost:3000/api/health
```

---

## Integration Tests (Future)

**Playwright tests** (placeholder for future):

```typescript
// tests/competitor-analysis.spec.ts
test('should discover competitors', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.fill('[name="description"]', 'IoT solutions...')
  await page.click('button:has-text("Start Analysis")')
  await expect(page.locator('.competitor-card')).toHaveCount(5, { timeout: 60000 })
})
```

---

## Monitoring in Production

### Health Check Monitoring

Set up uptime monitoring:

1. **UptimeRobot** (free)
   - Add: `https://your-site.com/api/health`
   - Check every 5 minutes
   - Alert on non-200 status

2. **Better Uptime**
   - Monitor response time
   - Check specific JSON keys
   - Slack/email alerts

### Error Tracking

Add Sentry for production errors:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Need Help?

**Health check failing?**
→ Check each component in the response

**Database errors?**
→ Run `npm run test-db` for details

**AI not working?**
→ Verify Gemini API key and quota

**Performance issues?**
→ Check Supabase dashboard for slow queries

---

**Happy Testing! 🧪**
