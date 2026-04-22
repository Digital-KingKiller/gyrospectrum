'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
    Search,
    ExternalLink,
    TrendingUp,
    Target,
    Sparkles,
    RefreshCw,
    Trash2
} from 'lucide-react'
import type { Competitor } from '@/types/database'
import DeleteModal from '@/components/DeleteModal'
import AddCompetitorModal from '@/components/AddCompetitorModal'

export default function CompetitorsPage() {
    const [competitors, setCompetitors] = useState<Competitor[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Add Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    useEffect(() => {
        loadCompetitors()
    }, [])

    async function loadCompetitors() {
        try {
            const { data, error } = await supabase
                .from('competitors')
                .select('*')
                .order('sentiment_score', { ascending: false })

            if (error) throw error
            setCompetitors(data || [])
        } catch (error) {
            console.error('Error loading competitors:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        try {
            const { error } = await supabase
                .from('competitors')
                .delete()
                .eq('id', deleteId)

            if (error) throw error

            setCompetitors(competitors.filter(c => c.id !== deleteId))
            setDeleteId(null)
        } catch (error) {
            console.error('Error deleting competitor:', error)
            alert('Failed to delete competitor')
        } finally {
            setIsDeleting(false)
        }
    }

    const filteredCompetitors = competitors.filter(comp =>
        comp.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getTypeColor = (type: string) => {
        return type === 'direct' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
    }

    const getSentimentColor = (score: number) => {
        if (score >= 0.7) return 'text-green-600'
        if (score >= 0.5) return 'text-yellow-600'
        return 'text-red-600'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Competitor"
                message="Are you sure you want to remove this competitor? All analysis data will be permanently deleted."
                isDeleting={isDeleting}
            />

            <AddCompetitorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={loadCompetitors}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Competitors</h2>
                    <p className="text-slate-600 mt-1">Analyze and track your competition</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Sparkles className="w-5 h-5" />
                    Analyze New
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search competitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Total Competitors</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{competitors.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Direct Competitors</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                        {competitors.filter(c => c.competitor_type === 'direct').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Avg. Sentiment</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {(competitors.reduce((acc, c) => acc + (c.sentiment_score || 0), 0) / competitors.length || 0).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Competitors Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCompetitors.length === 0 ? (
                    <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <Target className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">No competitors analyzed yet</p>
                        <p className="text-slate-400 text-sm mt-2">Click "Analyze New" to get started</p>
                    </div>
                ) : (
                    filteredCompetitors.map((competitor) => (
                        <div
                            key={competitor.id}
                            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative"
                        >
                            {/* Delete Button (absolute top right) */}
                            <button
                                onClick={() => setDeleteId(competitor.id)}
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete Competitor"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>

                            {/* Header */}
                            <div className="flex items-start justify-between mb-4 pr-10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold text-slate-800">{competitor.name}</h3>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getTypeColor(competitor.competitor_type || 'indirect')}`}>
                                            {competitor.competitor_type || 'indirect'}
                                        </span>
                                    </div>
                                    {competitor.website_url && (
                                        <a
                                            href={competitor.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                                        >
                                            {competitor.website_url}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                                {competitor.sentiment_score !== null && (
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className={`w-5 h-5 ${getSentimentColor(competitor.sentiment_score)}`} />
                                        <span className={`text-lg font-bold ${getSentimentColor(competitor.sentiment_score)}`}>
                                            {(competitor.sentiment_score * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Success Factors */}
                            {competitor.success_factors && competitor.success_factors.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Success Factors</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {competitor.success_factors.slice(0, 3).map((factor, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"
                                            >
                                                {factor}
                                            </span>
                                        ))}
                                        {competitor.success_factors.length > 3 && (
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                                +{competitor.success_factors.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Techniques */}
                            {competitor.techniques && competitor.techniques.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Marketing Techniques</h4>
                                    <div className="space-y-1">
                                        {competitor.techniques.slice(0, 3).map((technique, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                                <span>{technique}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <RefreshCw className="w-3 h-3" />
                                    <span>
                                        Last analyzed {new Date(competitor.last_analyzed_at || competitor.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                    View Details →
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
