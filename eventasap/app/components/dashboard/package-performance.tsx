'use client';

import React from 'react';
import { Package, TrendingUp } from 'lucide-react';

interface PackageData {
    name: string;
    bookings: number;
    revenue: number;
    color: string;
}

const PackagePerformance: React.FC<{ data?: PackageData[] }> = ({ data: providedData }) => {
    const packages = providedData && providedData.length > 0 ? providedData : [];

    const maxRevenue = packages.length > 0 ? Math.max(...packages.map(p => p.revenue)) : 1;

    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-gray-900">Package Performance</h3>
                    <p className="text-sm text-gray-500 font-medium">Which services are driving your business?</p>
                </div>
                <TrendingUp className="w-6 h-6 text-orange-500" />
            </div>

            {packages.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No package data available yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start getting bookings to see your top performing packages</p>
                </div>
            ) : (
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
            )}
        </div>
    );
};

export default PackagePerformance;
