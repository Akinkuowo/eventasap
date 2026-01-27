'use client';

import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Users,
    Activity
} from 'lucide-react';

interface StatProps {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: React.ElementType;
    color: string;
}

const StatCard: React.FC<StatProps> = ({ title, value, change, isPositive, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{change}</span>
            </div>
        </div>
        <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
        </div>
        <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
            <Activity className="w-3 h-3 mr-1" />
            <span>Since last month</span>
        </div>
    </div>
);

const AnalyticsOverview: React.FC = () => {
    // These would eventually come from an API
    const stats = [
        {
            title: "Total Revenue",
            value: "£12,450.00",
            change: "+12.5%",
            isPositive: true,
            icon: DollarSign,
            color: "bg-orange-500"
        },
        {
            title: "Bookings",
            value: "48",
            change: "+8.2%",
            isPositive: true,
            icon: Calendar,
            color: "bg-purple-500"
        },
        {
            title: "Avg. Booking",
            value: "£259.37",
            change: "-2.4%",
            isPositive: false,
            icon: Activity,
            color: "bg-blue-500"
        },
        {
            title: "Client Base",
            value: "156",
            change: "+14.1%",
            isPositive: true,
            icon: Users,
            color: "bg-green-500"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default AnalyticsOverview;
