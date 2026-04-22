import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { CreateBusinessSchema, validateBody } from '@/lib/validations'

export async function POST(request: Request) {
    // Rate limit
    const ip = getClientIp(request)
    const rateCheck = checkRateLimit(`business:${ip}`, RATE_LIMITS.public)
    if (!rateCheck.success) {
        return NextResponse.json(
            { error: 'Too many requests.' },
            { status: 429, headers: { 'Retry-After': String(rateCheck.resetIn) } }
        )
    }

    try {
        const body = await request.json()

        // Validate input
        const validation = validateBody(CreateBusinessSchema, body)
        if (!validation.success) return (validation as any).response

        const { name, description, industry, target_audience, brand_voice } = validation.data

        const { data, error } = await (supabaseAdmin
            .from('businesses') as any)
            .insert({
                name,
                description,
                industry: industry || null,
                target_audience: target_audience || null,
                brand_voice: brand_voice || 'professional',
                auto_post_enabled: false,
                auto_respond_enabled: false,
            })
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({
            success: true,
            data,
        })
    } catch (error: any) {
        console.error('Error creating business:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create business' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const { data, error } = await (supabaseAdmin
            .from('businesses') as any)
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }

        return NextResponse.json({
            success: true,
            data,
        })
    } catch (error: any) {
        console.error('Error fetching businesses:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch businesses' },
            { status: 500 }
        )
    }
}
