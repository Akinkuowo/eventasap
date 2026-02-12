'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar, MapPin, Users, DollarSign,
    MessageSquare, Clock, CheckCircle, XCircle,
    AlertCircle, ArrowLeft, Mail, Phone,
    User, Briefcase, Tag, FileText, Send,
    Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/utils/tokenManager';
import { useRouter } from 'next/navigation';

interface BookingDetailsProps {
    bookingId: string;
}

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
    client: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        clientProfile?: any;
    };
    vendor: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        vendorProfile?: {
            businessName: string;
            category: string;
        };
    };
    payments: any[];
    quotedPrice?: number;
    paymentStatus?: string;
    notes?: string;
    createdAt: string;
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BookingDetails({ bookingId }: BookingDetailsProps) {
    const [booking, setBooking] = useState<Booking | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [notes, setNotes] = useState('');
    const [quotedPrice, setQuotedPrice] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}`);
            const data = await response.json();

            if (data.success) {
                setBooking(data.data.booking);
                setNotes(data.data.booking.notes || '');
                setQuotedPrice(data.data.booking.quotedPrice?.toString() || '');
            } else {
                toast.error(data.error || 'Failed to fetch booking details');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    notes,
                    quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Booking ${newStatus.toLowerCase()} successfully`);
                fetchBookingDetails();
            } else {
                toast.error(data.error || 'Failed to update booking');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error updating booking');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium tracking-wide">Fetching booking details...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h3>
                <p className="text-gray-600 mb-6">The booking you are looking for does not exist or you don't have permission to view it.</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const isVendor = currentUser?.activeRole === 'VENDOR';
    const canManage = isVendor && booking.status === 'PENDING';

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.id.slice(-8).toUpperCase()}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                                {booking.status}
                            </span>
                        </div>
                        <p className="text-gray-500 flex items-center">
                            <Tag className="w-4 h-4 mr-2" />
                            {booking.serviceType} request
                        </p>
                    </div>
                </div>

                {isVendor && booking.status === 'PENDING' && (
                    <div className="flex space-x-3">
                        <button
                            onClick={() => handleUpdateStatus('CANCELLED')}
                            disabled={isUpdating}
                            className="px-6 py-2 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
                        >
                            Decline Request
                        </button>
                        <button
                            onClick={() => handleUpdateStatus('CONFIRMED')}
                            disabled={isUpdating}
                            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center"
                        >
                            {isUpdating ? (
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Confirm Booking
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Event Details Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                <Sparkles className="w-5 h-5 mr-3 text-orange-500" />
                                Event Information
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                                            <Calendar className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Event Date</p>
                                            <p className="text-base font-bold text-gray-900">{formatDate(booking.eventDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Location</p>
                                            <p className="text-base font-bold text-gray-900">{booking.eventLocation}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                                            <Users className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Estimated Guests</p>
                                            <p className="text-base font-bold text-gray-900">{booking.guests} People</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                                            <DollarSign className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Customer Budget</p>
                                            <p className="text-base font-bold text-gray-900">£{booking.budget.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {booking.message && (
                                <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wider">
                                        <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                                        Client Message
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed italic">"{booking.message}"</p>
                                </div>
                            )}

                            {booking.customRequirements && booking.customRequirements.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Special Requirements</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {booking.customRequirements.map((req, index) => (
                                            <span key={index} className="px-4 py-2 bg-white border border-orange-200 text-orange-700 font-medium rounded-xl text-sm shadow-sm hover:border-orange-300 transition-colors">
                                                {req}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vendor Notes & Billing Card */}
                    {isVendor && (
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                    <Briefcase className="w-5 h-5 mr-3 text-orange-500" />
                                    Vendor Management
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Quoted Price (£)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            value={quotedPrice}
                                            onChange={(e) => setQuotedPrice(e.target.value)}
                                            placeholder="Enter your final price"
                                            className="w-full pl-10 pr-4 py-3 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-black transition-all text-black"
                                            disabled={booking.status !== 'PENDING' && booking.status !== 'CONFIRMED'}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">This price will be visible to the client if confirmed.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Internal Notes</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={4}
                                            placeholder="Add private notes or reminders about this booking..."
                                            className="w-full pl-10 pr-4 py-3 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-black transition-all text-black resize-none"
                                            disabled={booking.status === 'COMPLETED' || booking.status === 'CANCELLED'}
                                        />
                                    </div>
                                </div>

                                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                    <button
                                        onClick={() => handleUpdateStatus(booking.status)}
                                        disabled={isUpdating}
                                        className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Update Management Details
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Client/User Info */}
                <div className="space-y-6">
                    {/* Client Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                                <User className="w-10 h-10 text-orange-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {isVendor ? `${booking.client.firstName} ${booking.client.lastName}` : (booking.vendor.vendorProfile?.businessName || `${booking.vendor.firstName} ${booking.vendor.lastName}`)}
                            </h2>
                            <p className="text-sm text-gray-500">{isVendor ? 'Client' : 'Vendor'}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <Mail className="w-5 h-5 text-gray-400 mr-4" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 font-medium">Email Address</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{isVendor ? booking.client.email : booking.vendor.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <Phone className="w-5 h-5 text-gray-400 mr-4" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                                    <p className="text-sm font-bold text-gray-900">{isVendor ? booking.client.phoneNumber : booking.vendor.phoneNumber}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/dashboard/messages?recipient=${isVendor ? booking.client.id : booking.vendor.id}`)}
                                className="w-full mt-4 py-3 border border-black text-black font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center"
                            >
                                <MessageSquare className="w-5 h-5 mr-2" />
                                Send Message
                            </button>
                        </div>
                    </div>

                    {/* Booking Stats / History */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-orange-500" />
                            Booking Timeline
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5 border border-green-100">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-bold text-gray-900">Request Sent</p>
                                    <p className="text-xs text-gray-500">{formatDate(booking.createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${booking.status !== 'PENDING' ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className={`w-2 h-2 rounded-full ${booking.status !== 'PENDING' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className="ml-4">
                                    <p className={`text-sm font-bold ${booking.status !== 'PENDING' ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {booking.status === 'CANCELLED' ? 'Request Declined' : 'Vendor Confirmed'}
                                    </p>
                                    {booking.status !== 'PENDING' && (
                                        <p className="text-xs text-gray-500">Status updated: {booking.status}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
