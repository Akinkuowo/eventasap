'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Loader2,
    MapPin,
    LayoutGrid,
    ListFilter as ListFilterIcon,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    X,
    Users
} from 'lucide-react';
import { fetchWithAuth } from '@/utils/tokenManager';
import VendorCard from './vendor-card';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const CATEGORIES = [
    'Photography', 'Catering', 'Decoration', 'Music', 'Venue', 'Makeup', 'Videography', 'Bakery'
];

export default function VendorsList() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState<string>('');
    const [city, setCity] = useState('');
    const [showOnlyBooked, setShowOnlyBooked] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });

    const fetchVendors = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...(searchQuery && { search: searchQuery }),
                ...(category && { category }),
                ...(city && { city }),
                onlyBooked: showOnlyBooked.toString()
            });

            const url = `${NEXT_PUBLIC_API_URL}/api/vendors?${params}`;
            const response = showOnlyBooked
                ? await fetchWithAuth(url)
                : await fetch(url);

            const data = await response.json();

            if (data.success) {
                setVendors(data.data.vendors);
                setPagination(data.data.pagination);
            } else {
                setError(data.error || 'Failed to fetch vendors');
            }
        } catch (err) {
            console.error('Error fetching vendors:', err);
            setError('Failed to connect to the server');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, category, city, showOnlyBooked]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchVendors(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, category, city, showOnlyBooked, fetchVendors]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchVendors(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-8">
            {/* Search and Filters Bar */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by business name, description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:bg-white transition-all text-gray-900"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 lg:w-1/2">
                        {/* Category Dropdown */}
                        <div className="relative flex-1">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all text-gray-900 appearance-none"
                            >
                                <option value="">All Categories</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* City Input */}
                        <div className="relative flex-1">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Location (City)"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all text-gray-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Tags and Toggle */}
                <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setCategory('');
                                setShowOnlyBooked(false);
                            }}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${!category && !showOnlyBooked ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Trending
                        </button>
                        {CATEGORIES.slice(0, 5).map(cat => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setCategory(cat);
                                    setShowOnlyBooked(false);
                                }}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${category === cat ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setShowOnlyBooked(!showOnlyBooked);
                            setCategory('');
                        }}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${showOnlyBooked
                            ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        {showOnlyBooked ? 'My Previous Vendors' : 'View My Vendors'}
                    </button>
                </div>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-orange-100 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <p className="mt-6 font-medium animate-pulse">Scanning for best vendors...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-12 text-center max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Technical Difficulty</h3>
                    <p className="text-red-600 mb-6">{error}</p>
                    <button
                        onClick={() => fetchVendors(1)}
                        className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                        Force Retry
                    </button>
                </div>
            ) : vendors.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Matching Vendors</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        We couldn't find any approved vendors matching your current search criteria. Try broadening your keywords or clearing filters.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setCategory('');
                            setCity('');
                        }}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <>
                    {/* Stats Bar */}
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center text-gray-600 text-sm">
                            <span className="font-bold text-orange-600 mr-1">{pagination.total}</span>
                            Vendors found
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-colors">
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400">
                                <ListFilterIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Vendor Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {vendors.map((vendor) => (
                            <VendorCard key={vendor.id} vendor={vendor} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-4 pt-8">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-3 bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <div className="flex items-center space-x-2 font-bold text-gray-900">
                                <span className="bg-orange-600 text-white w-10 h-10 rounded-xl flex items-center justify-center">
                                    {pagination.page}
                                </span>
                                <span className="text-gray-400 px-2 italic text-sm">of</span>
                                <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-200">
                                    {pagination.totalPages}
                                </span>
                            </div>

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-3 bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all"
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
