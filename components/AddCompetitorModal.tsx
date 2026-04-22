'use client'

import { useState } from 'react'
import { X, Sparkles, Globe, Search, Loader2 } from 'lucide-react'

interface AddCompetitorModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddCompetitorModal({ isOpen, onClose, onSuccess }: AddCompetitorModalProps) {
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [error, setError] = useState('')
    const [status, setStatus] = useState('')

    if (!isOpen) return null

    const handleAnalyze = async () => {
        if (!name && !url) {
            setError('Please enter a name or URL')
            return
        }

        setIsAnalyzing(true)
        setError('')
        setStatus('Scraping website...')

        try {
            setStatus('Analyzing with AI...')

            const response = await fetch('/api/competitors/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, url }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze')
            }

            setStatus('Complete!')
            setTimeout(() => {
                onSuccess()
                onClose()
                setName('')
                setUrl('')
                setStatus('')
            }, 500)

        } catch (err: any) {
            console.error('Analysis failed:', err)
            setError(err.message || 'Failed to analyze competitor')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Analyze Competitor</h3>
                            <p className="text-sm text-slate-500">AI-powered market intelligence</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isAnalyzing}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    {isAnalyzing && status && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {status}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Competitor Name
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. HubSpot"
                                disabled={isAnalyzing}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Website URL <span className="text-blue-500">(Recommended)</span>
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://hubspot.com"
                                disabled={isAnalyzing}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Providing a URL enables real-time website scraping for deeper insights.
                        </p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 text-sm">
                        <p className="flex items-center gap-2 font-medium text-blue-800 mb-2">
                            <Sparkles className="w-4 h-4" />
                            What you'll get:
                        </p>
                        <ul className="grid grid-cols-2 gap-1 text-blue-700">
                            <li>✓ Competitor Type</li>
                            <li>✓ Threat Level</li>
                            <li>✓ Success Factors</li>
                            <li>✓ Techniques Used</li>
                            <li>✓ SWOT Analysis</li>
                            <li>✓ Tech Stack</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        disabled={isAnalyzing}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || (!name && !url)}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Analyze Now
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
