import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export async function POST(request: Request) {
    try {
        const { topic, style = 'cinematic' } = await request.json()

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
        }

        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing Groq API Key' }, { status: 500 })
        }

        const groq = new Groq({ apiKey })

        const systemPrompt = `
            You are a professional video script writer.
            Create a ${style} video script with 5-7 scenes for marketing content.
            
            Return ONLY valid JSON in this format:
            {
                "scenes": [
                    {
                        "headline": "Bold headline text (max 8 words)",
                        "subheadline": "Supporting text (max 15 words)",
                        "narration": "Voiceover script for this scene (1-2 sentences)",
                        "visualQuery": "Search query for stock video/image (3-5 keywords)",
                        "durationInSeconds": 5
                    }
                ]
            }
            
            Guidelines:
            - First scene: Hook/attention grabber
            - Middle scenes: Key points/benefits
            - Last scene: Call to action
            - Keep headlines punchy and impactful
            - Visual queries should be specific and evocative
        `

        const userPrompt = `Create a ${style} marketing video about: "${topic}"`

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            response_format: { type: 'json_object' }
        })

        const content = completion.choices[0]?.message?.content
        if (!content) throw new Error('No content received from AI')

        const data = JSON.parse(content)

        // Enrich scenes with proper field names for Remotion compositions
        const enrichedScenes = data.scenes.map((scene: any, index: number) => ({
            // CinematicComposition expects textTitle/textSubtitle
            textTitle: scene.headline,
            textSubtitle: scene.subheadline,
            // Also include headline for backwards compatibility with UI display
            headline: scene.headline,
            narration: scene.narration,
            visualQuery: scene.visualQuery,
            imageUrl: `https://picsum.photos/seed/${topic.replace(/\s/g, '')}-${index}/1920/1080`,
            durationInSeconds: scene.durationInSeconds || 5
        }))

        return NextResponse.json({
            success: true,
            topic,
            style,
            scenes: enrichedScenes
        })

    } catch (error: any) {
        console.error('Video Generation Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate video' },
            { status: 500 }
        )
    }
}
