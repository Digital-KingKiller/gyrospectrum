// @ts-nocheck
import { NextResponse } from 'next/server'
import { SalesAgent } from '@/lib/ai/sales-agent'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'
import { supabaseAdmin } from '@/lib/supabase/client'

// Verify Webhook
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 })
    }

    return new NextResponse('Forbidden', { status: 403 })
}

// Handle Incoming Messages
export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Check if it's a WhatsApp status update (not a message)
        if (!body.entry?.[0]?.changes?.[0]?.value?.messages) {
            return NextResponse.json({ status: 'ignored' })
        }

        const value = body.entry[0].changes[0].value
        const message = value.messages[0]

        // Only handle text messages for now
        if (message.type !== 'text') {
            return NextResponse.json({ status: 'ignored_non_text' })
        }

        const from = message.from // Phone number
        const text = message.text.body
        const name = value.contacts?.[0]?.profile?.name || 'Unknown'

        // 1. Find or Create Lead
        let leadId: string | null = null
        let businessId: string | null = null

        // Try to find lead by phone
        const { data: existingLead } = await supabaseAdmin
            .from('leads')
            .select('id, business_id')
            .eq('phone', from)
            .single()

        if (existingLead) {
            leadId = existingLead.id
            businessId = existingLead.business_id
        } else {
            // Get default business (first one found)
            const { data: business } = await supabaseAdmin
                .from('businesses')
                .select('id')
                .limit(1)
                .single()

            if (!business) {
                console.error('No business found to assign lead to')
                return NextResponse.json({ error: 'No business configured' }, { status: 500 })
            }

            businessId = business.id

            // Create new lead
            const { data: newLead, error: createError } = await supabaseAdmin
                .from('leads')
                .insert({
                    business_id: businessId,
                    name: name,
                    phone: from,
                    source_platform: 'whatsapp',
                    status: 'new',
                    qualification_score: 0,
                })
                .select('id')
                .single()

            if (createError) {
                console.error('Error creating lead:', createError)
                return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
            }
            leadId = newLead.id
        }

        // 2. Process with AI Agent
        const agent = new SalesAgent()
        const aiResponse = await agent.handleMessage(businessId!, leadId!, text, 'whatsapp')

        // 3. Send Response via WhatsApp
        // SalesAgent always returns a message, so we send it.
        if (aiResponse.message) {
            await sendWhatsAppMessage(from, aiResponse.message)
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error in WhatsApp webhook:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

