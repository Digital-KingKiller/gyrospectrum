import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { AnalyzeCompetitorSchema, validateBody } from '@/lib/validations'

export async function POST(request: Request) {
    // Rate limit: AI endpoint
    const ip = getClientIp(request)
    const rateCheck = checkRateLimit(`competitor-analyze:${ip}`, RATE_LIMITS.ai)
    if (!rateCheck.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait before analyzing another competitor.' },
            {
                status: 429,
                headers: { 'Retry-After': String(rateCheck.resetIn) },
            }
        )
    }

    try {
        const body = await request.json()

        // Validate input
        const validation = validateBody(AnalyzeCompetitorSchema, body)
        if (!validation.success) return (validation as any).response

        const { name, url } = validation.data

        // Step 1: Scrape the URL if provided
        let scrapedData = null
        if (url) {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                const scrapeRes = await fetch(`${baseUrl}/api/competitors/scrape`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                })
                if (scrapeRes.ok) {
                    const scrapeJson = await scrapeRes.json()
                    scrapedData = scrapeJson.data
                }
            } catch (e) {
                console.log('Scraping failed, proceeding with AI-only analysis')
            }
        }

        // Step 2: Initialize Groq
        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing Groq API Key' }, { status: 500 })
        }
        const groq = new Groq({ apiKey })

        // Step 3: AI Analysis with scraped context
        const systemPrompt = `
            You are a strategic business analyst.
            Analyze the following competitor using both provided website data AND your general market knowledge.
            Return ONLY valid JSON.
            
            Format:
            {
                "competitor_type": "direct" | "indirect",
                "sentiment_score": number (0-100),
                "success_factors": ["factor1", "factor2", "factor3"],
                "techniques": ["technique1", "technique2", "technique3"],
                "market_position": "Market Leader" | "Challenger" | "Niche Player" | "New Entrant",
                "strengths": ["strength1", "strength2"],
                "weaknesses": ["weakness1", "weakness2"],
                "threat_level": "high" | "medium" | "low"
            }
        `

        const userPrompt = `
            Analyze this competitor:
            Name: ${name || scrapedData?.title || 'Unknown'}
            URL: ${url || 'Not provided'}
            
            ${scrapedData ? `
            SCRAPED WEBSITE DATA:
            - Title: ${scrapedData.title}
            - Description: ${scrapedData.description}
            - Keywords: ${scrapedData.keywords?.join(', ') || 'None'}
            - Has Pricing Page: ${scrapedData.hasPricingPage ? 'Yes' : 'No'}
            - Tech Stack: ${scrapedData.techStack?.join(', ') || 'Unknown'}
            - Social Presence: ${Object.keys(scrapedData.socialLinks || {}).join(', ') || 'None detected'}
            ` : 'No website data available - analyze based on general knowledge.'}
            
            My Business Context: GyroSpectrum is an AI Marketing SaaS platform.
            - If they sell marketing software/automation, they are DIRECT.
            - If they are an agency or unrelated tool, they are INDIRECT.
        `

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.4,
            response_format: { type: 'json_object' }
        })

        const content = completion.choices[0]?.message?.content
        if (!content) throw new Error('No analysis received from AI')

        const analysis = JSON.parse(content)

        // Normalize sentiment_score: AI returns 0-100, DB expects 0-1
        let normalizedScore = analysis.sentiment_score
        if (normalizedScore > 1) {
            normalizedScore = normalizedScore / 100
        }
        // Clamp between 0 and 1 to prevent overflow
        normalizedScore = Math.min(1, Math.max(0, normalizedScore))

        // Step 4: Save to Database
        const supabase = await createClient()

        // Get the user's business ID
        const { data: business } = await (supabase.from('businesses') as any)
            .select('id')
            .limit(1)
            .maybeSingle()

        if (!business?.id) {
            return NextResponse.json({
                error: 'No business found. Please set up your business profile in Settings first.'
            }, { status: 400 })
        }

        const competitorData = {
            name: name || scrapedData?.title || url,
            website_url: url,
            business_id: business.id,
            competitor_type: analysis.competitor_type,
            sentiment_score: normalizedScore,
            success_factors: analysis.success_factors,
            techniques: analysis.techniques,
            last_analyzed_at: new Date().toISOString(),
            analysis_status: 'completed',
            content_strategy: {
                market_position: analysis.market_position,
                strengths: analysis.strengths,
                weaknesses: analysis.weaknesses,
                threat_level: analysis.threat_level,
                scraped: scrapedData ? {
                    description: scrapedData.description,
                    keywords: scrapedData.keywords,
                    techStack: scrapedData.techStack,
                    socialLinks: scrapedData.socialLinks
                } : null
            }
        }

        const { data, error } = await (supabase.from('competitors') as any)
            .insert(competitorData)
            .select()
            .single()

        if (error) {
            console.error('DB Insert Error:', error)
            throw error
        }

        return NextResponse.json({
            success: true,
            competitor: data,
            scraped: !!scrapedData,
            analysis
        })

    } catch (error: any) {
        console.error('Competitor Analysis Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to analyze competitor' },
            { status: 500 }
        )
    }
}
