import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
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

        // 2. Initialize Groq
        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing Groq API Key' }, { status: 500 })
        }
        const groq = new Groq({ apiKey })

        // 3. AI Qualification Prompt
        const systemPrompt = `
            You are an expert sales qualification agent.
            Analyze the following lead and return ONLY valid JSON.
            
            Format:
            {
                "score": number (0-100, where 100 = hot lead),
                "intent": "high" | "medium" | "low",
                "reasoning": "Brief reason for the score",
                "suggestedReply": "A personalized opening line for outreach"
            }
        `

        const userPrompt = `
            Qualify this lead:
            - Name: ${lead.name || 'Unknown'}
            - Email: ${lead.email || 'N/A'}
            - Phone: ${lead.phone || 'N/A'}
            - Message: ${lead.notes || 'No message provided'}
            - Source: ${lead.source_platform || 'Unknown'}
            
            Consider:
            - Quality of contact info (email + phone = high)
            - Specificity of message (detailed = motivated)
            - Source (referral > organic > ad)
        `

        // 4. Call Groq
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            response_format: { type: 'json_object' }
        })

        const content = completion.choices[0]?.message?.content
        if (!content) throw new Error('No response from AI')

        const qualification = JSON.parse(content)

        // 5. Update lead in database
        const { error: updateError } = await (supabase.from('leads') as any)
            .update({
                qualification_score: qualification.score,
                intent: qualification.intent,
                notes: lead.notes ? `${lead.notes}\n\n[AI Insight]: ${qualification.reasoning}` : qualification.reasoning,
                status: qualification.score >= 70 ? 'qualified' : 'new'
            })
            .eq('id', leadId)

        if (updateError) {
            console.error('Update Error:', updateError)
        }

        return NextResponse.json({
            success: true,
            leadId,
            qualification
        })

    } catch (error: any) {
        console.error('Lead Qualification Error:', error)
        return NextResponse.json(
            { error: error.message || 'Qualification failed' },
            { status: 500 }
        )
    }
}
