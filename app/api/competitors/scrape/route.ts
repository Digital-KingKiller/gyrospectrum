import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: Request) {
    try {
        const { url } = await request.json()

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        // Validate URL format
        let parsedUrl: URL
        try {
            parsedUrl = new URL(url)
        } catch {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
        }

        // Fetch the webpage
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`)
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Extract metadata
        const title = $('title').text().trim() ||
            $('meta[property="og:title"]').attr('content') ||
            $('h1').first().text().trim() ||
            'Unknown'

        const description = $('meta[name="description"]').attr('content') ||
            $('meta[property="og:description"]').attr('content') ||
            $('p').first().text().trim().substring(0, 200) ||
            ''

        const keywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || []

        // Extract social links
        const socialLinks: Record<string, string> = {}
        $('a[href*="linkedin.com"]').first().each((_, el) => {
            socialLinks.linkedin = $(el).attr('href') || ''
        })
        $('a[href*="twitter.com"], a[href*="x.com"]').first().each((_, el) => {
            socialLinks.twitter = $(el).attr('href') || ''
        })
        $('a[href*="facebook.com"]').first().each((_, el) => {
            socialLinks.facebook = $(el).attr('href') || ''
        })
        $('a[href*="instagram.com"]').first().each((_, el) => {
            socialLinks.instagram = $(el).attr('href') || ''
        })

        // Extract pricing indicators
        const pricingKeywords = ['pricing', 'price', 'cost', 'plan', 'subscription', 'free trial']
        const hasPricingPage = pricingKeywords.some(keyword =>
            $(`a[href*="${keyword}"]`).length > 0 ||
            html.toLowerCase().includes(keyword)
        )

        // Extract tech indicators
        const techStack: string[] = []
        if (html.includes('react') || html.includes('React')) techStack.push('React')
        if (html.includes('next') || html.includes('Next.js')) techStack.push('Next.js')
        if (html.includes('vue') || html.includes('Vue')) techStack.push('Vue')
        if (html.includes('angular') || html.includes('Angular')) techStack.push('Angular')
        if (html.includes('wordpress') || html.includes('WordPress')) techStack.push('WordPress')
        if (html.includes('shopify') || html.includes('Shopify')) techStack.push('Shopify')

        // Count pages/features
        const internalLinks = $('a[href^="/"]').length
        const externalLinks = $('a[href^="http"]').not(`a[href*="${parsedUrl.hostname}"]`).length

        return NextResponse.json({
            success: true,
            data: {
                url: parsedUrl.href,
                domain: parsedUrl.hostname,
                title,
                description,
                keywords,
                socialLinks,
                hasPricingPage,
                techStack,
                metrics: {
                    internalLinks,
                    externalLinks
                },
                scrapedAt: new Date().toISOString()
            }
        })

    } catch (error: any) {
        console.error('Scraper Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to scrape website' },
            { status: 500 }
        )
    }
}
