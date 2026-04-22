import { NextResponse } from 'next/server'
import { getToken } from '@/lib/social/token-storage'

export async function POST(request: Request) {
    try {
        const { text, url, authorUrn } = await request.json()
        const token = getToken('linkedin')

        if (!token) {
            return NextResponse.json({ error: 'Not connected to LinkedIn' }, { status: 401 })
        }

        // 1. Determine Author URN
        let urnToPostAs = authorUrn

        if (!urnToPostAs) {
            // Default to personal profile
            const profileResp = await fetch('https://api.linkedin.com/v2/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!profileResp.ok) {
                const err = await profileResp.text()
                console.error('LinkedIn Profile Error:', err)
                throw new Error('Failed to fetch profile')
            }

            const profile = await profileResp.json()
            urnToPostAs = `urn:li:person:${profile.sub}`
        }

        // 2. Create UGC Post
        const postBody = {
            author: urnToPostAs,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: text
                    },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        }

        // If URL provided, change to ARTICLE share
        if (url) {
            (postBody.specificContent['com.linkedin.ugc.ShareContent'] as any).shareMediaCategory = 'ARTICLE';
            (postBody.specificContent['com.linkedin.ugc.ShareContent'] as any).media = [
                {
                    status: 'READY',
                    description: { text: 'Shared via GyroSpectrum' },
                    originalUrl: url,
                    title: { text: 'Check this out' }
                }
            ];
        }

        const postResp = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(postBody)
        })

        if (!postResp.ok) {
            const err = await postResp.text()
            console.error('LinkedIn Post Error:', err)
            throw new Error('Failed to post to LinkedIn')
        }

        const postData = await postResp.json()

        return NextResponse.json({
            success: true,
            id: postData.id,
            postId: postData.id
        })

    } catch (error) {
        console.error('LinkedIn API Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to post' },
            { status: 500 }
        )
    }
}
