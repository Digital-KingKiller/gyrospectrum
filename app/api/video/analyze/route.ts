import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const videoDuration = formData.get('duration') as string
        const videoName = formData.get('filename') as string
        const description = formData.get('description') as string || ''

        if (!videoDuration || !videoName) {
            return NextResponse.json({ error: 'Video info is required' }, { status: 400 })
        }

        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing Groq API Key' }, { status: 500 })
        }

        const groq = new Groq({ apiKey })

        // AI analyzes based on video metadata and optional description
        const systemPrompt = `
            You are a professional video advertisement consultant.
            Analyze the provided video information and suggest improvements to turn it into a professional advertisement.
            
            Return ONLY valid JSON in this format:
            {
                "suggestedScenes": [
                    { "timestamp": "0:00", "suggestion": "Add hook text overlay" },
                    { "timestamp": "0:05", "suggestion": "Insert brand logo" }
                ],
                "recommendedMusic": "corporate" | "inspiring" | "energetic",
                "suggestedText": ["Headline 1", "Headline 2", "CTA text"],
                "improvements": [
                    "Add a stronger opening hook in the first 3 seconds",
                    "Include a clear call-to-action at the end"
                ],
                "targetAudience": "B2B professionals | Gen Z consumers | Families | etc",
                "estimatedEngagement": "high" | "medium" | "low",
                "bestPlatform": "LinkedIn" | "Instagram" | "TikTok" | "YouTube"
            }
        `

        const userPrompt = `
            Analyze this video for advertisement optimization:
            - Filename: ${videoName}
            - Duration: ${videoDuration} seconds
            ${description ? `- Description: ${description}` : ''}
            
            Provide suggestions to transform this into a professional, engaging advertisement.
        `

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.6,
            response_format: { type: 'json_object' }
        })

        const content = completion.choices[0]?.message?.content
        if (!content) throw new Error('No analysis received from AI')

        const analysis = JSON.parse(content)

        return NextResponse.json({
            success: true,
            analysis: {
                ...analysis,
                duration: `${videoDuration} seconds`,
                quality: 'HD (1080p)',
                filename: videoName
            }
        })

    } catch (error: any) {
        console.error('Video Analysis Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to analyze video' },
            { status: 500 }
        )
    }
}
