'use client';

import React from 'react';
import AnalyticsOverview from '@/app/components/dashboard/analytics-overview';
import RevenueChart from '@/app/components/dashboard/revenue-chart';
import PackagePerformance from '@/app/components/dashboard/package-performance';
import { Download, Calendar as CalendarIcon, Filter } from 'lucide-react';

export default function VendorAnalyticsPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Business Analytics</h1>
                    <p className="text-gray-500 mt-1">Deep dive into your sales, bookings, and customer trends</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:border-orange-500 transition-all text-sm">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Custom Range
                    </button>
                    <button className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                    </button>
                </div>
            </div>

            {/* Top KPI Cards */}
            <AnalyticsOverview />

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <RevenueChart />
                </div>
                <div className="lg:col-span-1">
                    <PackagePerformance />
                </div>
            </div>

            {/* Bottom Insights section (Placeholder for extra WOW factor) */}
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative group">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-2">Smart Insights</h3>
                    <p className="max-w-2xl text-purple-100 font-medium">
                        Based on your current trends, your revenue is projected to grow by 15% next month.
                        Top performing package: "Premium Wedding Photography". Consider offering a limited-time discount on your
                        "Engagement Session" to boost current interest.
                    </p>
                    <button className="mt-6 px-6 py-2 bg-white text-orange-600 font-black rounded-xl hover:bg-orange-50 transition-colors text-sm">
                        View Recommendations
                    </button>
                </div>
                {/* Abstract background circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-1000"></div>
            </div>
        </div>
    );
}
