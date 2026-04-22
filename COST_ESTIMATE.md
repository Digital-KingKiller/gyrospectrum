# 💰 GyroSpectrum Deployment & Operational Costs

This document outlines the estimated monthly costs to run **GyroSpectrum** in a production environment.

## 📉 Summary
| Tier | Estimated Cost | Best For |
| :--- | :--- | :--- |
| **Starter / MVP** | **$0.00 / mo** | Demos, Personal Use, < 500 users |
| **Production** | **~$45.00 / mo** | Commercial Launch, Team of 1, High Reliability |
| **Scale** | **$100+ / mo** | High volume video generation, large team |

---

## 🛠 Cost Breakdown by Service

### 1. Web Hosting (Vercel)
*Next.js Frontend & API Routes*
- **Starter (Free)**: Generous limits. Perfect for launch.
- **Pro ($20/mo/user)**: Required if you demand higher serverless function limits (longer timeouts for AI) or if you are automating commercial deployment pipelines.
- **Recommendation**: Start **Free**. Upgrade to **Pro** if API timeouts occur during heavy AI processing.

### 2. Database & Auth (Supabase)
*PostgreSQL Database, Authentication, Storage*
- **Free**: 500MB Database. **WARNING**: Pauses after 1 week of inactivity.
- **Pro ($25/mo)**: 8GB Database, Daily Backups, No Pausing, Email Support.
- **Recommendation**: **Pro ($25/mo)** is highly recommended for any "live" commercial app to ensure data availability and prevent cold starts.

### 3. AI Intelligence (Google Gemini)
*Competitor Analysis & Content Generation*
- **Gemini 1.5 Flash**: 
    - **Free Tier**: Up to 15 requests/minute (RPM), 1M tokens/minute (TPM).
    - **Paid**: ~$0.35 per 1 million tokens.
- **Gemini 1.5 Pro**:
    - **Paid**: ~$3.50 per 1 million tokens.
- **Recommendation**: **Free / <$5 mo**. The "Flash" model is extremely efficient and likely sufficient for web scraping and text generation tasks.

### 4. Video Engine (Remotion)
*Programmatic Video Generation*
- **Licensing**:
    - **Free**: For individuals and small companies (check Remotion terms for up-to-date revenue limits).
    - **Startup/Company**: may require a license fee if revenue exceeds threshold.
- **Rendering Costs**:
    - **Client-Side (In-Browser)**: **$0**. (Uses your computer's CPU).
    - **Cloud Rendering (Lambda)**: AWS Costs apply (Compute + Storage). Expect **$10-$50/mo** depending on video volume.
- **Recommendation**: **$0** (Client-side rendering) for V1.

### 5. Email Automation (Resend)
*Transactional Emails (Welcome, Alerts)*
- **Free**: 3,000 emails / month (100 / day).
- **Pro ($20/mo)**: 50,000 emails / month.
- **Recommendation**: **Free**.

---

## 📝 Total Monthly Budget (Recommended Production)
| Service | Cost | Notes |
| :--- | :--- | :--- |
| **Vercel** | $20.00 | Pro Plan (Stability) |
| **Supabase** | $25.00 | Pro Plan (No Pausing) |
| **Gemini AI** | ~$2.00 | Usage-based (Buffer) |
| **Remotion** | $0.00 | Client-side rendering |
| **Resend** | $0.00 | Free Tier |
| **Domain** | ~$1.00 | (Amortized $12/yr) |
| **TOTAL** | **~$48.00 / month** | |

> **Note**: These prices are estimates effective Jan 2026. Always check the official pricing pages for Vercel, Supabase, Google Cloud, and Remotion.
