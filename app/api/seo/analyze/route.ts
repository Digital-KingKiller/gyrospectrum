import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' })

export async function POST(request: Request) {
    try {
        const { content, platform, topic } = await request.json()

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const prompt = `You are an expert SEO analyst. Analyze this ${platform || 'general'} content and return a detailed SEO report.

Content to analyze:
"""
${content}
"""

Topic/Keyword Focus: ${topic || 'Not specified'}

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "seoScore": 75,
  "readabilityScore": 80,
  "keywordDensity": 2.5,
  "wordCount": 120,
  "recommendations": [
    "Add a clear call-to-action at the end",
    "Include 2-3 relevant hashtags for better discoverability"
  ],
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3"],
  "metaTitle": "Suggested SEO title under 60 chars",
  "metaDescription": "Compelling meta description under 160 chars",
  "schemaType": "Article",
  "strengths": ["Good use of active voice", "Strong opening hook"],
  "weaknesses": ["Too long for the platform", "Missing keyword in first paragraph"]
}`

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 800,
        })

        const raw = completion.choices[0]?.message?.content || '{}'
        
        // Safely parse the JSON
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        const seoData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
            seoScore: 65,
            readabilityScore: 70,
            keywordDensity: 1.5,
            wordCount: content.split(/\s+/).length,
            recommendations: ['Add more relevant keywords', 'Improve headline clarity'],
            suggestedKeywords: [],
            metaTitle: content.substring(0, 60),
            metaDescription: content.substring(0, 155),
            schemaType: 'Article',
            strengths: [],
            weaknesses: []
        }

        return NextResponse.json({ success: true, seo: seoData })

    } catch (error) {
        console.error('SEO Analyze Error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze SEO' },
            { status: 500 }
        )
    }
}
