// app/dashboard/bookings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar, Filter, Download, Plus, Search,
    Clock, CheckCircle, XCircle, AlertCircle,
    Eye, MessageSquare, DollarSign, MapPin,
    Users, Calendar as CalendarIcon, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/utils/tokenManager';

interface Booking {
    id: string;
    serviceType: string;
    eventDate: string;
    eventLocation: string;
    guests: number;
    budget: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    message?: string;
    customRequirements: string[];
    vendor: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        vendorProfile: {
            businessName: string;
            category: string;
        } | null;
    };
    payments: Array<{
        amount: number;
        status: string;
        createdAt: string;
    }>;
    bookingDate: string;
    quotedPrice?: number;
    paymentStatus?: string;
    notes?: string;
}

interface BookingStats {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<BookingStats>({ total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const status = filter === 'all' ? undefined : filter.toUpperCase();
            const response = await fetchWithAuth(
                `${NEXT_PUBLIC_API_URL}/api/bookings?status=${status || ''}`
            );

            const data = await response.json();

            if (data.success) {
                setBookings(data.data.bookings);
                setStats(data.data.stats);
            } else {
                toast.error(data.error || 'Failed to fetch bookings');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-4 h-4" />;
            case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
            case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
            case 'CANCELLED': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const filteredBookings = bookings.filter(booking => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        return (
            booking.serviceType.toLowerCase().includes(searchLower) ||
            booking.vendor.vendorProfile?.businessName?.toLowerCase().includes(searchLower) ||
            booking.eventLocation.toLowerCase().includes(searchLower) ||
            booking.vendor.firstName.toLowerCase().includes(searchLower) ||
            booking.vendor.lastName.toLowerCase().includes(searchLower)
        );
    });

    const totalAmount = bookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, booking) => sum + (booking.quotedPrice || booking.budget), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                    <p className="text-gray-600">Manage your event bookings with vendors</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <button
                        onClick={() => window.location.href = '/dashboard/services/new'}
                        className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Service Request
                    </button>
                    <button
                        onClick={() => window.location.href = '/dashboard/vendors'}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Book Vendor
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Confirmed</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Completed</p>
                            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Value</p>
                            <p className="text-2xl font-bold text-gray-900">£{totalAmount.toLocaleString()}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search bookings by service, vendor, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                        />
                    </div>
                    <div className="flex space-x-2 overflow-x-auto">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-xl whitespace-nowrap ${filter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            All ({stats.total})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Pending ({stats.pending})
                        </button>
                        <button
                            onClick={() => setFilter('confirmed')}
                            className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center ${filter === 'confirmed' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirmed ({stats.confirmed})
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center ${filter === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed ({stats.completed})
                        </button>
                        <button
                            onClick={() => setFilter('cancelled')}
                            className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center ${filter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelled ({stats.cancelled})
                        </button>
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            {loading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading bookings...</p>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
                    <p className="text-gray-600 mb-4">Start by booking a vendor or posting a service request</p>
                    <div className="space-x-3">
                        <button
                            onClick={() => window.location.href = '/dashboard/vendors'}
                            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300"
                        >
                            Browse Vendors
                        </button>
                        <button
                            onClick={() => window.location.href = '/dashboard/services/new'}
                            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Post Service Request
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-xl border border-gray-200 hover:border-orange-300 transition-all duration-200">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    {/* Left side: Booking details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{booking.serviceType}</h3>
                                                <div className="flex items-center mt-1 space-x-2">
                                                    <span className="text-sm text-gray-600">with</span>
                                                    <span className="font-medium text-gray-900">
                                                        {booking.vendor.vendorProfile?.businessName || `${booking.vendor.firstName} ${booking.vendor.lastName}`}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(booking.status)}`}>
                                                        {getStatusIcon(booking.status)}
                                                        <span className="ml-1">{booking.status}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    £{(booking.quotedPrice || booking.budget).toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-500">Total</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                            <div className="flex items-center space-x-3">
                                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Event Date</p>
                                                    <p className="font-medium">{formatDate(booking.eventDate)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <MapPin className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Location</p>
                                                    <p className="font-medium">{booking.eventLocation}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Users className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Guests</p>
                                                    <p className="font-medium">{booking.guests} people</p>
                                                </div>
                                            </div>
                                        </div>

                                        {booking.message && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-700">{booking.message}</p>
                                            </div>
                                        )}

                                        {booking.customRequirements && booking.customRequirements.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Special Requirements:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {booking.customRequirements.map((req, index) => (
                                                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                                                            {req}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right side: Actions */}
                                    <div className="flex flex-col space-y-3">
                                        <button
                                            onClick={() => window.location.href = `/dashboard/bookings/${booking.id}`}
                                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `/dashboard/messages?vendor=${booking.vendor.id}`}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Message Vendor
                                        </button>
                                        {booking.status === 'CONFIRMED' && booking.paymentStatus !== 'PAID' && (
                                            <button
                                                onClick={() => window.location.href = `/dashboard/payments?booking=${booking.id}`}
                                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                                            >
                                                <DollarSign className="w-4 h-4 mr-2" />
                                                Make Payment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}