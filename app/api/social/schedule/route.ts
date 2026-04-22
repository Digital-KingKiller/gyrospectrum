import { NextResponse } from 'next/server'
import { savePost, ScheduledPost } from '@/lib/social/posts-storage'
// GET: Fetch all scheduled posts (for the UI list)
export async function GET() {
    const { getAllPosts } = await import('@/lib/social/posts-storage')
    return NextResponse.json({ posts: getAllPosts() })
}

// POST: Create a new scheduled post
export async function POST(request: Request) {
    try {
        const { text, scheduledFor, authorUrn, platform } = await request.json()

        if (!text || !scheduledFor) {
            return NextResponse.json({ error: 'Missing content or date' }, { status: 400 })
        }

        const newPost: ScheduledPost = {
            id: crypto.randomUUID(),
            content: text,
            scheduledFor: new Date(scheduledFor).getTime(),
            status: 'SCHEDULED',
            authorUrn,
            platform: platform || 'linkedin'
        }

        savePost(newPost)

        // Sync with Supabase Content Library
        try {
            const { createClient } = await import('@/lib/supabase/server')
            const supabase = await createClient()

            // Map hashtags from content (simple regex extraction)
            const hashtags = (text.match(/#[a-z0-9_]+/gi) || []).map((h: string) => h.substring(1))

            await (supabase.from('content_templates') as any).insert({
                title: `Scheduled Post (${new Date(scheduledFor).toLocaleDateString()})`,
                text_content: text,
                platform: platform || 'linkedin',
                status: 'pending', // Pending = Scheduled in this context
                hashtags,
                content_type: 'text',
                created_at: new Date().toISOString(),
                business_id: '00000000-0000-0000-0000-000000000000' // Default ID for local dev
            })
        } catch (dbError) {
            console.error('Failed to sync with DB:', dbError)
            // Function continues even if DB sync fails (robustness)
        }

        return NextResponse.json({ success: true, post: newPost })

    } catch (error) {
        console.error('Schedule Error:', error)
        return NextResponse.json(
            { error: 'Failed to schedule post' },
            { status: 500 }
        )
    }
}
