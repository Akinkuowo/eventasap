'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Briefcase,
    DollarSign,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/utils/tokenManager';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Booking {
    id: string;
    eventDate: string;
    status: string;
    totalAmount: number;
    servicePackage: {
        title: string;
        price: number;
    };
    payments: any[];
}

interface ClientData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    avatarUrl?: string;
    createdAt: string;
}

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<ClientData | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        if (clientId) {
            fetchClientDetails();
        }
    }, [clientId]);

    const fetchClientDetails = async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/vendor/clients/${clientId}`);
            const data = await response.json();

            if (data.success) {
                setClient(data.data.client);
                setBookings(data.data.bookings);
            } else {
                toast.error(data.error || 'Failed to load client details');
                router.push('/dashboard/clients');
            }
        } catch (error) {
            console.error('Error fetching client details:', error);
            toast.error('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                <p className="text-gray-500 font-bold">Loading client history...</p>
            </div>
        );
    }

    if (!client) return null;

    const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const successfulBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED').length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Navigation & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-orange-600 hover:border-orange-100 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Client History</h1>
                        <p className="text-gray-500 font-medium mt-1">Viewing relationship with {client.firstName} {client.lastName}</p>
                    </div>
                </div>

                <button
                    onClick={() => router.push(`/dashboard/messages/${client.id}`)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
                >
                    <MessageSquare className="w-5 h-5" />
                    Send Message
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Client Profile */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center text-orange-600 font-black text-4xl mb-6 shadow-inner ring-4 ring-orange-50">
                                {client.avatarUrl ? (
                                    <img src={client.avatarUrl} alt={client.firstName} className="w-full h-full object-cover rounded-[2rem]" />
                                ) : (
                                    <span>{client.firstName.charAt(0)}{client.lastName.charAt(0)}</span>
                                )}
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">{client.firstName} {client.lastName}</h2>
                            <p className="text-orange-600 font-bold text-sm tracking-widest uppercase mt-1">Loyal Client</p>

                            <div className="w-full mt-8 space-y-4">
                                <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                                    <Mail className="w-5 h-5 text-gray-400 mr-4" />
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Email Address</p>
                                        <p className="text-sm font-bold text-gray-700 truncate">{client.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                                    <Phone className="w-5 h-5 text-gray-400 mr-4" />
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Phone Number</p>
                                        <p className="text-sm font-bold text-gray-700">{client.phoneNumber || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                                    <Calendar className="w-5 h-5 text-gray-400 mr-4" />
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Client Since</p>
                                        <p className="text-sm font-bold text-gray-700">
                                            {new Date(client.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Sidebar */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-orange-400" />
                                </div>
                                <TrendingUp className="w-4 h-4 text-green-400" />
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lifetime Value</p>
                            <h3 className="text-3xl font-black mt-1">£{totalSpent.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                {/* Right Column: Booking History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Briefcase className="w-5 h-5 text-blue-500" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Total Bookings</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900">{bookings.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Successful</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900">{successfulBookings}</p>
                        </div>
                        <div className="hidden sm:block bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-purple-500" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Avg. Order</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900">
                                £{bookings.length > 0 ? (totalSpent / bookings.length).toFixed(0) : '0'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Booking History</h3>
                            <button className="text-orange-600 font-bold text-sm hover:underline">Download Report</button>
                        </div>

                        {bookings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Service & Package</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Date</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {bookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-gray-900">{booking.servicePackage?.title || 'Unknown Package'}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">#{booking.id.slice(-8).toUpperCase()}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center text-sm font-bold text-gray-600">
                                                        <Calendar className="w-4 h-4 mr-2 text-gray-300" />
                                                        {new Date(booking.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="font-black text-gray-900">£{(booking.totalAmount || 0).toLocaleString()}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${getStatusColor(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-20 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-10 h-10 text-gray-300" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">No history yet</h4>
                                <p className="text-gray-500 max-w-xs mx-auto">This client hasn't completed any bookings with you yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
