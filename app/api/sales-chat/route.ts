import { NextResponse } from 'next/server'
import { SalesAgent } from '@/lib/ai/sales-agent'

export async function POST(request: Request) {
    try {
        const { businessId, leadId, message, platform } = await request.json()

        if (!businessId || !leadId || !message || !platform) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const agent = new SalesAgent()
        const response = await agent.handleMessage(businessId, leadId, message, platform)

        return NextResponse.json({
            success: true,
            data: response,
        })
    } catch (error: any) {
        console.error('Error in sales-chat API:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to process message' },
            { status: 500 }
        )
    }
}
