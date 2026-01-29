'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Loader2,
    MapPin,
    Calendar,
    Users,
    DollarSign,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    X,
    MessageSquare,
    Clock,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '@/utils/tokenManager';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const CATEGORIES = [
    'Photography', 'Catering', 'Decoration', 'Music', 'Venue', 'Makeup', 'Videography', 'Bakery'
];

interface ServiceRequest {
    id: string;
    serviceType: string;
    description: string;
    budgetMin: number;
    budgetMax: number;
    eventDate: string;
    eventLocation: string;
    guests: number;
    requirements: string[];
    urgency: string;
    status: string;
    createdAt: string;
    client: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default function ForVendor() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState<string>('');
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });

    const fetchRequests = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(searchQuery && { search: searchQuery }),
                ...(category && { serviceType: category }),
            });

            // Use fetchWithAuth because this is for vendors to see opportunities
            const url = `${NEXT_PUBLIC_API_URL}/api/service-requests?${params}`;
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            const response = token ? await fetchWithAuth(url) : await fetch(url);
            const data = await response.json();

            if (data.success) {
                setRequests(data.data.serviceRequests);
                setPagination(data.data.pagination);
            } else {
                setError(data.error || 'Failed to fetch service requests');
            }
        } catch (err: any) {
            console.error('Error fetching requests:', err);
            setError(err.message || 'Failed to connect to the server');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, category]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRequests(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, category, fetchRequests]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchRequests(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Marketplace Opportunities</h1>
                    <p className="text-gray-500">Discover and respond to client service requests matching your expertise</p>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl text-orange-700 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Real-time updates</span>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search service requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:bg-white transition-all text-gray-900"
                    />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        onClick={() => setCategory('')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border whitespace-nowrap cursor-pointer ${!category ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'}`}
                    >
                        All
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border whitespace-nowrap cursor-pointer ${category === cat ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-100' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>


            {/* Results Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                            <div className="aspect-[4/3] bg-gray-100" />
                            <div className="p-5 space-y-3">
                                <div className="h-4 bg-gray-100 rounded w-1/2" />
                                <div className="h-6 bg-gray-100 rounded w-3/4" />
                                <div className="h-4 bg-gray-100 rounded w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="text-red-700 font-medium">{error}</p>
                    <button onClick={() => fetchRequests(1)} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold cursor-pointer">Retry</button>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No requests found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your filters or check back later for new opportunities.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {requests.map((request, index) => (
                                <motion.div
                                    key={request.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
                                            <div className="relative">
                                                <Calendar className="w-16 h-16 text-orange-200" />
                                                <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-lg shadow-sm border border-orange-100">
                                                    <MapPin className="w-4 h-4 text-orange-500" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <div className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${request.urgency === 'HIGH' ? 'bg-red-500 text-white' : request.urgency === 'MEDIUM' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                                                {request.urgency} URGENCY
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 left-4">
                                            <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md text-white rounded-lg text-xs font-bold tracking-wider">
                                                {request.serviceType}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col space-y-4">
                                        <div className="flex items-center justify-between text-xs text-gray-500 font-bold tracking-widest uppercase">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-orange-500" />
                                                {new Date(request.eventDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5 text-purple-500" />
                                                {request.guests} GUESTS
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
                                            {request.description}
                                        </h3>

                                        <div className="flex items-center gap-2 py-2">
                                            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-black text-orange-700 border border-orange-200">
                                                {request.client.firstName[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-900 font-bold">{request.client.firstName} {request.client.lastName?.[0] || 'User'}</span>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                                                    <MapPin className="w-2.5 h-2.5" />
                                                    {request.eventLocation}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Budget Range</span>
                                                <span className="text-lg font-black text-gray-900">£{request.budgetMin} - £{request.budgetMax}</span>
                                            </div>
                                            <button className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg group-hover:scale-105 cursor-pointer">
                                                <ArrowUpRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-4 pt-12">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-3 bg-white border border-gray-200 rounded-2xl disabled:opacity-50 hover:border-orange-200 hover:text-orange-600 transition-all shadow-sm cursor-pointer"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                {[...Array(pagination.totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all cursor-pointer ${pagination.page === i + 1 ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-400 border border-gray-100 hover:border-orange-200'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-3 bg-white border border-gray-200 rounded-2xl disabled:opacity-50 hover:border-orange-200 hover:text-orange-600 transition-all shadow-sm cursor-pointer"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}

        </div>
    );
}
