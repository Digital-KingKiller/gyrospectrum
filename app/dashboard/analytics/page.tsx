// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
    TrendingUp,
    Users,
    Target,
    FileText,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
    leadsOverTime: any[]
    contentByPlatform: any[]
    competitorTypes: any[]
    leadsBySource: any[]
    conversionFunnel: any[]
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData>({
        leadsOverTime: [],
        contentByPlatform: [],
        competitorTypes: [],
        leadsBySource: [],
        conversionFunnel: [],
    })
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('7d')

    useEffect(() => {
        loadAnalytics()
    }, [timeRange])

    async function loadAnalytics() {
        try {
            // Get all data
            const [leads, content, competitors] = await Promise.all([
                supabase.from('leads').select('*'),
                supabase.from('content_templates').select('*'),
                supabase.from('competitors').select('*'),
            ])

            // Leads over time (mock data for demo)
            const leadsOverTime = [
                { date: 'Mon', leads: 2 },
                { date: 'Tue', leads: 3 },
                { date: 'Wed', leads: 1 },
                { date: 'Thu', leads: 4 },
                { date: 'Fri', leads: 5 },
                { date: 'Sat', leads: 3 },
                { date: 'Sun', leads: 2 },
            ]

            // Content by platform
            const platformCounts: Record<string, number> = {}
            content.data?.forEach(item => {
                platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1
            })
            const contentByPlatform = Object.entries(platformCounts).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value,
            }))

            // Competitor types
            const typeCounts: Record<string, number> = {}
            competitors.data?.forEach(comp => {
                const type = comp.competitor_type || 'indirect'
                typeCounts[type] = (typeCounts[type] || 0) + 1
            })
            const competitorTypes = Object.entries(typeCounts).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value,
            }))

            // Leads by source
            const sourceCounts: Record<string, number> = {}
            leads.data?.forEach(lead => {
                const source = lead.source_platform || 'unknown'
                sourceCounts[source] = (sourceCounts[source] || 0) + 1
            })
            const leadsBySource = Object.entries(sourceCounts).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value,
            }))

            // Conversion funnel
            const totalLeads = leads.data?.length || 0
            const qualified = leads.data?.filter(l => l.status === 'qualified').length || 0
            const converted = leads.data?.filter(l => l.status === 'converted').length || 0

            const conversionFunnel = [
                { stage: 'Total Leads', count: totalLeads, percentage: 100 },
                { stage: 'Qualified', count: qualified, percentage: totalLeads > 0 ? (qualified / totalLeads) * 100 : 0 },
                { stage: 'Converted', count: converted, percentage: totalLeads > 0 ? (converted / totalLeads) * 100 : 0 },
            ]

            setData({
                leadsOverTime,
                contentByPlatform,
                competitorTypes,
                leadsBySource,
                conversionFunnel,
            })
        } catch (error) {
            console.error('Error loading analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Analytics</h2>
                    <p className="text-slate-600 mt-1">Performance metrics and insights</p>
                </div>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                </select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Conversion Rate</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                {data.conversionFunnel[2]?.percentage.toFixed(1)}%
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                                <ArrowUpRight className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600">+12.5%</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-green-100">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Avg. Lead Score</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">0.85</p>
                            <div className="flex items-center gap-1 mt-2">
                                <ArrowUpRight className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600">+8.2%</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-100">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Content Performance</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">94%</p>
                            <div className="flex items-center gap-1 mt-2">
                                <ArrowUpRight className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600">+5.1%</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-100">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Response Time</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">2.4m</p>
                            <div className="flex items-center gap-1 mt-2">
                                <ArrowDownRight className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium text-red-600">-3.2%</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-orange-100">
                            <Calendar className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leads Over Time */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Leads Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.leadsOverTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="leads"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Conversion Funnel</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.conversionFunnel} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" stroke="#64748b" />
                            <YAxis dataKey="stage" type="category" stroke="#64748b" width={100} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Content by Platform */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Content by Platform</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.contentByPlatform}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.contentByPlatform.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Leads by Source */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Leads by Source</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.leadsBySource}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-4">📊 Key Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                        <p className="text-sm opacity-90 mb-1">Best Performing Platform</p>
                        <p className="text-lg font-bold">
                            {data.contentByPlatform[0]?.name || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                        <p className="text-sm opacity-90 mb-1">Top Lead Source</p>
                        <p className="text-lg font-bold">
                            {data.leadsBySource[0]?.name || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                        <p className="text-sm opacity-90 mb-1">Recommendation</p>
                        <p className="text-lg font-bold">Focus on {data.leadsBySource[0]?.name || 'LinkedIn'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

