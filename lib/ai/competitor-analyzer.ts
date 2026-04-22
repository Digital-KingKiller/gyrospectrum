import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabase/client'
import axios from 'axios'
import * as cheerio from 'cheerio'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

interface CompetitorAnalysisResult {
    competitors: {
        name: string
        website_url: string
        competitor_type: 'direct' | 'indirect' | 'macro'
        social_media_presence: any
        success_factors: string[]
        techniques: string[]
    }[]
    insights: string[]
}

export class CompetitorAnalyzer {
    private model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })

    /**
     * Analyze competitors for a given business
     */
    async analyzeCompetitors(
        businessId: string,
        businessDescription: string,
        industry?: string
    ): Promise<CompetitorAnalysisResult> {
        try {
            // Step 1: Discover competitors using AI
            const competitors = await this.discoverCompetitors(businessDescription, industry)

            // Step 2: Analyze each competitor in parallel
            const analysisPromises = competitors.map((competitor) =>
                this.analyzeCompetitor(businessId, competitor)
            )

            const analyzedCompetitors = await Promise.all(analysisPromises)

            // Step 3: Extract cross-competitor insights
            const insights = await this.extractInsights(analyzedCompetitors)

            return {
                competitors: analyzedCompetitors,
                insights,
            }
        } catch (error) {
            console.error('Error analyzing competitors:', error)
            throw error
        }
    }

    /**
     * Discover competitors using AI web search simulation
     */
    private async discoverCompetitors(
        businessDescription: string,
        industry?: string
    ): Promise<{ name: string; website_url: string; competitor_type: string }[]> {
        const prompt = `
You are a business competitor analyst. Based on the following business description, identify 5-10 key competitors.

Business Description: ${businessDescription}
Industry: ${industry || 'Not specified'}

For each competitor, provide:
1. Company name
2. Website URL
3. Competitor type (direct, indirect, or macro)

Return the results as a JSON array in this exact format:
[
  {
    "name": "Company Name",
    "website_url": "https://example.com",
    "competitor_type": "direct"
  }
]

Focus on real, well-known companies in this space. Return ONLY the JSON array, no additional text.
`

        try {
            const result = await this.model.generateContent(prompt)
            const response = result.response.text()

            // Extract JSON from response
            const jsonMatch = response.match(/\[[\s\S]*\]/)
            if (!jsonMatch) {
                throw new Error('No valid JSON array found in response')
            }

            const competitors = JSON.parse(jsonMatch[0])
            return competitors
        } catch (error) {
            console.error('Error discovering competitors:', error)
            // Return fallback empty array
            return []
        }
    }

    /**
     * Analyze a single competitor
     */
    private async analyzeCompetitor(
        businessId: string,
        competitor: { name: string; website_url: string; competitor_type: string }
    ) {
        try {
            // Scrape competitor website
            const websiteData = await this.scrapeWebsite(competitor.website_url)

            // Analyze using AI
            const analysis = await this.performAIAnalysis(competitor.name, websiteData)

            // Store in database
            const { data, error } = await supabaseAdmin
                .from('competitors')
                .insert({
                    business_id: businessId,
                    name: competitor.name,
                    website_url: competitor.website_url,
                    competitor_type: competitor.competitor_type,
                    social_media_presence: analysis.social_media,
                    content_strategy: analysis.content_strategy,
                    engagement_metrics: analysis.engagement_metrics,
                    success_factors: analysis.success_factors,
                    techniques: analysis.techniques,
                    sentiment_score: analysis.sentiment_score,
                    last_analyzed_at: new Date().toISOString(),
                    analysis_status: 'completed',
                })
                .select()
                .single()

            if (error) {
                console.error('Error storing competitor analysis:', error)
            }

            return {
                name: competitor.name,
                website_url: competitor.website_url,
                competitor_type: competitor.competitor_type as 'direct' | 'indirect' | 'macro',
                social_media_presence: analysis.social_media,
                success_factors: analysis.success_factors,
                techniques: analysis.techniques,
            }
        } catch (error) {
            console.error(`Error analyzing competitor ${competitor.name}:`, error)
            // Return basic data even if analysis fails
            return {
                name: competitor.name,
                website_url: competitor.website_url,
                competitor_type: competitor.competitor_type as 'direct' | 'indirect' | 'macro',
                social_media_presence: {},
                success_factors: [],
                techniques: [],
            }
        }
    }

    /**
     * Scrape competitor website
     */
    private async scrapeWebsite(url: string): Promise<string> {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
                timeout: 10000,
            })

            const $ = cheerio.load(response.data)

            // Extract relevant text content
            $('script, style, nav, footer').remove()
            const textContent = $('body').text().replace(/\s+/g, ' ').trim()

            // Limit to first 5000 characters to avoid token limits
            return textContent.substring(0, 5000)
        } catch (error) {
            console.error(`Error scraping website ${url}:`, error)
            return ''
        }
    }

    /**
     * Perform AI analysis on competitor data
     */
    private async performAIAnalysis(competitorName: string, websiteContent: string) {
        const prompt = `
Analyze the following competitor's website content and provide insights:

Competitor: ${competitorName}
Website Content: ${websiteContent}

Provide the following analysis in JSON format:
{
  "social_media": {
    "facebook": "URL if found, otherwise null",
    "instagram": "URL if found, otherwise null",
    "linkedin": "URL if found, otherwise null",
    "tiktok": "URL if found, otherwise null"
  },
  "content_strategy": {
    "key_messages": ["message 1", "message 2"],
    "value_propositions": ["proposition 1", "proposition 2"],
    "target_audience": "description"
  },
  "engagement_metrics": {
    "estimated_quality": "high/medium/low",
    "content_frequency": "estimated posting frequency"
  },
  "success_factors": ["factor 1", "factor 2", "factor 3"],
  "techniques": ["technique 1", "technique 2", "technique 3"],
  "sentiment_score": 0.75
}

Return ONLY the JSON object, no additional text.
`

        try {
            const result = await this.model.generateContent(prompt)
            const response = result.response.text()

            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response')
            }

            return JSON.parse(jsonMatch[0])
        } catch (error) {
            console.error('Error performing AI analysis:', error)
            // Return fallback structure
            return {
                social_media: {},
                content_strategy: {},
                engagement_metrics: {},
                success_factors: [],
                techniques: [],
                sentiment_score: 0.5,
            }
        }
    }

    /**
     * Extract cross-competitor insights
     */
    private async extractInsights(competitors: any[]): Promise<string[]> {
        const prompt = `
Based on analysis of ${competitors.length} competitors, extract key insights:

${competitors.map((c, i) => `
Competitor ${i + 1}: ${c.name}
Success Factors: ${c.success_factors.join(', ')}
Techniques: ${c.techniques.join(', ')}
`).join('\n')}

Provide 5-7 actionable insights that can be used to create better content and marketing strategies.
Return as a JSON array of strings.

Example:
["Insight 1: Most successful competitors use...", "Insight 2: A common technique is..."]

Return ONLY the JSON array, no additional text.
`

        try {
            const result = await this.model.generateContent(prompt)
            const response = result.response.text()

            const jsonMatch = response.match(/\[[\s\S]*\]/)
            if (!jsonMatch) {
                return ['Insight extraction pending - competitor data being processed']
            }

            return JSON.parse(jsonMatch[0])
        } catch (error) {
            console.error('Error extracting insights:', error)
            return ['Analysis complete - insights will be available shortly']
        }
    }
}
