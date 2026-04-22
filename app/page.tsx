'use client'

import { useState } from 'react'
import { Sparkles, TrendingUp, Zap, Target, MessageSquare, Calendar } from 'lucide-react'

export default function HomePage() {
    const [businessDescription, setBusinessDescription] = useState('')
    const [industry, setIndustry] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [results, setResults] = useState<any>(null)

    const handleAnalyze = async () => {
        if (!businessDescription.trim()) {
            alert('Please enter a business description')
            return
        }

        setIsAnalyzing(true)
        setResults(null)

        try {
            // First create a business record
            const businessResponse = await fetch('/api/business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'My Business', // You can make this an input field
                    description: businessDescription,
                    industry: industry || null,
                }),
            })

            if (!businessResponse.ok) {
                throw new Error('Failed to create business')
            }

            const { data: business } = await businessResponse.json()

            // Then analyze competitors
            const analyzeResponse = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business.id,
                    businessDescription,
                    industry,
                }),
            })

            if (!analyzeResponse.ok) {
                throw new Error('Failed to analyze competitors')
            }

            const analyzeData = await analyzeResponse.json()
            setResults(analyzeData.data)
        } catch (error: any) {
            console.error('Error:', error)
            alert(error.message || 'An error occurred')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-8 w-8 text-blue-600" />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                GyroSpectrum
                            </h1>
                        </div>
                        <nav className="hidden md:flex gap-6">
                            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900"> How It Works</a>
                            <a href="#demo" className="text-gray-600 hover:text-gray-900">Demo</a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <Zap className="h-4 w-4" />
                        AI-Powered Marketing Automation
                    </div>
                    <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        From Competitor Analysis to Closed Deals
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Enter your business description. Our AI analyzes competitors, generates branded content, posts to all social platforms, and closes sales automatically.
                    </p>

                    {/* Demo Form */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto" id="demo">
                        <h3 className="text-2xl font-bold mb-4">Try It Now</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                                    Business Description
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={4}
                                    placeholder="e.g., We provide IoT solutions for manufacturing companies to optimize their production lines and reduce downtime..."
                                    value={businessDescription}
                                    onChange={(e) => setBusinessDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                                    Industry (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., IoT, Manufacturing, SaaS"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Analyzing Competitors...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5" />
                                        Start Analysis
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Results */}
                        {results && (
                            <div className="mt-8 space-y-6">
                                <div className="text-left">
                                    <h4 className="text-lg font-bold mb-4">Discovered Competitors</h4>
                                    <div className="space-y-3">
                                        {results.competitors.map((comp: any, index: number) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h5 className="font-semibold">{comp.name}</h5>
                                                        <p className="text-sm text-gray-600">{comp.website_url}</p>
                                                        <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                            {comp.competitor_type}
                                                        </span>
                                                    </div>
                                                </div>
                                                {comp.success_factors.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-xs font-medium text-gray-700 mb-1">Success Factors:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {comp.success_factors.slice(0, 3).map((factor: string, i: number) => (
                                                                <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                                                    {factor}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {results.insights.length > 0 && (
                                    <div className="text-left">
                                        <h4 className="text-lg font-bold mb-4">Key Insights</h4>
                                        <ul className="space-y-2">
                                            {results.insights.map((insight: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <Target className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-gray-700">{insight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-600 mb-4">
                                        ✨ Analysis complete! Next steps: Generate branded content → Post to social media → Close sales
                                    </p>
                                    <div className="flex gap-3">
                                        <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                                            Generate Content
                                        </button>
                                        <button className="flex-1 border border-purple-600 text-purple-600 py-2 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
                                            View Dashboard
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-20" id="features">
                <h3 className="text-4xl font-bold text-center mb-12">Complete Automation Pipeline</h3>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <FeatureCard
                        icon={<TrendingUp className="h-8 w-8" />}
                        title="Competitor Analysis"
                        description="AI discovers and analyzes your competitors, extracting success factors and techniques"
                    />
                    <FeatureCard
                        icon={<Sparkles className="h-8 w-8" />}
                        title="Content Generation"
                        description="Generates branded content based on competitive insights, optimized for each platform"
                    />
                    <FeatureCard
                        icon={<Calendar className="h-8 w-8" />}
                        title="Multi-Platform Posting"
                        description="Automatically posts to Facebook, Instagram, LinkedIn, TikTok, and WhatsApp"
                    />
                    <FeatureCard
                        icon={<MessageSquare className="h-8 w-8" />}
                        title="AI Sales Agent"
                        description="Engages leads, qualifies prospects, and handles conversations 24/7"
                    />
                    <FeatureCard
                        icon={<Target className="h-8 w-8" />}
                        title="Lead Qualification"
                        description="AI scores lead quality and routes to appropriate booking flow"
                    />
                    <FeatureCard
                        icon={<Zap className="h-8 w-8" />}
                        title="Automated Closing"
                        description="Handles bookings for car washes, hotels, ISP connections, and more"
                    />
                </div>
            </section>

            {/* How It Works */}
            <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl" id="how-it-works">
                <h3 className="text-4xl font-bold text-center mb-12">How It Works</h3>
                <div className="max-w-4xl mx-auto space-y-6">
                    <Step number={1} title="Enter Business Description" description="Describe your business and target audience" />
                    <Step number={2} title="AI Analyzes Competitors" description="Discovers competitors and studies their strategies" />
                    <Step number={3} title="Generate Branded Content" description="Creates customized content with your branding" />
                    <Step number={4} title="Post to All Platforms" description="Schedules and publishes to all social media" />
                    <Step number={5} title="Capture & Qualify Leads" description="AI engages with inquiries and scores lead quality" />
                    <Step number={6} title="Close Sales Automatically" description="Handles bookings, payments, and confirmations" />
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-white mt-20">
                <div className="container mx-auto px-4 py-12 text-center text-gray-600">
                    <p>© 2026 GyroSpectrum. Powered by AI.</p>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                {icon}
            </div>
            <h4 className="text-xl font-bold mb-2">{title}</h4>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
    return (
        <div className="flex gap-4 items-start">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {number}
            </div>
            <div>
                <h4 className="text-lg font-bold mb-1">{title}</h4>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    )
}
