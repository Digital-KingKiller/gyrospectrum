'use client'

import { useState } from 'react'
import {
    GitBranch,
    Play,
    Pause,
    Plus,
    ArrowRight,
    Clock,
    Send,
    MessageSquare,
    Video,
    FileText,
    CheckCircle,
    Zap,
    MoreHorizontal,
    Loader2,
    Mail
} from 'lucide-react'

interface Workflow {
    id: string
    name: string
    description: string
    status: 'active' | 'paused'
    trigger: { icon: any, label: string }
    steps: { icon: any, label: string }[]
    stats: { runs: number, success_rate: number }
}

export default function WorkflowsPage() {
    const [testingId, setTestingId] = useState<string | null>(null)

    const [workflows, setWorkflows] = useState<Workflow[]>([
        {
            id: '1',
            name: 'Video Distribution Pipeline',
            description: 'Automatically post approved videos to all short-form platforms.',
            status: 'active',
            trigger: { icon: Video, label: 'New Video Approved' },
            steps: [
                { icon: Clock, label: 'Wait 10 mins' },
                { icon: Send, label: 'Post to TikTok' },
                { icon: Clock, label: 'Wait 2 hours' },
                { icon: Send, label: 'Post to Reels' }
            ],
            stats: { runs: 142, success_rate: 98 }
        },
        {
            id: '2',
            name: 'Blog to Social Repurposing',
            description: 'Convert long-form blog content into a Twitter thread.',
            status: 'active',
            trigger: { icon: FileText, label: 'New Blog Post' },
            steps: [
                { icon: Zap, label: 'Generate Thread with AI' },
                { icon: MessageSquare, label: 'Create Draft Tweets' },
                { icon: CheckCircle, label: 'Request Approval' }
            ],
            stats: { runs: 45, success_rate: 100 }
        },
        {
            id: '3',
            name: 'New Lead Welcome',
            description: 'Send a personalized intro video to high-value leads via Email.',
            status: 'paused',
            trigger: { icon: Zap, label: 'High Score Lead (>80)' },
            steps: [
                { icon: Video, label: 'Generate Personal Video' },
                { icon: Mail, label: 'Send Email Booking' }
            ],
            stats: { runs: 12, success_rate: 92 }
        }
    ])

    const toggleStatus = (id: string) => {
        setWorkflows(workflows.map(w =>
            w.id === id ? { ...w, status: w.status === 'active' ? 'paused' : 'active' } : w
        ))
    }

    const handleTestRun = async (workflowId: string) => {
        if (workflowId !== '3') {
            alert('Simulation: Workflow tested successfully on mock data.')
            return
        }

        const email = window.prompt("Enter an email address to send a test welcome email to:")
        if (!email) return

        setTestingId(workflowId)

        try {
            const response = await fetch('/api/automation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name: 'Friend',
                    leadScore: 90 // Force high score to trigger logic
                })
            })

            const data = await response.json()

            if (data.success) {
                alert('✅ Success! Test email has been sent via Resend.')
            } else {
                alert('❌ Error: ' + (data.message || 'Workflow failed'))
            }
        } catch (error) {
            console.error(error)
            alert('Failed to run workflow test')
        } finally {
            setTestingId(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <GitBranch className="w-8 h-8 text-blue-600" />
                        Marketing Workflows
                    </h2>
                    <p className="text-slate-600 mt-2 text-lg">
                        Automate your entire marketing operation with visual pipelines.
                    </p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                    <Plus className="w-5 h-5" />
                    Create Workflow
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-blue-100 font-medium mb-1">Active Automations</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-bold">24/7</h3>
                        <span className="text-sm bg-white/20 px-2 py-1 rounded-full">Running</span>
                    </div>
                    <p className="mt-4 text-sm text-blue-100">Saving approx. 12 hours/week</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <p className="text-slate-500 font-medium mb-1">Total Actions Run</p>
                    <h3 className="text-4xl font-bold text-slate-800">1,284</h3>
                    <p className="mt-4 text-sm text-green-600 flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        +12% from last week
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <p className="text-slate-500 font-medium mb-1">Success Rate</p>
                    <h3 className="text-4xl font-bold text-slate-800">99.4%</h3>
                    <p className="mt-4 text-sm text-slate-400">Stable performance</p>
                </div>
            </div>

            {/* Workflows List */}
            <div className="space-y-6">
                {workflows.map((workflow) => (
                    <div
                        key={workflow.id}
                        className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
                    >
                        {/* Workflow Header */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex gap-4">
                                <div className={`mt-1 w-12 h-12 rounded-xl flex items-center justify-center ${workflow.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <GitBranch className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{workflow.name}</h3>
                                    <p className="text-slate-500 mt-1 max-w-xl">{workflow.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden md:block text-right mr-4">
                                    <p className="text-2xl font-bold text-slate-800">{workflow.stats.runs}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Runs</p>
                                </div>

                                {/* Test Run Button */}
                                <button
                                    onClick={() => handleTestRun(workflow.id)}
                                    disabled={!!testingId}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 bg-white border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {testingId === workflow.id ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Testing...
                                        </span>
                                    ) : 'Run Test'}
                                </button>

                                <button
                                    onClick={() => toggleStatus(workflow.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${workflow.status === 'active'
                                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {workflow.status === 'active' ? (
                                        <>
                                            <Pause className="w-4 h-4" />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" />
                                            Paused
                                        </>
                                    )}
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Visual Pipeline */}
                        <div className="relative">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />

                            <div className="relative z-10 flex items-center gap-4 overflow-x-auto pb-4 hide-scrollbar">

                                {/* Trigger */}
                                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-white border-2 border-blue-500 shadow-sm flex items-center justify-center text-blue-600">
                                        <workflow.trigger.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide bg-blue-50 px-2 py-1 rounded-full">
                                        Trigger
                                    </span>
                                    <p className="text-sm font-medium text-slate-700 text-center w-32">
                                        {workflow.trigger.label}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <div className="flex-shrink-0 text-slate-300">
                                    <ArrowRight className="w-6 h-6" />
                                </div>

                                {/* Steps */}
                                {workflow.steps.map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-4 flex-shrink-0">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 group-hover:border-blue-200 group-hover:text-blue-500 transition-colors">
                                                <step.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide bg-slate-50 px-2 py-1 rounded-full">
                                                Step {idx + 1}
                                            </span>
                                            <p className="text-sm font-medium text-slate-600 text-center w-32">
                                                {step.label}
                                            </p>
                                        </div>

                                        {idx < workflow.steps.length - 1 && (
                                            <div className="text-slate-300">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    )
}
