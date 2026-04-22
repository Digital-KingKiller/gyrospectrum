import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' })

export interface CampaignDeliverable {
    day: number
    type: 'video' | 'social' | 'email'
    platform: string
    title: string
    hook: string
    status: 'pending'
}

export async function POST(request: Request) {
    try {
        const { goal, duration = 14, channelFocus = 'omnichannel' } = await request.json()

        if (!goal) {
            return NextResponse.json({ error: 'Campaign goal is required' }, { status: 400 })
        }

        const prompt = `You are a top-tier marketing strategist. Create a ${duration}-day social media campaign plan for this goal:

Goal: "${goal}"
Channel Focus: ${channelFocus}
Duration: ${duration} days

Generate a campaign calendar with exactly 8 deliverables spread across the ${duration} days.
Return ONLY raw JSON (no markdown) with this exact structure:
{
  "campaignName": "Campaign Name Here",
  "targetAudience": "Who this campaign targets",
  "coreMessage": "The single core message/USP",
  "deliverables": [
    {
      "day": 1,
      "type": "social",
      "platform": "LinkedIn",
      "title": "Title of the post",
      "hook": "The opening hook or angle for this piece",
      "status": "pending"
    }
  ]
}

Mix of types: 2 videos (TikTok/Reels), 4 social posts (LinkedIn, Instagram, Facebook), 2 emails.`

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1500,
        })

        const raw = completion.choices[0]?.message?.content || '{}'
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        
        if (!jsonMatch) {
            throw new Error('Failed to parse campaign JSON')
        }

        const campaign = JSON.parse(jsonMatch[0])
        return NextResponse.json({ success: true, campaign })

    } catch (error) {
        console.error('Campaign Generate Error:', error)
        return NextResponse.json(
            { error: 'Failed to generate campaign' },
            { status: 500 }
        )
    }
}
