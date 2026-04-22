import { NextResponse } from 'next/server'

/**
 * Server-side video rendering endpoint.
 *
 * IMPORTANT: Remotion's server-side rendering requires heavy native dependencies
 * (Chromium, ffmpeg) that are not available on Netlify/Vercel serverless functions.
 *
 * For production, use one of these alternatives:
 * - Remotion Lambda (AWS) — recommended
 * - Remotion Cloud Run (GCP)
 * - Self-hosted render server (Docker)
 *
 * For now, this endpoint returns a clear message directing users to the
 * client-side preview (which works everywhere).
 */

export const maxDuration = 300 // 5 minute timeout (for future use)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { scenes, style } = body

        if (!scenes || !Array.isArray(scenes)) {
            return NextResponse.json({ error: 'Invalid scenes data' }, { status: 400 })
        }

        // Check if we're in a serverless environment (Netlify/Vercel)
        const isServerless = !!(process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

        if (isServerless) {
            return NextResponse.json({
                success: false,
                error: 'Server-side rendering is not available in serverless environments.',
                message: 'Use the in-browser preview player to view your video. For MP4 export, a dedicated render server is required.',
                alternatives: [
                    'Use the in-browser preview (already available)',
                    'Set up Remotion Lambda for cloud rendering',
                    'Deploy a dedicated render service',
                ],
                preview: {
                    scenes,
                    style,
                    playerUrl: '/dashboard/video',
                },
            }, { status: 422 })
        }

        // Local/self-hosted rendering path
        // Dynamic imports to avoid bundling heavy deps in serverless
        const { bundle } = await import('@remotion/bundler')
        const { renderMedia, selectComposition } = await import('@remotion/renderer')
        const path = await import('path')
        const fs = await import('fs')
        const os = await import('os')

        let compositionId = 'Slideshow'
        if (style === 'motion') compositionId = 'Motion'
        else if (style === 'cinematic') compositionId = 'Cinematic'

        console.log('Bundling Remotion project...')
        const bundleLocation = await bundle({
            entryPoint: path.join(process.cwd(), 'app', 'remotion', 'index.ts'),
            webpackOverride: (config: any) => config,
        })

        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps: {
                scenes,
                audioUrl: body.audioUrl,
                primaryColor: '#2563eb',
            },
        })

        const tmpDir = os.tmpdir()
        const outputLocation = path.join(tmpDir, `out-${Date.now()}.mp4`)

        console.log('Rendering video...')
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation,
            inputProps: {
                scenes,
                audioUrl: body.audioUrl,
                primaryColor: '#2563eb',
            },
            timeoutInMilliseconds: 120000,
        })

        const fileBuffer = fs.readFileSync(outputLocation)
        fs.unlink(outputLocation, () => { })

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="gyrospectrum-${style}-${Date.now()}.mp4"`,
            },
        })

    } catch (error) {
        console.error('Rendering error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Video rendering failed' },
            { status: 500 }
        )
    }
}
