import { NextResponse } from 'next/server'

export async function GET() {
    const clientId = process.env.LINKEDIN_CLIENT_ID
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback'

    // w_member_social: Post on behalf of user
    // profile, email, openid: Identity (standard OIDC)
    // Note: Organization scopes removed temporarily to allow immediate testing with new apps.
    const scope = encodeURIComponent('w_member_social openid profile email')

    if (!clientId) {
        return NextResponse.json({ error: 'Missing LinkedIn Client ID' }, { status: 500 })
    }

    const linkedInUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=gyro_linkedin_connect&scope=${scope}`

    return NextResponse.redirect(linkedInUrl)
}
