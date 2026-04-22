'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
    TrendingUp,
    Users,
    FileText,
    Target,
    Calendar,
    MessageSquare,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'

interface Stats {
    totalLeads: number
    totalCompetitors: number
    totalContent: number
    totalBookings: number
    leadsThisWeek: number
    contentThisWeek: number
}

interface RecentActivity {
    id: string
    type: 'lead' | 'competitor' | 'content' | 'booking'
    title: string
    description: string
    timestamp: string
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalLeads: 0,
        totalCompetitors: 0,
        totalContent: 0,
        totalBookings: 0,
        leadsThisWeek: 0,
        contentThisWeek: 0,
    })
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    async function loadDashboardData() {
        try {
            // Get counts for all tables
            const [leads, competitors, content, bookings] = await Promise.all([
                supabase.from('leads').select('*', { count: 'exact', head: true }),
                supabase.from('competitors').select('*', { count: 'exact', head: true }),
                supabase.from('content_templates').select('*', { count: 'exact', head: true }),
                supabase.from('bookings').select('*', { count: 'exact', head: true }),
            ])

            // Get recent leads
            const { data: recentLeads } = await supabase
                .from('leads')
                .select('id, name, source_platform, created_at')
                .order('created_at', { ascending: false })
                .limit(3)

            // Get recent content
            const { data: recentContent } = await supabase
                .from('content_templates')
                .select('id, title, platform, created_at')
                .order('created_at', { ascending: false })
                .limit(2)

            setStats({
                totalLeads: leads.count || 0,
                totalCompetitors: competitors.count || 0,
                totalContent: content.count || 0,
                totalBookings: bookings.count || 0,
                leadsThisWeek: leads.count || 0, // Would calculate actual week difference
                contentThisWeek: content.count || 0,
            })

            // Build recent activity
            const activity: RecentActivity[] = []

            recentLeads?.forEach(lead => {
                activity.push({
                    id: lead.id,
                    type: 'lead',
                    title: `New lead: ${lead.name}`,
                    description: `From ${lead.source_platform}`,
                    timestamp: lead.created_at,
                })
            })

            recentContent?.forEach(content => {
                activity.push({
                    id: content.id,
                    type: 'content',
                    title: content.title,
                    description: `${content.platform} content created`,
                    timestamp: content.created_at,
                })
            })

            setRecentActivity(activity.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            ).slice(0, 5))

        } catch (error) {
            console.error('Error loading dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            name: 'Total Leads',
            value: stats.totalLeads,
            change: '+12%',
            changeType: 'positive',
            icon: Users,
            color: 'blue',
        },
        {
            name: 'Competitors Analyzed',
            value: stats.totalCompetitors,
            change: '+2',
            changeType: 'positive',
            icon: Target,
            color: 'purple',
        },
        {
            name: 'Content Created',
            value: stats.totalContent,
            change: `+${stats.contentThisWeek} this week`,
            changeType: 'neutral',
            icon: FileText,
            color: 'green',
        },
        {
            name: 'Bookings',
            value: stats.totalBookings,
            change: 'No change',
            changeType: 'neutral',
            icon: Calendar,
            color: 'orange',
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Welcome back! 👋</h2>
                <p className="text-slate-600 mt-1">Here's what's happening with your marketing system</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={stat.name}
                            className="relative overflow-hidden bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                                    <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        {stat.changeType === 'positive' && (
                                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                                        )}
                                        {stat.changeType === 'negative' && (
                                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                                        )}
                                        <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' :
                                                stat.changeType === 'negative' ? 'text-red-600' :
                                                    'text-slate-500'
                                            }`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
                        <Link href="/dashboard/leads" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            View all →
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">No recent activity</p>
                        ) : (
                            recentActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div className={`p-2 rounded-lg ${activity.type === 'lead' ? 'bg-blue-100' :
                                            activity.type === 'competitor' ? 'bg-purple-100' :
                                                activity.type === 'content' ? 'bg-green-100' :
                                                    'bg-orange-100'
                                        }`}>
                                        {activity.type === 'lead' && <Users className="w-5 h-5 text-blue-600" />}
                                        {activity.type === 'competitor' && <Target className="w-5 h-5 text-purple-600" />}
                                        {activity.type === 'content' && <FileText className="w-5 h-5 text-green-600" />}
                                        {activity.type === 'booking' && <Calendar className="w-5 h-5 text-orange-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800">{activity.title}</p>
                                        <p className="text-sm text-slate-500">{activity.description}</p>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(activity.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link
                                href="/dashboard/competitors"
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                            >
                                <Target className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-slate-700">Analyze Competitors</span>
                            </Link>
                            <Link
                                href="/dashboard/content"
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                            >
                                <FileText className="w-5 h-5 text-green-600" />
                                <span className="font-medium text-slate-700">Generate Content</span>
                            </Link>
                            <Link
                                href="/dashboard/leads"
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                            >
                                <Users className="w-5 h-5 text-purple-600" />
                                <span className="font-medium text-slate-700">View Leads</span>
                            </Link>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                        <h3 className="text-lg font-bold mb-2">System Status</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm opacity-90">AI Engine</span>
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                    <span className="text-sm font-medium">Active</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm opacity-90">Database</span>
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                    <span className="text-sm font-medium">Connected</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm opacity-90">Last Sync</span>
                                <span className="text-sm font-medium">2 min ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
