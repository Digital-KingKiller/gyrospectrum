'use client'

import { useState } from 'react'
import { Megaphone, Calendar, Target, Plus, CheckCircle2, Video, Share2, Mail, Sparkles, Loader2, ArrowRight } from 'lucide-react'

interface CampaignPlan {
    id: string
    goal: string
    startDate: string
    endDate: string
    deliverables: {
        type: 'video' | 'social' | 'email'
        platform: string
        title: string
        status: 'pending' | 'generating' | 'ready'
    }[]
}

export default function CampaignsPage() {
    const [goal, setGoal] = useState('')
    const [duration, setDuration] = useState('14')
    const [isGenerating, setIsGenerating] = useState(false)
    const [activePlan, setActivePlan] = useState<CampaignPlan | null>(null)

    const handleGenerateCampaign = () => {
        if (!goal) return
        setIsGenerating(true)
        
        // Mock generation delay
        setTimeout(() => {
            setActivePlan({
                id: crypto.randomUUID(),
                goal: goal,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                deliverables: [
                    { type: 'video', platform: 'TikTok/Reels', title: `Hook: Why ${goal} changes everything`, status: 'pending' },
                    { type: 'social', platform: 'LinkedIn', title: 'Thought Leadership: Industry shifts', status: 'pending' },
                    { type: 'social', platform: 'Instagram', title: 'Carousel: 3 tips for success', status: 'pending' },
                    { type: 'social', platform: 'Facebook', title: 'Community question & engagement', status: 'pending' },
                    { type: 'email', platform: 'Newsletter', title: 'Deep dive & exclusive offer', status: 'pending' },
                    { type: 'video', platform: 'YouTube', title: 'Full tutorial and breakdown', status: 'pending' },
                ]
            })
            setIsGenerating(false)
        }, 2500)
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
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">What are we launching?</h3>
                            <p className="text-slate-500">Describe your product, offer, or event. The AI will generate a complete content calendar.</p>
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
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Primary Channel</label>
                                    <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500">
                                        <option>Omnichannel (All)</option>
                                        <option>B2B (LinkedIn Focus)</option>
                                        <option>Visual (Instagram/TikTok)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerateCampaign}
                                disabled={!goal || isGenerating}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Architecting Campaign...
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
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Active Campaign: {activePlan.goal.substring(0, 40)}...</h3>
                            <p className="text-slate-500 mt-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {activePlan.startDate} to {activePlan.endDate}
                            </p>
                        </div>
                        <button 
                            onClick={() => setActivePlan(null)}
                            className="text-sm font-medium text-slate-500 hover:text-slate-800 px-4 py-2 bg-slate-100 rounded-lg"
                        >
                            Start Over
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activePlan.deliverables.map((item, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    {item.type === 'video' && <Video className="w-24 h-24" />}
                                    {item.type === 'social' && <Share2 className="w-24 h-24" />}
                                    {item.type === 'email' && <Mail className="w-24 h-24" />}
                                </div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider
                                            ${item.type === 'video' ? 'bg-purple-100 text-purple-700' : 
                                              item.type === 'social' ? 'bg-blue-100 text-blue-700' : 
                                              'bg-orange-100 text-orange-700'}
                                        `}>
                                            {item.type} • {item.platform}
                                        </span>
                                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                                    </div>
                                    
                                    <h4 className="font-bold text-slate-800 text-lg leading-tight mb-2">
                                        {item.title}
                                    </h4>
                                    
                                    <p className="text-sm text-slate-500">
                                        Day {index * 2 + 1} of Campaign
                                    </p>

                                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                                            Generate Content
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-blue-600 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mt-8">
                        <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-black transition-all flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Approve & Schedule All
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
