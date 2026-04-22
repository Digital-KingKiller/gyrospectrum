'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Trash2,
    Download
} from 'lucide-react'
import type { Booking } from '@/types/database'
import DeleteModal from '@/components/DeleteModal'

type BookingWithRelations = Booking & {
    lead: { name: string; email: string; phone: string } | null;
    business: { name: string } | null;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<BookingWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        loadBookings()
    }, [statusFilter])

    async function loadBookings() {
        try {
            let query = supabase
                .from('bookings')
                .select(`
          *,
          lead:leads(name, email, phone),
          business:businesses(name)
        `)
                .order('service_date', { ascending: true })

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter)
            }

            const { data, error } = await query

            if (error) throw error
            setBookings((data as unknown as BookingWithRelations[]) || [])
        } catch (error) {
            console.error('Error loading bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        try {
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', deleteId)

            if (error) throw error

            setBookings(bookings.filter(b => b.id !== deleteId))
            setDeleteId(null)
        } catch (error) {
            console.error('Error deleting booking:', error)
            alert('Failed to delete booking')
        } finally {
            setIsDeleting(false)
        }
    }

    const filteredBookings = bookings.filter(booking => {
        const leadName = booking.lead?.name || ''
        return leadName.toLowerCase().includes(searchTerm.toLowerCase())
    })

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { color: string; icon: any; label: string }> = {
            pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertCircle, label: 'Pending' },
            confirmed: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Confirmed' },
            completed: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle, label: 'Completed' },
            cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
        }
        return configs[status] || configs.pending
    }

    const upcomingBookings = bookings.filter(b =>
        new Date(b.service_date) >= new Date() && b.status !== 'cancelled'
    )
    const completedBookings = bookings.filter(b => b.status === 'completed')
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled')

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Booking"
                message="Are you sure you want to delete this booking? This action cannot be undone."
                isDeleting={isDeleting}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Bookings</h2>
                    <p className="text-slate-600 mt-1">Manage appointments and meetings</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                    <Calendar className="w-5 h-5" />
                    New Booking
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{bookings.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{upcomingBookings.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{completedBookings.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{cancelledBookings.length}</p>
                </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">No bookings found</p>
                        <p className="text-slate-400 text-sm mt-2">Click "New Booking" to create your first appointment</p>
                    </div>
                ) : (
                    filteredBookings.map((booking) => {
                        const statusConfig = getStatusConfig(booking.status || 'pending')
                        const StatusIcon = statusConfig.icon
                        const lead = booking.lead

                        return (
                            <div
                                key={booking.id}
                                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    {/* Date & Time */}
                                    <div className="flex items-center gap-4 lg:w-48">
                                        <div className="p-3 rounded-lg bg-blue-100">
                                            <Calendar className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {booking.service_date ? new Date(booking.service_date).toLocaleDateString() : 'No date'}
                                            </p>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {booking.service_date ? new Date(booking.service_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Lead Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                {lead?.name?.[0]?.toUpperCase() || 'L'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{lead?.name || 'Unknown'}</p>
                                                <p className="text-sm text-slate-500">{booking.booking_type || 'General Meeting'}</p>
                                            </div>
                                        </div>
                                        {lead && (
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                                {lead.email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="w-4 h-4" />
                                                        <span>{lead.email}</span>
                                                    </div>
                                                )}
                                                {lead.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{lead.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Service Details */}
                                    {booking.service_details && (
                                        <div className="lg:w-64">
                                            <p className="text-xs text-slate-500 mb-1">Details</p>
                                            <p className="text-sm text-slate-700 line-clamp-2">
                                                {typeof booking.service_details === 'string'
                                                    ? booking.service_details
                                                    : JSON.stringify(booking.service_details)}
                                            </p>
                                        </div>
                                    )}

                                    {/* Status & Actions */}
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1 ${statusConfig.color}`}>
                                            <StatusIcon className="w-4 h-4" />
                                            {statusConfig.label}
                                        </span>
                                        <button
                                            onClick={() => setDeleteId(booking.id)}
                                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                            title="Delete Booking"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
