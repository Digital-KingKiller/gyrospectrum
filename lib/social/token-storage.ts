import fs from 'fs'
import path from 'path'

const TOKEN_FILE = path.join(process.cwd(), 'social-tokens.json')

interface TokenData {
    accessToken: string
    expiresAt: number // timestamp
    refreshToken?: string
    scope?: string
}

type TokenStore = Record<string, TokenData>

function readStore(): TokenStore {
    if (!fs.existsSync(TOKEN_FILE)) {
        return {}
    }
    try {
        const content = fs.readFileSync(TOKEN_FILE, 'utf-8')
        return JSON.parse(content)
    } catch (e) {
        console.error('Failed to read token store:', e)
        return {}
    }
}

function writeStore(store: TokenStore) {
    try {
        fs.writeFileSync(TOKEN_FILE, JSON.stringify(store, null, 2))
    } catch (e) {
        console.error('Failed to write token store:', e)
    }
}

export function saveToken(platform: string, token: string, expiresInSeconds: number = 3600 * 24 * 60) {
    const store = readStore()
    const expiresAt = Date.now() + (expiresInSeconds * 1000)

    store[platform] = {
        accessToken: token,
        expiresAt
    }
    writeStore(store)
}

export function getToken(platform: string): string | null {
    const store = readStore()
    const data = store[platform]

    if (!data) return null

    if (Date.now() > data.expiresAt) {
        console.log(`Token for ${platform} expired`)
        return null
    }

    return data.accessToken
}

export function hasValidToken(platform: string): boolean {
    return !!getToken(platform)
}
