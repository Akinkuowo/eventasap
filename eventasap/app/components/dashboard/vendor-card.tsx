'use client';

import React from 'react';
import {
    Star,
    MapPin,
    ShieldCheck,
    ArrowRight,
    Clock,
    Tag
} from 'lucide-react';

interface VendorCardProps {
    vendor: {
        id: string;
        businessName: string;
        category: string;
        city: string;
        country: string;
        description: string | null;
        rating: number | null;
        totalReviews: number;
        portfolioImages: string[];
        minBookingPrice: number | null;
        responseTime: number | null;
        isVerified: boolean;
        user: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    };
}

export default function VendorCard({ vendor }: VendorCardProps) {
    const mainImage = vendor.portfolioImages?.[0] || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1469&auto=format&fit=crop';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={mainImage}
                    alt={vendor.businessName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                        {vendor.category}
                    </span>
                </div>
                {vendor.isVerified && (
                    <div className="absolute top-4 right-4">
                        <div className="p-1.5 bg-blue-500 text-white rounded-full shadow-lg" title="Verified Vendor">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                )}
                {vendor.minBookingPrice && (
                    <div className="absolute bottom-4 left-4">
                        <div className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-semibold rounded-lg">
                            From £{vendor.minBookingPrice.toLocaleString()}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {vendor.businessName}
                    </h3>
                    <div className="flex items-center text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-lg text-sm">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        {vendor.rating ? vendor.rating.toFixed(1) : 'New'}
                    </div>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {vendor.city}, {vendor.country}
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                    {vendor.description || `Meet ${vendor.user.firstName} ${vendor.user.lastName}, a professional ${vendor.category} ready to make your event unforgettable.`}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50 mb-4">
                    <div className="flex items-center text-[11px] text-gray-500">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                        Avg. {vendor.responseTime || 24}h response
                    </div>
                    <div className="flex items-center text-[11px] text-gray-500">
                        <Tag className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                        {vendor.totalReviews} Reviews
                    </div>
                </div>

                <div className="flex items-center space-x-2 mt-auto">
                    <button
                        onClick={() => window.location.href = `/dashboard/vendors/${vendor.id}`}
                        className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center group/btn"
                    >
                        View Profile
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => window.location.href = `/dashboard/bookings/new?vendor=${vendor.id}`}
                        className="p-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all"
                        title="Quick Book"
                    >
                        <Clock className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
