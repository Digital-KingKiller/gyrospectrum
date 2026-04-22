'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Mail,
    Lock,
    Loader2,
    ArrowRight,
    CheckCircle2
} from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            setError(error.message || 'Failed to sign in')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Branding Side (Left) */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
                {/* Abstract Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-lg px-12 text-center text-white">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl mb-8">
                        <span className="text-3xl font-bold">GS</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-6">Welcome Back to GyroSpectrum</h1>
                    <p className="text-lg text-slate-300 leading-relaxed mb-8">
                        Your AI-powered marketing command center. Analyze competitors, generate content, and automate leads in seconds.
                    </p>

                    {/* Feature List */}
                    <div className="text-left space-y-4 max-w-sm mx-auto">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                            <span className="text-slate-200">Real-time Competitor Analysis</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                            <span className="text-slate-200">AI Video & Content Generation</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                            <span className="text-slate-200">Automated Lead Nurturing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Side (Right) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">Sign in to your account</h2>
                        <p className="text-slate-500 mt-2">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-blue-600 font-medium hover:underline">
                                Start for free
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                            <div className="w-1 h-4 bg-red-600 rounded-full" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-slate-600">Remember me</span>
                            </label>
                            <a href="#" className="text-blue-600 font-medium hover:underline">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">
                            By signing in, you agree to our{' '}
                            <a href="#" className="underline hover:text-slate-600">Terms of Service</a>{' '}
                            and{' '}
                            <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
