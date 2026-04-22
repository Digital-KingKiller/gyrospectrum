import { Search, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Large 404 */}
                <div className="mb-8">
                    <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        404
                    </h1>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mt-4" />
                </div>

                {/* Message */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Page not found
                </h2>
                <p className="text-gray-600 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
                    >
                        <Home className="h-4 w-4" />
                        Go Home
                    </a>
                    <a
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard
                    </a>
                </div>
            </div>
        </div>
    )
}
