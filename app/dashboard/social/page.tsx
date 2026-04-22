'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Linkedin, Check, AlertCircle, Send, Link as LinkIcon, ExternalLink, Building2, User, Sparkles, Calendar, Clock } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface Organization {
    urn: string
    name: string
}

interface ScheduledPost {
    id: string
    content: string
    scheduledFor: number
    status: string
    platform: string
}

function SocialPageContent() {
    const searchParams = useSearchParams()
    const [isConnected, setIsConnected] = useState(false)
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [selectedUrn, setSelectedUrn] = useState<string>('')

    // Post State
    const [postText, setPostText] = useState('')
    const [postUrl, setPostUrl] = useState('')
    const [isPosting, setIsPosting] = useState(false)
    const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null)

    // Automation State
    const [isGenerating, setIsGenerating] = useState(false)
    const [topic, setTopic] = useState('')
    const [showAiModal, setShowAiModal] = useState(false)
    const [scheduleDate, setScheduleDate] = useState('')
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])

    useEffect(() => {
        if (searchParams.get('connected') === 'linkedin') {
            setIsConnected(true)
            fetchOrganizations()
            fetchScheduledPosts()
        }
    }, [searchParams])

    const fetchOrganizations = async () => {
        try {
            const res = await fetch('/api/social/linkedin/organizations')
            if (res.ok) {
                const data = await res.json()
                setOrganizations(data.organizations || [])
            }
        } catch (error) {
            console.error('Failed to fetch orgs:', error)
        }
    }

    const fetchScheduledPosts = async () => {
        try {
            const res = await fetch('/api/social/schedule')
            if (res.ok) {
                const data = await res.json()
                setScheduledPosts(data.posts || [])
            }
        } catch (error) {
            console.error('Failed to fetch scheduled posts:', error)
        }
    }

    const handleConnect = () => {
        window.location.href = '/api/auth/linkedin/init'
    }

    const handleGenerateAi = async () => {
        if (!topic) return
        setIsGenerating(true)
        try {
            const res = await fetch('/api/ai/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, tone: 'Professional', platform: 'LinkedIn' })
            })
            const data = await res.json()
            if (data.content) {
                // Combine content and hashtags
                const fullText = `${data.content}\n\n${(data.hashtags || []).join(' ')}`
                setPostText(fullText)
                setShowAiModal(false)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleAction = async () => {
        if (!postText) return
        setIsPosting(true)
        setLastResult(null)

        const isScheduling = !!scheduleDate

        try {
            const endpoint = isScheduling ? '/api/social/schedule' : '/api/social/linkedin/post'
            const body = {
                text: postText,
                url: postUrl || undefined,
                authorUrn: selectedUrn || undefined,
                scheduledFor: scheduleDate || undefined,
                platform: 'linkedin'
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to action')
            }

            const actionVerb = isScheduling ? 'Scheduled' : 'Posted'
            setLastResult({ success: true, message: `Successfully ${actionVerb}! ID: ${data.id || data.post?.id}` })

            if (isScheduling) {
                setScheduleDate('')
                fetchScheduledPosts()
            }
            setPostText('')
            setPostUrl('')
        } catch (error) {
            setLastResult({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setIsPosting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <Linkedin className="w-8 h-8 text-blue-700" />
                    Social Integration
                </h2>
                <p className="text-slate-600 mt-2 text-lg">
                    Manage your LinkedIn presence with AI superpowers.
                </p>
            </div>

            {/* Connection Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Linkedin className="w-8 h-8 text-blue-700" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">LinkedIn</h3>
                            <p className="text-slate-500">Connect to Personal Profile & Pages</p>
                        </div>
                    </div>
                    <div>
                        {isConnected ? (
                            <div className="flex gap-2">
                                <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                                    <Check className="w-4 h-4" />
                                    Connected
                                </span>
                                <button
                                    onClick={handleConnect}
                                    className="px-4 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    Reconnect
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleConnect}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-md hover:shadow-lg"
                            >
                                <LinkIcon className="w-4 h-4" />
                                Connect Account
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Interface */}
                {isConnected && (
                    <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* 1. Identity Selector (Only show if orgs exist) */}
                        {organizations.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-600 mb-2">Post As</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setSelectedUrn('')}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedUrn === ''
                                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                            : 'bg-white border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-slate-700">My Profile</span>
                                    </div>

                                    {organizations.map(org => (
                                        <div
                                            key={org.urn}
                                            onClick={() => setSelectedUrn(org.urn)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedUrn === org.urn
                                                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-medium text-slate-700 truncate">{org.name}</p>
                                                <p className="text-xs text-slate-500 truncate">Organization</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. Composer */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-slate-600">Message</label>
                                    <button
                                        onClick={() => setShowAiModal(!showAiModal)}
                                        className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Generate with AI
                                    </button>
                                </div>

                                {/* AI Input Area (Conditional) */}
                                {showAiModal && (
                                    <div className="mb-4 p-4 bg-purple-50 rounded-xl border border-purple-100 animate-in fade-in zoom-in-95">
                                        <label className="block text-xs font-bold text-purple-700 uppercase mb-2">What should the post be about?</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                placeholder="e.g. Launching our new eco-friendly product..."
                                                className="flex-1 px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                            <button
                                                onClick={handleGenerateAi}
                                                disabled={!topic || isGenerating}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                                            >
                                                {isGenerating ? 'Thinking...' : 'Generate'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <textarea
                                    value={postText}
                                    onChange={(e) => setPostText(e.target.value)}
                                    placeholder={`What do you want to post?`}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Link (Optional)</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={postUrl}
                                            onChange={(e) => setPostUrl(e.target.value)}
                                            placeholder="https://example.com"
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl"
                                        />
                                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Schedule (Optional)</label>
                                    <div className="relative">
                                        <input
                                            type="datetime-local"
                                            value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                {lastResult && (
                                    <div className={`flex items-center gap-2 text-sm ${lastResult.success ? 'text-green-600' : 'text-red-600'}`}>
                                        {lastResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {lastResult.message}
                                    </div>
                                )}

                                <button
                                    onClick={handleAction}
                                    disabled={!postText || isPosting}
                                    className={`ml-auto px-8 py-3 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 ${scheduleDate ? 'bg-orange-600 hover:bg-orange-700' : 'bg-slate-800 hover:bg-slate-900'
                                        }`}
                                >
                                    {isPosting ? 'Processing...' : (scheduleDate ? 'Schedule Post' : 'Post Now')}
                                    {scheduleDate ? <Clock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Scheduled Posts List */}
            {scheduledPosts.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Scheduled Queue
                    </h3>
                    <div className="space-y-3">
                        {scheduledPosts.filter(p => p.status === 'SCHEDULED').map(post => (
                            <div key={post.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-start">
                                <div>
                                    <p className="text-slate-800 font-medium line-clamp-2">{post.content}</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Scheduled for: {new Date(post.scheduledFor).toLocaleString()}
                                    </p>
                                </div>
                                <div className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                    PENDING
                                </div>
                            </div>
                        ))}
                        {scheduledPosts.filter(p => p.status === 'SCHEDULED').length === 0 && (
                            <p className="text-slate-500 italic">No pending scheduled posts.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function SocialPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center p-12"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>}>
            <SocialPageContent />
        </Suspense>
    )
}
