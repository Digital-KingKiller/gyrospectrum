/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Uses a sliding window approach with automatic cleanup.
 *
 * For production at scale, swap this for Upstash Ratelimit
 * or Redis-backed solution. This works perfectly for MVP.
 */

interface RateLimitEntry {
    count: number
    resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}, 5 * 60 * 1000)

interface RateLimitConfig {
    /** Max requests allowed in the window */
    maxRequests: number
    /** Window duration in seconds */
    windowSeconds: number
}

interface RateLimitResult {
    success: boolean
    remaining: number
    resetIn: number // seconds until reset
}

/**
 * Check rate limit for a given identifier (IP, user ID, etc.)
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now()
    const windowMs = config.windowSeconds * 1000
    const existing = rateLimitStore.get(identifier)

    if (!existing || now > existing.resetTime) {
        // First request or window expired — create new entry
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs,
        })
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowSeconds,
        }
    }

    if (existing.count >= config.maxRequests) {
        // Rate limited
        const resetIn = Math.ceil((existing.resetTime - now) / 1000)
        return {
            success: false,
            remaining: 0,
            resetIn,
        }
    }

    // Increment
    existing.count++
    const resetIn = Math.ceil((existing.resetTime - now) / 1000)
    return {
        success: true,
        remaining: config.maxRequests - existing.count,
        resetIn,
    }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    return request.headers.get('x-real-ip') || 'unknown'
}

// Pre-configured rate limit profiles
export const RATE_LIMITS = {
    /** Public endpoints: 10 req/min */
    public: { maxRequests: 10, windowSeconds: 60 },
    /** AI endpoints: 5 req/min (expensive API calls) */
    ai: { maxRequests: 5, windowSeconds: 60 },
    /** Auth endpoints: 5 req/min */
    auth: { maxRequests: 5, windowSeconds: 60 },
    /** Webhook endpoints: 30 req/min */
    webhook: { maxRequests: 30, windowSeconds: 60 },
} as const
