'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
    Search,
    Filter,
    Mail,
    Phone,
    MessageSquare,
    Star,
    Download,
    Trash2,
    Send,
    Zap
} from 'lucide-react'
import type { Lead } from '@/types/database'
import DeleteModal from '@/components/DeleteModal'

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Auto-Reply State
    const [sendingReply, setSendingReply] = useState<string | null>(null)

    useEffect(() => {
        loadLeads()
    }, [])

    async function loadLeads() {
        try {
            let query = supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter)
            }

            const { data, error } = await query

            if (error) throw error
            setLeads(data || [])
        } catch (error) {
            console.error('Error loading leads:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', deleteId)

            if (error) throw error

            setLeads(leads.filter(l => l.id !== deleteId))
            setDeleteId(null)
        } catch (error) {
            console.error('Error deleting lead:', error)
            alert('Failed to delete lead')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleExport = () => {
        const headers = ['Name', 'Email', 'Phone', 'Status', 'Score', 'Platform', 'Created At']
        const csvContent = [
            headers.join(','),
            ...leads.map(lead => [
                `"${lead.name || ''}"`,
                `"${lead.email || ''}"`,
                `"${lead.phone || ''}"`,
                lead.status,
                lead.qualification_score,
                lead.source_platform,
                new Date(lead.created_at).toLocaleDateString()
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const filteredLeads = leads.filter(lead =>
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            new: 'bg-blue-100 text-blue-700',
            contacted: 'bg-yellow-100 text-yellow-700',
            qualified: 'bg-green-100 text-green-700',
            converted: 'bg-purple-100 text-purple-700',
            lost: 'bg-red-100 text-red-700',
        }
        return colors[status] || 'bg-slate-100 text-slate-700'
    }

    const getScoreColor = (score: number) => {
        if (score >= 0.8) return 'text-green-600'
        if (score >= 0.5) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreBadge = (score: number | null) => {
        if (!score && score !== 0) return { label: 'Unscored', color: 'bg-slate-100 text-slate-600' }
        if (score >= 70) return { label: 'Hot 🔥', color: 'bg-red-100 text-red-700' }
        if (score >= 40) return { label: 'Warm', color: 'bg-yellow-100 text-yellow-700' }
        return { label: 'Cold', color: 'bg-blue-100 text-blue-700' }
    }

    const handleAutoReply = async (leadId: string) => {
        setSendingReply(leadId)
        try {
            const res = await fetch('/api/leads/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            alert(`Reply sent to ${data.to || 'lead'}!`)
            loadLeads() // Refresh to update status
        } catch (err: any) {
            alert(`Failed: ${err.message}`)
        } finally {
            setSendingReply(null)
        }
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
                title="Delete Lead"
                message="Are you sure you want to delete this lead? This action cannot be undone and will remove all associated history."
                isDeleting={isDeleting}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Leads</h2>
                    <p className="text-slate-600 mt-1">Manage and track your leads</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors bg-white font-medium"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value)
                            loadLeads()
                        }}
                        className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Total Leads</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{leads.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Qualified</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {leads.filter(l => l.status === 'qualified').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Converted</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                        {leads.filter(l => l.status === 'converted').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Avg. Score</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {(leads.reduce((acc, l) => acc + (l.qualification_score || 0), 0) / leads.length || 0).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Lead
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Source
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        No leads found matching your filters
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                                    {lead.name?.[0]?.toUpperCase() || 'L'}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-medium text-slate-800">{lead.name || 'Unnamed Lead'}</p>
                                                    <p className="text-sm text-slate-500">{lead.intent || 'No intent detected'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                {lead.email && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Mail className="w-4 h-4 text-slate-400" />
                                                        <span>{lead.email}</span>
                                                    </div>
                                                )}
                                                {lead.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Phone className="w-4 h-4 text-slate-400" />
                                                        <span>{lead.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                                                {lead.source_platform || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {(() => {
                                                const badge = getScoreBadge(lead.qualification_score)
                                                return (
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                                                        {badge.label}{lead.qualification_score ? ` (${lead.qualification_score})` : ''}
                                                    </span>
                                                )
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(lead.status || 'new')}`}>
                                                {lead.status || 'new'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {lead.email && (
                                                    <button
                                                        onClick={() => handleAutoReply(lead.id)}
                                                        disabled={sendingReply === lead.id}
                                                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:shadow-md transition-all disabled:opacity-50"
                                                        title="Send AI Auto-Reply"
                                                    >
                                                        {sendingReply === lead.id ? (
                                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <Zap className="w-3 h-3" />
                                                        )}
                                                        Auto-Reply
                                                    </button>
                                                )}
                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(lead.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Lead"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
