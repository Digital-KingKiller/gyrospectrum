import { NextResponse } from 'next/server'
import { CompetitorAnalyzer } from '@/lib/ai/competitor-analyzer'

export async function POST(request: Request) {
    try {
        const { businessId, businessDescription, industry } = await request.json()

        if (!businessId || !businessDescription) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const analyzer = new CompetitorAnalyzer()
        const result = await analyzer.analyzeCompetitors(businessId, businessDescription, industry)

        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error: any) {
        console.error('Error in analyze API:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to analyze competitors' },
            { status: 500 }
        )
    }
}
