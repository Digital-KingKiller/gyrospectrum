import { NextResponse } from 'next/server'
import { getToken } from '@/lib/social/token-storage'

export async function GET() {
    const token = getToken('linkedin')

    if (!token) {
        return NextResponse.json({ error: 'Not connected to LinkedIn' }, { status: 401 })
    }

    try {
        // Fetch User's Organizations
        // Using projection to get the organization name in the same call
        // role=ADMINISTRATOR ensures we only get pages we can manage
        const params = new URLSearchParams({
            q: 'roleAssignee',
            role: 'ADMINISTRATOR',
            state: 'APPROVED',
            projection: '(elements*(organizationalTarget~(localizedName)))'
        })

        const response = await fetch(`https://api.linkedin.com/v2/organizationalEntityAcls?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        })

        if (!response.ok) {
            const err = await response.text()
            console.error('LinkedIn Org Fetch Error:', err)
            throw new Error('Failed to fetch organizations')
        }

        const data = await response.json()

        // Transform data
        // elements: [ { organizationalTarget: "urn:li:organization:123", "organizationalTarget~": { localizedName: "My Company" } } ]
        const organizations = data.elements.map((el: any) => ({
            urn: el.organizationalTarget,
            name: el['organizationalTarget~']?.localizedName || 'Unknown Organization'
        }))

        return NextResponse.json({ organizations })

    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
