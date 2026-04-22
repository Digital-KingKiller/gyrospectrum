import { NextResponse } from 'next/server'
import { ContentGenerator } from '@/lib/ai/content-generator'

export async function POST(request: Request) {
    try {
        const { businessId, platform, contentType, count } = await request.json()

        if (!businessId) {
            return NextResponse.json(
                { error: 'Business ID is required' },
                { status: 400 }
            )
        }

        const generator = new ContentGenerator()
        const content = await generator.generateContent(businessId, {
            platform: platform || 'all',
            contentType: contentType || 'text',
            count: count || 5,
        })

        return NextResponse.json({
            success: true,
            data: content,
        })
    } catch (error: any) {
        console.error('Error in generate-content API:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate content' },
            { status: 500 }
        )
    }
}
