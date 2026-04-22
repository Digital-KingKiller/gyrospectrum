import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: {
        default: 'GyroSpectrum - AI Marketing & Sales Automation',
        template: '%s | GyroSpectrum',
    },
    description: 'Autonomous AI-powered marketing platform that analyzes competitors, generates branded content, posts to social media, and closes deals automatically.',
    keywords: ['AI marketing', 'marketing automation', 'competitor analysis', 'content generation', 'social media automation', 'lead qualification', 'sales automation'],
    authors: [{ name: 'GyroSpectrum' }],
    creator: 'GyroSpectrum',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        siteName: 'GyroSpectrum',
        title: 'GyroSpectrum - AI Marketing & Sales Automation',
        description: 'From competitor analysis to closed deals — all on autopilot.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'GyroSpectrum - AI Marketing & Sales Automation',
        description: 'From competitor analysis to closed deals — all on autopilot.',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    )
}
