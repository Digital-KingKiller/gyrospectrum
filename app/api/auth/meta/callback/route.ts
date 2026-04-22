import { NextResponse } from 'next/server'
import { saveToken } from '@/lib/social/token-storage'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
        console.error('Meta Auth Error:', error)
        return NextResponse.redirect(new URL('/dashboard/social?error=meta_auth_failed', request.url))
    }

    if (!code) {
        return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
    }

    try {
        // In a production app, we would exchange the code for an access token:
        // const response = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`)
        
        // For demonstration, we save mock tokens
        const mockAccessToken = 'EAA_MOCK_META_ACCESS_TOKEN_' + Math.random().toString(36).substring(7)
        
        // Facebook tokens typically last 60 days
        const expiresInSeconds = 60 * 24 * 60 * 60

        // Save for both platforms since they share the Meta Graph API
        saveToken('facebook', mockAccessToken, expiresInSeconds)
        saveToken('instagram', mockAccessToken, expiresInSeconds)

        // Redirect back to dashboard with connected flag
        return NextResponse.redirect(new URL('/dashboard/social?connected=meta', request.url))
    } catch (error) {
        console.error('Failed to exchange Meta token:', error)
        return NextResponse.redirect(new URL('/dashboard/social?error=token_exchange_failed', request.url))
    }
}
