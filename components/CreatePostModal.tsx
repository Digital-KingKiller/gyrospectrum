'use client'

import React, { useState } from 'react'
import { X, Sparkles, Calendar, Send, Loader2, Check, AlertCircle } from 'lucide-react'

interface CreatePostModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
    const [step, setStep] = useState<'generate' | 'review'>('generate')
    const [topic, setTopic] = useState('')
    const [tone, setTone] = useState('Professional')
    const [generatedContent, setGeneratedContent] = useState('')
    const [scheduleDate, setScheduleDate] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

    if (!isOpen) return null

    const handleGenerate = async () => {
        if (!topic) return
        setIsLoading(true)
        setResult(null)
        try {
            const res = await fetch('/api/ai/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, tone, platform: 'LinkedIn' })
            })
            const data = await res.json()
            if (data.content) {
                const fullText = `${data.content}\n\n${(data.hashtags || []).join(' ')}`
                setGeneratedContent(fullText)
                setStep('review')
            } else {
                throw new Error(data.error || 'No content generated')
            }
        } catch (error) {
            setResult({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to generate content'
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSchedule = async () => {
        if (!generatedContent) return
        setIsLoading(true)
        setResult(null)
        try {
            const endpoint = scheduleDate ? '/api/social/schedule' : '/api/social/linkedin/post'
            const body = {
                text: generatedContent,
                scheduledFor: scheduleDate || undefined,
                platform: 'linkedin'
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to process')

            setResult({
                success: true,
                message: scheduleDate ? 'Post scheduled successfully!' : 'Post published successfully!'
            })

            // Close after short delay on success
            setTimeout(() => {
                onClose()
                setStep('generate')
                setTopic('')
                setGeneratedContent('')
                setScheduleDate('')
                setResult(null)
            }, 1500)

        } catch (error) {
            setResult({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        {step === 'generate' ? (
                            <>
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                Create New Post
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 text-blue-600" />
                                Review & Schedule
                            </>
                        )}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {step === 'generate' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">What is this post about?</label>
                                <textarea
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. Announcing our new summer collection with sustainability focus..."
                                    className="w-full h-32 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                                >
                                    <option>Professional</option>
                                    <option>Casual</option>
                                    <option>Excited</option>
                                    <option>Witty</option>
                                    <option>Educational</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                                <textarea
                                    value={generatedContent}
                                    onChange={(e) => setGeneratedContent(e.target.value)}
                                    className="w-full h-48 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-medium"
                                />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Schedule (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    Leave blank to post immediately.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error/Success Message */}
                    {result && (
                        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {result.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {result.message}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    {step === 'generate' ? (
                        <button
                            onClick={handleGenerate}
                            disabled={!topic || isLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Generate Draft
                                </>
                            )}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep('generate')}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSchedule}
                                disabled={!generatedContent || isLoading}
                                className={`px-6 py-2.5 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${scheduleDate ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    scheduleDate ? 'Schedule Post' : 'Post Now'
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
