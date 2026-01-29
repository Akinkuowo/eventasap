'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Loader2,
    MapPin,
    Star,
    LayoutGrid,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    X,
    Heart,
    Tag,
    Clock,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const CATEGORIES = [
    'Photography', 'Catering', 'Decoration', 'Music', 'Venue', 'Makeup', 'Videography', 'Bakery'
];

interface ServicePackage {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    duration: number;
    mainImage: string | null;
    vendor: {
        id: string;
        businessName: string;
        category: string;
        rating: number;
        user: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        }
    }
}

export default function ForClient() {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState<string>('');
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });

    const fetchPackages = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...(searchQuery && { search: searchQuery }),
                ...(category && { category }),
            });

            const url = `${NEXT_PUBLIC_API_URL}/api/packages?${params}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setPackages(data.data.packages);
                setPagination(data.data.pagination);
            } else {
                setError(data.error || 'Failed to fetch packages');
            }
        } catch (err: any) {
            console.error('Error fetching packages:', err);
            setError(err.message || 'Failed to connect to the server');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, category]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPackages(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, category, fetchPackages]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchPackages(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Explore Services</h1>
                    <p className="text-gray-500">Find the perfect packages for your upcoming event</p>
                </div>
                <div className="flex bg-white rounded-xl border border-gray-100 p-1">
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold cursor-pointer">Featured</button>
                    <button className="px-4 py-2 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">Newest</button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="What service are you looking for?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:bg-white transition-all"
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
                    <button onClick={() => fetchPackages(1)} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold cursor-pointer">Retry</button>
                </div>
            ) : packages.length === 0 ? (
                <div className="text-center py-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <LayoutGrid className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No packages found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">We couldn't find any service packages matching your request. Try a different category or search term.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {packages.map((pkg, index) => (
                                <motion.div
                                    key={pkg.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        {pkg.mainImage ? (
                                            <img src={pkg.mainImage} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                                                <Tag className="w-12 h-12 text-orange-200" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                                            <button className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-lg cursor-pointer">
                                                <Heart className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-4 left-4">
                                            <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md text-white rounded-lg text-xs font-bold tracking-wider">
                                                {pkg.vendor.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between text-xs text-gray-500 font-bold tracking-widest uppercase">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {pkg.duration} HOURS
                                            </div>
                                            <div className="flex items-center gap-1 text-orange-600">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                {pkg.vendor.rating.toFixed(1)}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                            {pkg.title}
                                        </h3>

                                        <div className="flex items-center gap-2 py-2">
                                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100">
                                                {pkg.vendor.user.avatarUrl ? (
                                                    <img src={pkg.vendor.user.avatarUrl} alt={pkg.vendor.businessName} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                        {pkg.vendor.businessName[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-600 font-medium truncate">{pkg.vendor.businessName}</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Starting from</span>
                                                <span className="text-xl font-black text-gray-900">£{pkg.price}</span>
                                            </div>
                                            <button className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 group-hover:scale-105 cursor-pointer">
                                                <ArrowRight className="w-5 h-5" />
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
