import { NextResponse } from 'next/server'
import { saveToken } from '@/lib/social/token-storage'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
        return NextResponse.json({ error: `LinkedIn Auth Error: ${error}` }, { status: 400 })
    }

    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback'

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: 'Missing Configuration' }, { status: 500 })
    }

    try {
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        })

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text()
            console.error('LinkedIn Token Error:', errText)
            throw new Error('Failed to exchange code for token')
        }

        const data = await tokenResponse.json()
        const { access_token, expires_in } = data

        // Save token locally
        saveToken('linkedin', access_token, expires_in)

        // Redirect to dashboard with success param
        return NextResponse.redirect(new URL('/dashboard/social?connected=linkedin', request.url))

    } catch (error) {
        console.error('Auth Callback Error:', error)
        return NextResponse.json({ error: 'Authentication Failed' }, { status: 500 })
    }
}
