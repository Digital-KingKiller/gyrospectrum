import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import {
    LayoutDashboard,
    Building2,
    Target,
    FileText,
    Users,
    Calendar,
    BarChart3,
    Settings,
    LogOut,
    GitBranch,
    Share2,
    Video,
    Megaphone,
    Headset
} from 'lucide-react'

interface DashboardLayoutProps {
    children: React.ReactNode
}

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Business', href: '/dashboard/business', icon: Building2 },
    { name: 'Competitors', href: '/dashboard/competitors', icon: Target },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Megaphone },
    { name: 'Content', href: '/dashboard/content', icon: FileText },
    { name: 'Video', href: '/dashboard/video', icon: Video },
    { name: 'Social', href: '/dashboard/social', icon: Share2 },
    { name: 'Voice Agents', href: '/dashboard/voice', icon: Headset },
    { name: 'Leads', href: '/dashboard/leads', icon: Users },
    { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
    { name: 'Workflows', href: '/dashboard/workflows', icon: GitBranch },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-lg">
                {/* Logo */}
                <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">GS</span>
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        GyroSpectrum
                    </span>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                        >
                            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <div className="pl-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between h-full px-8">
                        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>

                            {/* User Menu */}
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-800">Admin User</p>
                                    <p className="text-xs text-slate-500">admin@gyrospec.com</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                    <span className="text-white font-semibold">A</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
