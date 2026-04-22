import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export async function POST(request: Request) {
    try {
        const { topic, tone, platform } = await request.json()
        const apiKey = process.env.GROQ_API_KEY

        if (!apiKey) {
            return NextResponse.json({ error: 'Missing Groq API Key' }, { status: 500 })
        }

        const groq = new Groq({ apiKey })

        const systemPrompt = `
            You are a social media expert.
            Return ONLY a valid JSON object. Do not explain. Do not wrap in markdown code blocks.
            Format: { "content": "The full post text here...", "hashtags": ["#tag1", "#tag2"] }
        `

        const userPrompt = `
            Write a ${tone || 'professional'} post for ${platform || 'LinkedIn'} about: "${topic}".
            Requirements:
            - Engaging hook
            - Professional but conversational body
            - Clear CTA
            - 3-5 hashtags
        `

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile', // Updated to latest supported model
            temperature: 0.7,
            max_tokens: 1024,
            response_format: { type: 'json_object' } // Force JSON mode
        })

        const content = completion.choices[0]?.message?.content
        if (!content) throw new Error('No content received from Groq')

        const json = JSON.parse(content)
        return NextResponse.json(json)

    } catch (error: any) {
        console.error('Groq Gen Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate content' },
            { status: 500 }
        )
    }
}
