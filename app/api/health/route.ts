import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET() {
    const checks = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        checks: {} as Record<string, any>,
    }

    try {
        // Check environment variables
        const requiredEnvVars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'GOOGLE_GEMINI_API_KEY',
        ]

        const missingVars = requiredEnvVars.filter(v => !process.env[v])

        checks.checks.environment = {
            status: missingVars.length === 0 ? 'ok' : 'error',
            missing: missingVars,
        }

        // Check database connection
        try {
            const { error: dbError } = await supabaseAdmin
                .from('businesses')
                .select('id')
                .limit(1)

            checks.checks.database = {
                status: dbError ? 'error' : 'ok',
                error: dbError?.message,
            }
        } catch (error: any) {
            checks.checks.database = {
                status: 'error',
                error: error.message,
            }
        }

        // Check database tables
        const tables = [
            'businesses',
            'competitors',
            'content_templates',
            'social_posts',
            'leads',
            'conversations',
            'bookings',
        ]

        const tableChecks = await Promise.all(
            tables.map(async (table) => {
                try {
                    const { error } = await supabaseAdmin
                        .from(table as any)
                        .select('id')
                        .limit(1)

                    return {
                        table,
                        status: error ? 'error' : 'ok',
                        error: error?.message,
                    }
                } catch (error: any) {
                    return {
                        table,
                        status: 'error',
                        error: error.message,
                    }
                }
            })
        )

        const failedTables = tableChecks.filter(t => t.status === 'error')

        checks.checks.tables = {
            status: failedTables.length === 0 ? 'ok' : 'error',
            total: tables.length,
            healthy: tables.length - failedTables.length,
            failed: failedTables,
        }

        // Check AI service
        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai')
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
            const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })

            // Simple test generation
            const result = await model.generateContent('Say "ok"')
            const response = result.response.text()

            checks.checks.ai = {
                status: response ? 'ok' : 'error',
                model: 'gemini-2.0-flash-exp',
            }
        } catch (error: any) {
            checks.checks.ai = {
                status: 'error',
                error: error.message,
            }
        }

        // Overall status
        const allChecks = Object.values(checks.checks)
        const hasErrors = allChecks.some((check: any) => check.status === 'error')
        checks.status = hasErrors ? 'unhealthy' : 'healthy'

        return NextResponse.json(checks, {
            status: hasErrors ? 503 : 200,
        })
    } catch (error: any) {
        return NextResponse.json(
            {
                timestamp: new Date().toISOString(),
                status: 'error',
                error: error.message,
            },
            { status: 500 }
        )
    }
}
