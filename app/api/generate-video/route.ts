import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getBestMatchVideo } from '@/lib/pexels/client'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { GenerateVideoSchema, validateBody } from '@/lib/validations'

export async function POST(request: Request) {
    // Rate limit: AI endpoint (expensive)
    const ip = getClientIp(request)
    const rateCheck = checkRateLimit(`generate-video:${ip}`, RATE_LIMITS.ai)
    if (!rateCheck.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait before generating another video.' },
            {
                status: 429,
                headers: { 'Retry-After': String(rateCheck.resetIn) },
            }
        )
    }

    try {
        const body = await request.json()

        // Validate input
        const validation = validateBody(GenerateVideoSchema, body)
        if (!validation.success) return (validation as any).response

        const { topic, style, useVoiceover } = validation.data

        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing Groq API Key' }, { status: 500 })
        }

        // Initialize Groq Client
        const groq = new Groq({ apiKey })

        let prompt = '';

        if (style === 'motion') {
            prompt = `
            You are a professional motion graphics designer. Create a 4-scene Kinetic Typography video script about: "${topic}".
            
            For each scene, provide:
            1. Title (1-3 words).
            2. Subtitle (short sentence).
            3. A specific Lucide-React icon name that matches the concept (e.g., "rocket", "zap", "shield", "globe", "chart", "star", "award", "trend", "idea").
            4. A modern Hex color code for the scene accent (e.g., "#3b82f6").
            5. Duration (3-5s).

            Return ONLY a JSON array of objects with keys: "title", "subtitle", "iconName", "primaryColor", "duration".
            DO NOT include markdown.
            
            Example:
            [{"title":"GROWTH","subtitle":"Scale faster than ever.","iconName":"trend","primaryColor":"#10b981","duration":4}]
            `;
        } else if (style === 'cinematic') {
            prompt = `
            You are a Creative Director for a high-end Super Bowl commercial. Create a 5-scene high-energy video script about: "${topic}".
            
            Style Guidelines:
            - Pacing: Ultra-fast (2-3 seconds per scene).
            - Copy: Impactful, 1-3 word headlines. Deep, confident, minimal. No long sentences.
            - Visuals: Cinematic, moody, premium.
            
            For each scene, provide:
            1. Title (1-3 words MAX, uppercase).
            2. Subtitle (very short, punchy).
            3. A visual search query for a 'Cinematic' or 'Dark Mode' stock video (e.g., "cinematic city night", "neon abstract", "luxury meeting").
            4. Duration (2-3s).

            Return ONLY a JSON array of objects with keys: "title", "subtitle", "visualQuery", "duration".
            DO NOT include markdown.

            Example:
            [
                {"title": "UNLEASH", "subtitle": "Power beyond limits.", "visualQuery": "cinematic lightning storm dark", "duration": 2},
                {"title": "DOMINATE", "subtitle": "Own your market.", "visualQuery": "luxury skyscraper night drone", "duration": 3}
            ]
            `;
        } else {
            prompt = `
            You are a professional video producer. Create a 4-scene video script about: "${topic}".
            
            For each scene, provide:
            1. A punchy, short title (2-3 words max).
            2. A subtitle/script line (1 sentence, max 10 words).
            3. A visual search query to find a relevant stock video background.
            4. Estimated duration in seconds (3-5s).

            Return ONLY a JSON array of objects with keys: "title", "subtitle", "visualQuery", "duration".
            DO NOT include any markdown formatting (like \`\`\`json). Just the raw JSON string.

            Example:
            [
                {"title": "FUTURE TECH", "subtitle": "AI travels faster than light.", "visualQuery": "futuristic data center", "duration": 4}
            ]
            `;
        }

        // Call Groq API (Llama 3 70B is fast and great at JSON)
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
        });

        const responseText = completion.choices[0]?.message?.content || '';

        // Clean up markdown if model outputs it
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        let scriptData;
        try {
            scriptData = JSON.parse(cleanJson);
        } catch (e) {
            console.error('Failed to parse Groq JSON:', cleanJson);
            throw new Error('AI generated invalid JSON');
        }

        // Process scenes and fetch assets
        const scenes = await Promise.all(scriptData.map(async (scene: any) => {
            let videoUrl = undefined
            let imageUrl = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2560' // Fallback image

            if ((style === 'stock' || style === 'cinematic') && scene.visualQuery) {
                const stockVideo = await getBestMatchVideo(scene.visualQuery);
                if (stockVideo) {
                    videoUrl = stockVideo;
                }
            }

            return {
                textTitle: scene.title,
                textSubtitle: scene.subtitle,
                durationInSeconds: scene.duration,
                imageUrl: imageUrl, // required prop
                videoUrl: videoUrl,
                voiceoverUrl: useVoiceover ? 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' : undefined,

                // Motion Graphics Props
                iconName: scene.iconName,
                primaryColor: scene.primaryColor
            }
        }))

        return NextResponse.json({ scenes })

    } catch (error) {
        console.error('Error generating video:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate video' },
            { status: 500 }
        )
    }
}
