'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log to error reporting service (e.g., Sentry)
        console.error('Application error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Icon */}
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Something went wrong
                </h2>
                <p className="text-gray-600 mb-6">
                    An unexpected error occurred. Our team has been notified.
                </p>

                {/* Error details (dev only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-xs font-mono text-red-600 break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs font-mono text-gray-400 mt-2">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={reset}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-all"
                    >
                        <Home className="h-4 w-4" />
                        Home
                    </a>
                </div>
            </div>
        </div>
    )
}
