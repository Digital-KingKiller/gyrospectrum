'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import {
    Search,
    Filter,
    FileText,
    Image as ImageIcon,
    Video,
    Layers,
    Clock,
    Check,
    X,
    Eye,
    Trash2
} from 'lucide-react'
import CreatePostModal from '@/components/CreatePostModal'
import DeleteModal from '@/components/DeleteModal'

// Temporary fix for missing type or use any if type is strictly checked
type ContentTemplate = any


export default function ContentPage() {
    const [content, setContent] = useState<ContentTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [platformFilter, setPlatformFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    useEffect(() => {
        loadContent()
    }, [platformFilter, statusFilter])

    async function loadContent() {
        try {
            let query = supabase
                .from('content_templates')
                .select('*')
                .order('created_at', { ascending: false })

            if (platformFilter !== 'all') {
                query = query.eq('platform', platformFilter)
            }

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter)
            }

            const { data, error } = await query

            if (error) throw error
            setContent(data || [])
        } catch (error) {
            console.error('Error loading content:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        try {
            const { error } = await supabase
                .from('content_templates')
                .delete()
                .eq('id', deleteId)

            if (error) throw error

            setContent(content.filter(c => c.id !== deleteId))
            setDeleteId(null)
        } catch (error) {
            console.error('Error deleting content:', error)
            alert('Failed to delete content')
        } finally {
            setIsDeleting(false)
        }
    }

    const filteredContent = content.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.text_content?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-slate-100 text-slate-700',
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            published: 'bg-blue-100 text-blue-700',
            rejected: 'bg-red-100 text-red-700',
        }
        return colors[status] || 'bg-slate-100 text-slate-700'
    }

    const getStatusIcon = (status: string) => {
        if (status === 'approved' || status === 'published') return <Check className="w-4 h-4" />
        if (status === 'rejected') return <X className="w-4 h-4" />
        if (status === 'pending') return <Clock className="w-4 h-4" />
        return <FileText className="w-4 h-4" />
    }

    const getTypeIcon = (type: string) => {
        if (type === 'image') return <ImageIcon className="w-5 h-5" />
        if (type === 'video') return <Video className="w-5 h-5" />
        if (type === 'carousel') return <Layers className="w-5 h-5" />
        return <FileText className="w-5 h-5" />
    }

    const getPlatformColor = (platform: string) => {
        const colors: Record<string, string> = {
            facebook: 'bg-blue-100 text-blue-700',
            instagram: 'bg-pink-100 text-pink-700',
            linkedin: 'bg-indigo-100 text-indigo-700',
            tiktok: 'bg-slate-800 text-white',
            twitter: 'bg-sky-100 text-sky-700',
        }
        return colors[platform] || 'bg-slate-100 text-slate-700'
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
            <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Content"
                message="Are you sure you want to delete this content? This cannot be undone."
                isDeleting={isDeleting}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Content Library</h2>
                    <p className="text-slate-600 mt-1">Manage your AI-generated content</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/content/video"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm hover:shadow"
                    >
                        <Video className="w-5 h-5 text-pink-600" />
                        Create Video
                    </Link>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
                    >
                        <FileText className="w-5 h-5" />
                        Generate Post
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Platform Filter */}
                <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                    <option value="all">All Platforms</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter</option>
                </select>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Total Content</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{content.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Draft</p>
                    <p className="text-2xl font-bold text-slate-600 mt-1">
                        {content.filter(c => c.status === 'draft').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {content.filter(c => c.status === 'approved').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Published</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {content.filter(c => c.status === 'published').length}
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredContent.length === 0 ? (
                    <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">No content found</p>
                        <p className="text-slate-400 text-sm mt-2">Generate your first piece of content to get started</p>
                    </div>
                ) : (
                    filteredContent.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative"
                        >
                            {/* Delete Button (absolute top right) */}
                            <button
                                onClick={() => setDeleteId(item.id)}
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
                                title="Delete Content"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>

                            {/* Header */}
                            <div className="flex items-start justify-between mb-4 pr-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                        {getTypeIcon(item.content_type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{item.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getPlatformColor(item.platform)}`}>
                                                {item.platform}
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 capitalize ${getStatusColor(item.status || 'draft')}`}>
                                                {getStatusIcon(item.status || 'draft')}
                                                {item.status || 'draft'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Preview */}
                            <div className="mb-4">
                                <p className="text-sm text-slate-600 line-clamp-3">
                                    {item.text_content}
                                </p>
                            </div>

                            {/* Hashtags */}
                            {item.hashtags && item.hashtags.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {item.hashtags.slice(0, 5).map((tag, idx) => (
                                            <span key={idx} className="text-xs text-blue-600">
                                                #{tag}
                                            </span>
                                        ))}
                                        {item.hashtags.length > 5 && (
                                            <span className="text-xs text-slate-400">
                                                +{item.hashtags.length - 5} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            {item.call_to_action && (
                                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Call to Action</p>
                                    <p className="text-sm font-medium text-slate-700">{item.call_to_action}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                <span className="text-xs text-slate-500">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Eye className="w-4 h-4" />
                                        Preview
                                    </button>
                                    {item.status === 'draft' && (
                                        <button className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                            <Check className="w-4 h-4" />
                                            Approve
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
