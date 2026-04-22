import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { searchStockVideo } from '@/lib/external/pexels-client'

type Business = Database['public']['Tables']['businesses']['Row']
type Competitor = Database['public']['Tables']['competitors']['Row']

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

interface ContentGenerationOptions {
    platform: 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'whatsapp' | 'all'
    contentType: 'text' | 'image' | 'video' | 'carousel'
    count?: number
}

interface GeneratedContent {
    title: string
    text_content: string
    hashtags: string[]
    call_to_action: string
    media_suggestions: string[]
    video_query?: string
    video_url?: string
    platform: string
    based_on_competitor_id?: string
}

export class ContentGenerator {
    private model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })

    /**
     * Generate branded content based on competitive insights
     */
    async generateContent(
        businessId: string,
        options: ContentGenerationOptions = { platform: 'all', contentType: 'text', count: 5 }
    ): Promise<GeneratedContent[]> {
        try {
            // Get business details
            const { data: business, error: businessError } = await supabaseAdmin
                .from('businesses')
                .select('*')
                .eq('id', businessId)
                .single()

            if (businessError || !business) {
                throw new Error('Business not found')
            }

            // Get competitor insights
            const { data: competitors, error: competitorsError } = await supabaseAdmin
                .from('competitors')
                .select('*')
                .eq('business_id', businessId)
                .eq('analysis_status', 'completed')

            if (competitorsError) {
                console.error('Error fetching competitors:', competitorsError)
            }

            // Generate content using AI
            const generatedContent = await this.generateAIContent(
                business,
                competitors || [],
                options
            )

            // Enhance with stock videos
            const enhancedContent = await Promise.all(generatedContent.map(async (item) => {
                if (item.video_query) {
                    const video = await searchStockVideo(item.video_query)
                    if (video) {
                        return { ...item, video_url: video.url }
                    }
                }
                return item
            }))

            // Store in database
            const insertPromises = enhancedContent.map((content) =>
                supabaseAdmin.from('content_templates').insert({
                    business_id: businessId,
                    title: content.title,
                    content_type: options.contentType,
                    platform: content.platform,
                    text_content: content.text_content,
                    hashtags: content.hashtags,
                    call_to_action: content.call_to_action,
                    media_urls: content.video_url ? [content.video_url] : [],
                    based_on_competitor_id: content.based_on_competitor_id || null,
                    status: 'draft',
                })
            )

            await Promise.all(insertPromises)

            return enhancedContent
        } catch (error) {
            console.error('Error generating content:', error)
            throw error
        }
    }

    /**
     * Generate AI content using Gemini
     */
    private async generateAIContent(
        business: Business,
        competitors: Competitor[],
        options: ContentGenerationOptions
    ): Promise<GeneratedContent[]> {
        // Extract competitor insights
        const competitorInsights = competitors.map((c) => ({
            name: c.name,
            success_factors: c.success_factors || [],
            techniques: c.techniques || [],
            content_strategy: c.content_strategy,
        }))

        const prompt = `
You are an expert social media content creator. Generate ${options.count || 5} high-quality ${options.contentType} posts for the following business:

Business Information:
- Name: ${business.name}
- Description: ${business.description}
- Industry: ${business.industry || 'Not specified'}
- Target Audience: ${business.target_audience || 'General'}
- Brand Voice: ${business.brand_voice || 'Professional'}
- Unique Value Proposition: ${business.unique_value_proposition || 'N/A'}

Competitive Insights:
${competitorInsights.map((c, i) => `
Competitor ${i + 1}: ${c.name}
- Success Factors: ${c.success_factors.join(', ')}
- Techniques: ${c.techniques.join(', ')}
`).join('\n')}

Platform: ${options.platform === 'all' ? 'Multiple platforms (Facebook, Instagram, LinkedIn, TikTok)' : options.platform}

Requirements:
1. Create content that incorporates the successful techniques from competitors
2. Maintain the business's unique brand voice and value proposition
3. Include relevant hashtags (3-5 per post)
4. Add a compelling call-to-action
5. ${options.platform === 'all' ? 'Adapt each post for different platforms' : `Optimize specifically for ${options.platform}`}
6. Make the content engaging, authentic, and valuable to the target audience

Return the results as a JSON array in this exact format:
[
  {
    "title": "Brief title or theme",
    "text_content": "The actual post content",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "call_to_action": "Clear CTA",
    "media_suggestions": ["Suggestion for image/video 1", "Suggestion 2"],
    "video_query": "Keyword for stock video search (e.g. 'office meeting', 'coding')",
    "platform": "facebook" or "instagram" or "linkedin" or "tiktok",
    "based_on_competitor_id": null
  }
]

Return ONLY the JSON array, no additional text.
`

        try {
            const result = await this.model.generateContent(prompt)
            const response = result.response.text()

            // Extract JSON from response
            const jsonMatch = response.match(/\[[\s\S]*\]/)
            if (!jsonMatch) {
                throw new Error('No valid JSON array found in response')
            }

            const content = JSON.parse(jsonMatch[0])

            // If platform is 'all', ensure we have posts for each platform
            if (options.platform === 'all') {
                return content
            } else {
                // Filter to requested platform
                return content.filter((c: any) => c.platform === options.platform)
            }
        } catch (error) {
            console.error('Error generating AI content:', error)
            // Return fallback content
            return [
                {
                    title: 'Introduction Post',
                    text_content: `Introducing ${business.name}! ${business.description}`,
                    hashtags: ['business', 'innovation', 'growth'],
                    call_to_action: 'Learn more about us!',
                    media_suggestions: ['Company logo', 'Team photo'],
                    platform: options.platform === 'all' ? 'facebook' : options.platform,
                },
            ]
        }
    }

    /**
     * Customize content for specific brand guidelines
     */
    async customizeForBrand(
        content: GeneratedContent,
        business: Business
    ): Promise<GeneratedContent> {
        const prompt = `
Customize the following social media post to match the brand guidelines:

Original Content:
${content.text_content}

Brand Guidelines:
- Brand Voice: ${business.brand_voice || 'Professional'}
- Primary Color: ${business.primary_color || 'N/A'}
- Secondary Color: ${business.secondary_color || 'N/A'}
- Unique Value Proposition: ${business.unique_value_proposition || 'N/A'}

Instructions:
1. Rewrite the content to perfectly match the brand voice
2. Ensure the unique value proposition is subtly highlighted
3. Keep the core message and CTA
4. Maintain authenticity and engagement

Return the customized content in JSON format:
{
  "text_content": "Customized post content",
  "hashtags": ["hashtag1", "hashtag2"],
  "call_to_action": "Updated CTA"
}

Return ONLY the JSON object, no additional text.
`

        try {
            const result = await this.model.generateContent(prompt)
            const response = result.response.text()

            const jsonMatch = response.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                return content // Return original if parsing fails
            }

            const customized = JSON.parse(jsonMatch[0])

            return {
                ...content,
                text_content: customized.text_content,
                hashtags: customized.hashtags,
                call_to_action: customized.call_to_action,
            }
        } catch (error) {
            console.error('Error customizing content:', error)
            return content // Return original content on error
        }
    }

    /**
     * Optimize content for a specific platform
     */
    async optimizeForPlatform(
        content: GeneratedContent,
        platform: string
    ): Promise<GeneratedContent> {
        const platformGuidelines = {
            facebook: {
                charLimit: 63206,
                hashtagCount: '3-5',
                bestPractices: 'Conversational tone, ask questions, use emojis sparingly',
            },
            instagram: {
                charLimit: 2200,
                hashtagCount: '8-15',
                bestPractices: 'Visual storytelling, use line breaks, more hashtags, emojis encouraged',
            },
            linkedin: {
                charLimit: 3000,
                hashtagCount: '3-5',
                bestPractices: 'Professional tone, industry insights, thought leadership',
            },
            tiktok: {
                charLimit: 2200,
                hashtagCount: '3-5',
                bestPractices: 'Casual, trendy, authentic, relate to trending topics',
            },
            whatsapp: {
                charLimit: 1024,
                hashtagCount: '0-2',
                bestPractices: 'Personal, direct, conversational, no public hashtags',
            },
        }

        const guidelines = platformGuidelines[platform as keyof typeof platformGuidelines]

        if (!guidelines) {
            return content
        }

        const prompt = `
Optimize this social media post for ${platform.toUpperCase()}:

Original Content:
${content.text_content}

Platform Guidelines:
- Character Limit: ${guidelines.charLimit}
- Hashtag Count: ${guidelines.hashtagCount}
- Best Practices: ${guidelines.bestPractices}

Instructions:
1. Adapt the content to fit ${platform}'s character limit
2. Adjust the number of hashtags
3. Match the platform's best practices
4. Preserve the core message and CTA

Return in JSON format:
{
  "text_content": "Optimized post",
  "hashtags": ["hashtag1", "hashtag2"]
}

Return ONLY the JSON object, no additional text.
`

        try {
            const result = await this.model.generateContent(prompt)
            const response = result.response.text()

            const jsonMatch = response.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                return content
            }

            const optimized = JSON.parse(jsonMatch[0])

            return {
                ...content,
                text_content: optimized.text_content,
                hashtags: optimized.hashtags,
                platform,
            }
        } catch (error) {
            console.error('Error optimizing content:', error)
            return content
        }
    }
}
