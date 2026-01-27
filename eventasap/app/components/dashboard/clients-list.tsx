'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Loader2,
    TrendingUp,
    UserPlus,
    UserCheck,
    Download
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/utils/tokenManager';
import ClientCard from './client-card';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    avatarUrl?: string;
    totalBookings: number;
    lastBookingDate: string;
    status: 'ACTIVE' | 'RECURRING' | 'NEW';
}

const ClientsList: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RECURRING' | 'NEW'>('ALL');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/vendor/clients`);
            const data = await response.json();

            if (data.success) {
                setClients(data.data.clients || []);
            } else {
                // If API not implemented yet, using some dummy data for preview
                console.warn('API fetch failed, using dummy data for preview');
                setClients([
                    {
                        id: '1',
                        firstName: 'Sarah',
                        lastName: 'Johnson',
                        email: 'sarah.j@example.com',
                        phoneNumber: '+44 7700 900077',
                        totalBookings: 3,
                        lastBookingDate: '2025-12-20T10:00:00Z',
                        status: 'RECURRING'
                    },
                    {
                        id: '2',
                        firstName: 'Michael',
                        lastName: 'Chen',
                        email: 'm.chen@example.com',
                        phoneNumber: '+44 7700 900122',
                        totalBookings: 1,
                        lastBookingDate: '2026-01-15T14:30:00Z',
                        status: 'NEW'
                    },
                    {
                        id: '3',
                        firstName: 'Emma',
                        lastName: 'Wilson',
                        email: 'emma.w@example.com',
                        phoneNumber: '+44 7700 900555',
                        totalBookings: 2,
                        lastBookingDate: '2026-01-05T09:15:00Z',
                        status: 'ACTIVE'
                    }
                ]);
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            // toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = `${client.firstName} ${client.lastName} ${client.email}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: clients.length,
        recurring: clients.filter(c => c.status === 'RECURRING').length,
        new: clients.filter(c => c.status === 'NEW').length,
        active: clients.filter(c => c.status === 'ACTIVE').length
    };

    return (
        <div className="space-y-8">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Clients</h1>
                    <p className="text-gray-500 mt-1">Manage relationships and viewing booking history of your clients</p>
                </div>
                <button
                    onClick={() => toast.info('Export functionality coming soon!')}
                    className="flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm"
                >
                    <Download className="w-5 h-5 mr-2" />
                    Export CSV
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Clients</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.total}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-lg">High Value</span>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Recurring</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.recurring}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                            <UserPlus className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">New Clients</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.new}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Bookings</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.active}</h3>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-200 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center space-x-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
                    {(['ALL', 'ACTIVE', 'RECURRING', 'NEW'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${statusFilter === status
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 translate-y-[-2px]'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'ALL' ? 'All Clients' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clients Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                    <p className="font-bold text-gray-500">Loading your clients...</p>
                </div>
            ) : filteredClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onViewDetail={(id) => window.location.href = `/dashboard/clients/${id}`}
                            onContact={(id) => window.location.href = `/dashboard/messages/${id}`}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-orange-50 text-orange-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No Clients Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto font-medium">
                        {searchQuery || statusFilter !== 'ALL'
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "Your client list is empty. Clients will appear here once they start booking your services."}
                    </p>
                    {(searchQuery || statusFilter !== 'ALL') && (
                        <button
                            onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                            className="mt-6 text-orange-600 font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientsList;
