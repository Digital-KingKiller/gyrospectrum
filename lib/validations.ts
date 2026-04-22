/**
 * Centralized Zod validation schemas for all API endpoints.
 * Import these in route handlers for consistent input validation.
 */

import { z } from 'zod'

// ============================================
// AI Endpoints
// ============================================

export const GeneratePostSchema = z.object({
    topic: z.string().min(1, 'Topic is required').max(500),
    tone: z.enum(['professional', 'casual', 'friendly', 'authoritative']).optional().default('professional'),
    platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'tiktok']).optional().default('linkedin'),
})

export const QualifyLeadSchema = z.object({
    leadId: z.string().uuid('Invalid lead ID'),
})

export const AnalyzeCompetitorSchema = z.object({
    name: z.string().max(255).optional(),
    url: z.string().url('Invalid URL').optional(),
}).refine((data) => data.name || data.url, {
    message: 'Either name or url is required',
})

// ============================================
// Video Endpoints
// ============================================

export const GenerateVideoSchema = z.object({
    topic: z.string().min(1, 'Topic is required').max(500),
    style: z.enum(['stock', 'motion', 'cinematic']).optional().default('stock'),
    useVoiceover: z.boolean().optional().default(false),
})

// ============================================
// Automation Endpoint
// ============================================

export const AutomationSchema = z.object({
    email: z.string().email('Valid email is required'),
    name: z.string().max(255).optional(),
    leadScore: z.number().min(0).max(100).optional().default(0),
})

// ============================================
// Business Endpoint
// ============================================

export const CreateBusinessSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().min(1, 'Description is required').max(5000),
    industry: z.string().max(100).optional(),
    target_audience: z.string().max(2000).optional(),
    brand_voice: z.enum(['professional', 'casual', 'friendly', 'authoritative']).optional().default('professional'),
})

// ============================================
// Lead Reply Endpoint
// ============================================

export const LeadReplySchema = z.object({
    leadId: z.string().uuid('Invalid lead ID'),
})

// ============================================
// Social Endpoints
// ============================================

export const SchedulePostSchema = z.object({
    content: z.string().min(1).max(5000),
    platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram']),
    scheduledFor: z.string().datetime().optional(),
    businessId: z.string().uuid().optional(),
})

// ============================================
// Helper: Validate and return parsed data or error response
// ============================================

import { NextResponse } from 'next/server'

export function validateBody<T>(
    schema: z.ZodSchema<T>,
    body: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
    const result = schema.safeParse(body)

    if (!result.success) {
        return {
            success: false,
            response: NextResponse.json(
                {
                    error: 'Validation failed',
                    details: result.error.flatten().fieldErrors,
                },
                { status: 400 }
            ),
        }
    }

    return { success: true, data: result.data }
}
