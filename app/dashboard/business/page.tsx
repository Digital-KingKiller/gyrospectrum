'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
    Building2,
    Users,
    Target,
    TrendingUp,
    Globe,
    Mail,
    Phone,
    MapPin,
    Edit
} from 'lucide-react'
import Link from 'next/link'
import type { Business } from '@/types/database'

export default function BusinessPage() {
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadBusiness()
    }, [])

    async function loadBusiness() {
        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .limit(1)
                .single()

            if (error) throw error
            setBusiness(data)
        } catch (error) {
            console.error('Error loading business:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!business) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">No business profile found</p>
                <p className="text-slate-400 text-sm mt-2">Create your business profile to get started</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Business Profile</h2>
                    <p className="text-slate-600 mt-1">View and manage your business information</p>
                </div>
                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Edit className="w-5 h-5" />
                    Edit Profile
                </Link>
            </div>

            {/* Business Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Building2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{business.name}</h3>
                            <p className="text-blue-100 mt-1">{business.industry || 'No industry specified'}</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
                        Active
                    </span>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Description */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Description</h3>
                    <p className="text-slate-600 leading-relaxed">
                        {business.description || 'No description provided'}
                    </p>
                </div>

                {/* Value Proposition */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Unique Value Proposition</h3>
                    <p className="text-slate-600 leading-relaxed">
                        {business.unique_value_proposition || 'Not specified'}
                    </p>
                </div>

                {/* Target Audience */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-100">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Target Audience</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        {business.target_audience || 'Not specified'}
                    </p>
                </div>

                {/* Brand Voice */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Brand Voice</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium capitalize">
                            {business.brand_voice || 'professional'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Automation Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Automation Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border ${business.auto_post_enabled ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-800">Auto-Post Content</p>
                                <p className="text-sm text-slate-500 mt-1">Automatically publish approved content</p>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${business.auto_post_enabled ? 'bg-green-100' : 'bg-slate-200'}`}>
                                {business.auto_post_enabled ? (
                                    <TrendingUp className={`w-6 h-6 ${business.auto_post_enabled ? 'text-green-600' : 'text-slate-400'}`} />
                                ) : (
                                    <div className="w-6 h-6 text-slate-400">✕</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${business.auto_respond_enabled ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-800">Auto-Respond to Leads</p>
                                <p className="text-sm text-slate-500 mt-1">AI responds to new leads</p>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${business.auto_respond_enabled ? 'bg-green-100' : 'bg-slate-200'}`}>
                                {business.auto_respond_enabled ? (
                                    <TrendingUp className={`w-6 h-6 ${business.auto_respond_enabled ? 'text-green-600' : 'text-slate-400'}`} />
                                ) : (
                                    <div className="w-6 h-6 text-slate-400">✕</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <div>
                            <p className="text-slate-500">Created</p>
                            <p className="font-medium text-slate-800">
                                {new Date(business.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <div>
                            <p className="text-slate-500">Last Updated</p>
                            <p className="font-medium text-slate-800">
                                {new Date(business.updated_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Calendar(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    )
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}
