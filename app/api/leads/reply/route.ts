import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const { leadId } = await request.json()

        if (!leadId) {
            return NextResponse.json({ error: 'leadId required' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Fetch lead details
        const { data: lead, error: fetchError } = await (supabase.from('leads') as any)
            .select('*')
            .eq('id', leadId)
            .single()

        if (fetchError || !lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
        }

        if (!lead.email) {
            return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 })
        }

        // 2. Fetch business info for context
        const { data: business } = await (supabase.from('businesses') as any)
            .select('name, industry, description')
            .limit(1)
            .maybeSingle()

        // 3. Initialize Groq for reply generation
        const groqApiKey = process.env.GROQ_API_KEY
        if (!groqApiKey) {
            return NextResponse.json({ error: 'Missing Groq API Key' }, { status: 500 })
        }
        const groq = new Groq({ apiKey: groqApiKey })

        // 4. Generate personalized reply
        const systemPrompt = `
            You are a professional sales representative for ${business?.name || 'our company'}.
            Industry: ${business?.industry || 'Technology'}
            
            Write a warm, personalized email reply to a new lead.
            Be conversational but professional. Keep it brief (2-3 short paragraphs).
            Include a clear call-to-action (schedule a call, reply with questions, etc).
            
            Return ONLY valid JSON:
            {
                "subject": "Email subject line",
                "body": "The full email body text"
            }
        `

        const userPrompt = `
            Lead Details:
            - Name: ${lead.name || 'there'}
            - Their Message: "${lead.notes || 'Requested information'}"
            - Source: ${lead.source_platform}
            
            Write a reply that acknowledges their specific inquiry and offers to help.
        `

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
        if (!content) throw new Error('No response from AI')

        const emailContent = JSON.parse(content)

        // 5. Send email via Resend
        const resendApiKey = process.env.RESEND_API_KEY
        if (!resendApiKey) {
            // If no Resend key, just return the generated content (for testing)
            return NextResponse.json({
                success: true,
                sent: false,
                reason: 'RESEND_API_KEY not configured',
                email: emailContent
            })
        }

        const resend = new Resend(resendApiKey)

        const { data: emailResult, error: emailError } = await resend.emails.send({
            from: `${business?.name || 'GyroSpectrum'} <onboarding@resend.dev>`,
            to: lead.email,
            subject: emailContent.subject,
            text: emailContent.body
        })

        if (emailError) {
            console.error('Resend Error:', emailError)
            throw new Error(emailError.message)
        }

        // 6. Update lead status
        await (supabase.from('leads') as any)
            .update({
                status: 'contacted',
                last_contact_at: new Date().toISOString()
            })
            .eq('id', leadId)

        // 7. Log conversation (if table exists)
        try {
            await (supabase.from('conversations') as any).insert({
                lead_id: leadId,
                direction: 'outbound',
                channel: 'email',
                content: emailContent.body,
                business_id: '00000000-0000-0000-0000-000000000000'
            })
        } catch (e) {
            // Conversations table might not exist yet
            console.log('Conversation logging skipped')
        }

        return NextResponse.json({
            success: true,
            sent: true,
            emailId: emailResult?.id,
            to: lead.email,
            subject: emailContent.subject
        })

    } catch (error: any) {
        console.error('Lead Reply Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to send reply' },
            { status: 500 }
        )
    }
}
