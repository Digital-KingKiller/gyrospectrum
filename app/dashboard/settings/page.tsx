'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
    Save,
    Building2,
    Users,
    Target,
    Sparkles,
    Bell,
    Shield,
    Key
} from 'lucide-react'
import type { Business } from '@/types/database'

export default function SettingsPage() {
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        industry: '',
        target_audience: '',
        brand_voice: 'professional' as 'professional' | 'casual' | 'friendly' | 'authoritative',
        unique_value_proposition: '',
        auto_post_enabled: false,
        auto_respond_enabled: false,
    })

    useEffect(() => {
        loadBusiness()
    }, [])

    async function loadBusiness() {
        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .limit(1)
                .maybeSingle() // Use maybeSingle instead of single to avoid error on 0 rows

            if (error) throw error

            if (data) {
                setBusiness(data)
                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    industry: data.industry || '',
                    target_audience: data.target_audience || '',
                    brand_voice: (data.brand_voice as typeof formData.brand_voice) || 'professional',
                    unique_value_proposition: data.unique_value_proposition || '',
                    auto_post_enabled: data.auto_post_enabled || false,
                    auto_respond_enabled: data.auto_respond_enabled || false,
                })
            }
        } catch (error) {
            console.error('Error loading business:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setSaving(true)
        setSaved(false)

        try {
            let error

            if (business) {
                // Update existing
                const res = await supabase
                    .from('businesses')
                    .update(formData)
                    .eq('id', business.id)
                error = res.error
            } else {
                // Create new
                // For dev/local, we might need a user_id if RLS is on, but often it defaults to auth.uid()
                const { data, error: insertError } = await supabase
                    .from('businesses')
                    .insert([formData])
                    .select()
                    .single()

                if (data) setBusiness(data)
                error = insertError
            }

            if (error) throw error

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (error) {
            console.error('Error saving business:', error)
            alert('Failed to save settings')
        } finally {
            setSaving(false)
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
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Settings</h2>
                    <p className="text-slate-600 mt-1">Manage your business profile and preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-100">
                        <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Business Information</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Business Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your business name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe what your business does..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Industry
                            </label>
                            <input
                                type="text"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., SaaS, E-commerce"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Brand Voice
                            </label>
                            <select
                                value={formData.brand_voice}
                                onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value as typeof formData.brand_voice })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="professional">Professional</option>
                                <option value="casual">Casual</option>
                                <option value="friendly">Friendly</option>
                                <option value="authoritative">Authoritative</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Target Audience */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-purple-100">
                        <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Target Audience</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Target Audience Description
                        </label>
                        <textarea
                            value={formData.target_audience}
                            onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Who are your ideal customers?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Unique Value Proposition
                        </label>
                        <textarea
                            value={formData.unique_value_proposition}
                            onChange={(e) => setFormData({ ...formData, unique_value_proposition: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="What makes you different?"
                        />
                    </div>
                </div>
            </div>

            {/* Automation Settings */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-green-100">
                        <Sparkles className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Automation</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-800">Auto-Post Content</p>
                            <p className="text-sm text-slate-500">Automatically publish approved content to social media</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.auto_post_enabled}
                                onChange={(e) => setFormData({ ...formData, auto_post_enabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-800">Auto-Respond to Leads</p>
                            <p className="text-sm text-slate-500">AI responds to new leads automatically</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.auto_respond_enabled}
                                onChange={(e) => setFormData({ ...formData, auto_respond_enabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* API Keys Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-orange-100">
                        <Key className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">API Keys</h3>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-600 mb-2">Gemini API Key</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="password"
                                value="••••••••••••••••••"
                                readOnly
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-white"
                            />
                            <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
                                Edit
                            </button>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700">
                            <Shield className="w-5 h-5" />
                            <p className="text-sm font-medium">Your API keys are encrypted and secure</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button (Mobile) */}
            <div className="lg:hidden">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}
