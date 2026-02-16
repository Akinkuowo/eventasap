'use client';

import React from 'react';
import {
    TrendingUp,
    Users,
    Briefcase,
    Calendar,
    DollarSign,
    Shield,
    Clock,
    AlertCircle
} from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
            <p className="text-xs text-gray-400 mt-2 font-medium">{description}</p>
        </div>
    </div>
);

export interface AdminStats {
    totalUsers: number;
    totalVendors: number;
    totalBookings: number;
    totalRevenue: number;
    pendingVendors: number;
    heldPayouts: number;
    adminCommission: number;
}

const AdminOverview: React.FC<{ stats: AdminStats }> = ({ stats }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Platform Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="bg-blue-600"
                    description="Registered clients and vendors"
                />
                <StatCard
                    title="Active Vendors"
                    value={stats.totalVendors}
                    icon={Briefcase}
                    color="bg-purple-600"
                    description="Service providers on platform"
                />
                <StatCard
                    title="Global Bookings"
                    value={stats.totalBookings}
                    icon={Calendar}
                    color="bg-orange-600"
                    description="Total events facilitated"
                />
                <StatCard
                    title="Total GMV"
                    value={`£${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-green-600"
                    description="Gross Merchandise Volume"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Shield className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Platform Revenue</p>
                        <h4 className="text-4xl font-black mb-4">£{stats.adminCommission.toLocaleString()}</h4>
                        <div className="flex items-center text-green-400 text-sm font-bold bg-white/5 inline-flex px-3 py-1 rounded-full border border-white/10">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            <span>Total Commissions</span>
                        </div>
                    </div>
                </div>

                <div className="col-span-1 bg-orange-50 p-8 rounded-3xl border-2 border-orange-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center space-x-2 text-orange-600 mb-4">
                            <Clock className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-wider text-xs">Awaiting Approval</span>
                        </div>
                        <h4 className="text-3xl font-black text-gray-900 mb-1">{stats.pendingVendors}</h4>
                        <p className="text-sm text-gray-600 font-medium">Pending vendor registrations</p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/dashboard/admin/vendors'}
                        className="mt-6 w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
                    >
                        Review Profiles
                    </button>
                </div>

                <div className="col-span-1 bg-green-50 p-8 rounded-3xl border-2 border-green-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center space-x-2 text-green-600 mb-4">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-wider text-xs">Escrowed Funds</span>
                        </div>
                        <h4 className="text-3xl font-black text-gray-900 mb-1">£{stats.heldPayouts.toLocaleString()}</h4>
                        <p className="text-sm text-gray-600 font-medium">Held for service completion</p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/dashboard/admin/payments'}
                        className="mt-6 w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                    >
                        Manage Payouts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
