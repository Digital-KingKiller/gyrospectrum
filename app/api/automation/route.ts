import { NextResponse } from 'next/server'
import { sendEmail, generateWelcomeEmailHtml } from '@/lib/email'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { AutomationSchema, validateBody } from '@/lib/validations'

export async function POST(req: Request) {
    // Rate limit: public endpoint
    const ip = getClientIp(req)
    const rateCheck = checkRateLimit(`automation:${ip}`, RATE_LIMITS.public)
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
        const body = await req.json()

        // Validate input
        const validation = validateBody(AutomationSchema, body)
        if (!validation.success) return (validation as any).response

        const { email, name, leadScore } = validation.data

        // Workflow Logic Check
        if (leadScore < 50) {
            return NextResponse.json({
                success: false,
                message: 'Lead score too low for automated nurture (Score < 50).'
            })
        }

        // Generate Dynamic Content
        // In a real app, 'videoUrl' would come from your DB where the generated video is stored
        const videoUrl = 'https://gyrospectrum.com/demo-video'
        const html = generateWelcomeEmailHtml(name || 'Customer', videoUrl)

        // Send Email
        const result = await sendEmail({
            to: email,
            subject: `Welcome to the Future, ${name || 'Friend'}! 🚀`,
            html
        })

        if (!result.success) {
            throw result.error
        }

        return NextResponse.json({
            success: true,
            message: 'Welcome email sent successfully!',
            id: result.id
        })

    } catch (error) {
        console.error('Automation error:', error)
        return NextResponse.json(
            { error: 'Failed to execute workflow' },
            { status: 500 }
        )
    }
}
