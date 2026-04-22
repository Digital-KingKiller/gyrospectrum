import fs from 'fs'
import path from 'path'

const POSTS_FILE = path.join(process.cwd(), 'scheduled-posts.json')

export interface ScheduledPost {
    id: string
    content: string
    scheduledFor: number // timestamp
    status: 'SCHEDULED' | 'PUBLISHED' | 'FAILED'
    authorUrn?: string
    platform: 'linkedin'
    result?: any
}

function readStore(): ScheduledPost[] {
    if (!fs.existsSync(POSTS_FILE)) {
        return []
    }
    try {
        const content = fs.readFileSync(POSTS_FILE, 'utf-8')
        return JSON.parse(content)
    } catch (e) {
        console.error('Failed to read posts store:', e)
        return []
    }
}

function writeStore(posts: ScheduledPost[]) {
    try {
        fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2))
    } catch (e) {
        console.error('Failed to write posts store:', e)
    }
}

export function savePost(post: ScheduledPost) {
    const posts = readStore()
    posts.push(post)
    writeStore(posts)
}

export function getDuePosts(): ScheduledPost[] {
    const posts = readStore()
    const now = Date.now()
    return posts.filter(p => p.status === 'SCHEDULED' && p.scheduledFor <= now)
}

export function updatePostStatus(id: string, status: 'PUBLISHED' | 'FAILED', result?: any) {
    const posts = readStore()
    const index = posts.findIndex(p => p.id === id)
    if (index !== -1) {
        posts[index].status = status
        posts[index].result = result
        writeStore(posts)
    }
}

export function getAllPosts(): ScheduledPost[] {
    return readStore().sort((a, b) => b.scheduledFor - a.scheduledFor)
}
