import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

// Zod schema for lead validation
const LeadSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    message: z.string().max(5000).optional(),
    source_platform: z.string().max(50).optional().default('website'),
    source_url: z.string().url().optional(),
})

export async function POST(request: Request) {
    // Rate limit: public endpoint
    const ip = getClientIp(request)
    const rateCheck = checkRateLimit(`lead-capture:${ip}`, RATE_LIMITS.public)
    if (!rateCheck.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: { 'Retry-After': String(rateCheck.resetIn) },
            }
        )
    }

    try {
        const body = await request.json()

        // Validate input
        const parsed = LeadSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid lead data', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const leadData = parsed.data

        // Must have at least email or phone
        if (!leadData.email && !leadData.phone) {
            return NextResponse.json(
                { error: 'Email or phone is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get user's business to link the lead
        const { data: business } = await (supabase.from('businesses') as any)
            .select('id')
            .limit(1)
            .maybeSingle()

        const businessId = business?.id || '00000000-0000-0000-0000-000000000000'

        // Insert lead into database
        const { data: lead, error } = await (supabase.from('leads') as any)
            .insert({
                name: leadData.name,
                email: leadData.email,
                phone: leadData.phone,
                notes: leadData.message,
                source_platform: leadData.source_platform,
                source_url: leadData.source_url,
                status: 'new',
                qualification_score: null,
                intent: null,
                business_id: businessId,
            })
            .select()
            .single()

        if (error) {
            console.error('DB Error:', error)
            throw error
        }

        // Trigger AI qualification asynchronously (fire and forget)
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/qualify-lead`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leadId: lead.id })
        }).catch(err => console.error('Qualification trigger failed:', err))

        return NextResponse.json({
            success: true,
            lead: {
                id: lead.id,
                status: lead.status
            },
            message: 'Lead captured successfully'
        })

    } catch (error: any) {
        console.error('Lead Capture Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to capture lead' },
            { status: 500 }
        )
    }
}

// Also allow GET for health check
export async function GET() {
    return NextResponse.json({ status: 'ok', endpoint: 'Lead Capture Webhook' })
}
