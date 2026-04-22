'use client'

import { useState } from 'react'
import { Megaphone, Calendar, Plus, Video, Share2, Mail, Sparkles, Loader2, ArrowRight, CheckCircle2, Tag, Users, MessageSquare } from 'lucide-react'

interface Deliverable {
    day: number
    type: 'video' | 'social' | 'email'
    platform: string
    title: string
    hook: string
    status: 'pending' | 'generating' | 'ready'
}

interface CampaignPlan {
    campaignName: string
    targetAudience: string
    coreMessage: string
    deliverables: Deliverable[]
}

const TYPE_ICONS = {
    video: Video,
    social: Share2,
    email: Mail,
}

const TYPE_COLORS = {
    video: 'bg-purple-100 text-purple-700 border-purple-200',
    social: 'bg-blue-100 text-blue-700 border-blue-200',
    email: 'bg-orange-100 text-orange-700 border-orange-200',
}

export default function CampaignsPage() {
    const [goal, setGoal] = useState('')
    const [duration, setDuration] = useState('14')
    const [channelFocus, setChannelFocus] = useState('omnichannel')
    const [isGenerating, setIsGenerating] = useState(false)
    const [activePlan, setActivePlan] = useState<CampaignPlan | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [selectedItem, setSelectedItem] = useState<Deliverable | null>(null)

    const handleGenerateCampaign = async () => {
        if (!goal) return
        setIsGenerating(true)
        setError(null)

        try {
            const res = await fetch('/api/campaigns/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal, duration: parseInt(duration), channelFocus })
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to generate')

            setActivePlan(data.campaign)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Something went wrong')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <Megaphone className="w-8 h-8 text-blue-600" />
                    Campaign Orchestrator
                </h2>
                <p className="text-slate-600 mt-2 text-lg">
                    Generate multi-channel marketing campaigns in seconds. Give us a goal, we build the engine.
                </p>
            </div>

            {/* Builder UI */}
            {!activePlan ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-lg">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">What are we launching?</h3>
                            <p className="text-slate-500">Describe your product, offer, or event. The AI generates a complete content calendar.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Goal / Topic</label>
                                <textarea
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder="e.g. Launching our new premium SEO consultation service with a 20% early-bird discount..."
                                    className="w-full h-32 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="7">1 Week Blitz</option>
                                        <option value="14">14 Days (Recommended)</option>
                                        <option value="30">30 Day Domination</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Channel Strategy</label>
                                    <select
                                        value={channelFocus}
                                        onChange={(e) => setChannelFocus(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="omnichannel">Omnichannel (All)</option>
                                        <option value="B2B (LinkedIn Focus)">B2B (LinkedIn Focus)</option>
                                        <option value="Visual (Instagram/TikTok)">Visual (Instagram/TikTok)</option>
                                    </select>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                onClick={handleGenerateCampaign}
                                disabled={!goal || isGenerating}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        AI is architecting your campaign...
                                    </>
                                ) : (
                                    <>
                                        Generate Campaign Plan
                                        <ArrowRight className="w-6 h-6" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Campaign Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                        <div className="relative z-10">
                            <p className="text-blue-200 text-sm font-medium mb-1">ACTIVE CAMPAIGN</p>
                            <h3 className="text-2xl font-bold mb-3">{activePlan.campaignName}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                    <p className="text-xs text-blue-200 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Target Audience</p>
                                    <p className="font-semibold">{activePlan.targetAudience}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-xl p-4 md:col-span-2">
                                    <p className="text-xs text-blue-200 mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Core Message</p>
                                    <p className="font-semibold">{activePlan.coreMessage}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => { setActivePlan(null); setGoal('') }}
                            className="absolute top-4 right-4 text-white/60 hover:text-white text-sm font-medium px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                        >
                            New Campaign
                        </button>
                    </div>

                    {/* Deliverables Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activePlan.deliverables.map((item, index) => {
                            const Icon = TYPE_ICONS[item.type] || Share2
                            const colorClass = TYPE_COLORS[item.type] || TYPE_COLORS.social
                            return (
                                <div
                                    key={index}
                                    onClick={() => setSelectedItem(selectedItem?.day === item.day ? null : item)}
                                    className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden ${selectedItem?.day === item.day ? 'ring-2 ring-blue-500' : 'border-slate-200'}`}
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Icon className="w-24 h-24" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${colorClass}`}>
                                                {item.type} • {item.platform}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">Day {item.day}</span>
                                        </div>

                                        <h4 className="font-bold text-slate-800 text-lg leading-tight mb-2">
                                            {item.title}
                                        </h4>

                                        <p className="text-sm text-slate-500 line-clamp-2">
                                            {item.hook}
                                        </p>

                                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                                                Generate Content →
                                            </span>
                                            <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Selected Item Detail */}
                    {selectedItem && (
                        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl animate-in fade-in">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-slate-400 text-sm">Day {selectedItem.day} · {selectedItem.platform}</p>
                                    <h3 className="text-xl font-bold mt-1">{selectedItem.title}</h3>
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white">✕</button>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4 mb-6">
                                <p className="text-sm text-slate-300 font-medium mb-1">Hook / Angle</p>
                                <p className="text-white">{selectedItem.hook}</p>
                            </div>
                            <div className="flex gap-4">
                                <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Generate Full Content
                                </button>
                                <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Schedule for Day {selectedItem.day}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-black transition-all flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Approve & Schedule Full Campaign
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
