'use client';

import React from 'react';
import VendorsList from '@/app/components/dashboard/vendors-list';
import { Sparkles, Users } from 'lucide-react';

export default function VendorsPage() {
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center space-x-2 text-orange-100 font-bold text-sm mb-4 uppercase tracking-widest">
                            <Sparkles className="w-4 h-4" />
                            <span>Discover Professionals</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                            Find the Perfect Vendors for Your Next Big Event
                        </h1>
                        <p className="text-orange-50 text-lg opacity-90">
                            Browse through our handpicked collection of verified photographers, caterers, decorators, and more.
                        </p>
                    </div>
                    <div className="hidden lg:block">
                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                            <Users className="w-16 h-16 text-white opacity-40 mb-4" />
                            <div className="space-y-1">
                                <p className="text-2xl font-black">500+</p>
                                <p className="text-sm font-medium text-orange-100">Verified Vendors</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            </div>

            {/* Vendors Grid and Filters */}
            <VendorsList />
        </div>
    );
}
