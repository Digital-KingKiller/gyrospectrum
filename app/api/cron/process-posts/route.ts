import { NextResponse } from 'next/server'
import { getDuePosts, updatePostStatus } from '@/lib/social/posts-storage'
import { getToken } from '@/lib/social/token-storage'

export async function GET(request: Request) {
    // In production, you would check for a CRON_SECRET header
    // For dev, we'll allow public access or check basic auth if needed

    const duePosts = getDuePosts()
    const results = []

    if (duePosts.length === 0) {
        return NextResponse.json({ message: 'No posts due', count: 0 })
    }

    const token = getToken('linkedin')
    if (!token) {
        return NextResponse.json({ error: 'No active LinkedIn token found' }, { status: 401 })
    }

    for (const post of duePosts) {
        try {
            // Reusing the logic from post/route.ts but calling LinkedIn directly to avoid self-fetch complexity

            // 1. Determine Author
            let urnToPostAs = post.authorUrn
            if (!urnToPostAs) {
                const profileResp = await fetch('https://api.linkedin.com/v2/userinfo', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const profile = await profileResp.json()
                urnToPostAs = `urn:li:person:${profile.sub}`
            }

            // 2. Create Post
            const postBody = {
                author: urnToPostAs,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    'com.linkedin.ugc.ShareContent': {
                        shareCommentary: { text: post.content },
                        shareMediaCategory: 'NONE'
                    }
                },
                visibility: {
                    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                }
            }

            const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0'
                },
                body: JSON.stringify(postBody)
            })

            if (!liRes.ok) {
                throw new Error(await liRes.text())
            }

            const data = await liRes.json()

            // 3. Update Status
            updatePostStatus(post.id, 'PUBLISHED', { id: data.id })
            results.push({ id: post.id, status: 'PUBLISHED', externalId: data.id })

        } catch (error) {
            console.error(`Failed to publish post ${post.id}:`, error)
            updatePostStatus(post.id, 'FAILED', { error: String(error) })
            results.push({ id: post.id, status: 'FAILED', error: String(error) })
        }
    }

    return NextResponse.json({ processed: results, count: results.length })
}
