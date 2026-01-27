'use client';

import React from 'react';
import { Package, TrendingUp } from 'lucide-react';

const PackagePerformance: React.FC = () => {
    const packages = [
        { name: 'Premium Wedding Photography', bookings: 24, revenue: 4800, color: 'bg-orange-500' },
        { name: 'Engagement Session', bookings: 12, revenue: 1200, color: 'bg-purple-500' },
        { name: 'Portrait Collection', bookings: 8, revenue: 1600, color: 'bg-blue-500' },
        { name: 'Event Coverage (Full Day)', bookings: 4, revenue: 4850, color: 'bg-green-500' },
    ];

    const maxRevenue = Math.max(...packages.map(p => p.revenue));

    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-gray-900">Package Performance</h3>
                    <p className="text-sm text-gray-500 font-medium">Which services are driving your business?</p>
                </div>
                <TrendingUp className="w-6 h-6 text-orange-500" />
            </div>

            <div className="space-y-6">
                {packages.map((pkg, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                                <Package className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="font-bold text-gray-700">{pkg.name}</span>
                            </div>
                            <span className="font-black text-gray-900">£{pkg.revenue.toLocaleString()}</span>
                        </div>
                        <div className="relative h-3 w-full bg-gray-50 rounded-full overflow-hidden">
                            <div
                                className={`absolute inset-y-0 left-0 rounded-full ${pkg.color} transition-all duration-1000`}
                                style={{ width: `${(pkg.revenue / maxRevenue) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{pkg.bookings} Bookings</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{Math.round((pkg.revenue / maxRevenue) * 100)}% of Top</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PackagePerformance;
