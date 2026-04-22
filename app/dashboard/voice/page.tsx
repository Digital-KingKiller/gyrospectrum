'use client'

import { useState } from 'react'
import { Headset, Phone, PhoneIncoming, PhoneOutgoing, Settings, Play, Square, Activity, Users, Calendar } from 'lucide-react'

export default function VoiceAgentsPage() {
    const [isActive, setIsActive] = useState(false)
    const [agentMode, setAgentMode] = useState<'inbound' | 'outbound'>('inbound')

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Headset className="w-8 h-8 text-blue-600" />
                        AI Voice Agents
                    </h2>
                    <p className="text-slate-600 mt-2 text-lg">
                        Powered by Vapi.ai. Superhuman agents for inbound reception and outbound sales.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-600">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                        {isActive ? 'Agents Online' : 'Agents Offline'}
                    </span>
                    <button 
                        onClick={() => setIsActive(!isActive)}
                        className={`px-6 py-2 rounded-lg font-bold text-white transition-all shadow-md ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                        {isActive ? 'Stop Engine' : 'Start Engine'}
                    </button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button 
                    onClick={() => setAgentMode('inbound')}
                    className={`pb-4 px-2 text-lg font-bold transition-all ${agentMode === 'inbound' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Inbound Receptionist
                </button>
                <button 
                    onClick={() => setAgentMode('outbound')}
                    className={`pb-4 px-2 text-lg font-bold transition-all ${agentMode === 'outbound' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Outbound Sales SDR
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-slate-500" />
                            Agent Configuration
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Agent Persona / Name</label>
                                <input 
                                    type="text" 
                                    defaultValue={agentMode === 'inbound' ? 'Sarah (Reception)' : 'Mike (Sales)'}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Voice Identity</label>
                                <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500">
                                    <option>ElevenLabs - Rachel (Warm, Professional)</option>
                                    <option>ElevenLabs - Drew (Energetic, Sales)</option>
                                    <option>PlayHT - William (Authoritative)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">System Prompt (Instructions)</label>
                                <textarea 
                                    className="w-full h-48 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    defaultValue={agentMode === 'inbound' 
                                        ? "You are Sarah, the AI receptionist for GyroSpectrum. Your goal is to answer FAQs and book appointments. Keep answers under 2 sentences."
                                        : "You are Mike, a ruthless but polite SDR. You are calling leads who downloaded our guide. Your goal is to qualify them using the BANT framework and schedule a demo."}
                                />
                            </div>

                            <button className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                Save Agent Configuration
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status & Analytics Panel */}
                <div className="space-y-6">
                    {/* Live Call Simulator */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-20 transform translate-x-10 -translate-y-10"></div>
                        
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            Test Agent
                        </h3>
                        
                        <div className="flex items-center justify-center py-8">
                            <button className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-500 hover:scale-105 transition-all">
                                <Phone className="w-8 h-8" />
                            </button>
                        </div>
                        <p className="text-center text-slate-400 text-sm">Click to simulate a call directly in your browser.</p>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4">Today's Performance</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-600">
                                    {agentMode === 'inbound' ? <PhoneIncoming className="w-4 h-4" /> : <PhoneOutgoing className="w-4 h-4" />}
                                    <span className="text-sm font-medium">Calls Handled</span>
                                </div>
                                <span className="font-bold text-slate-800">14</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm font-medium">Appointments Booked</span>
                                </div>
                                <span className="font-bold text-green-600">3</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm font-medium">Avg Duration</span>
                                </div>
                                <span className="font-bold text-slate-800">2m 14s</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
