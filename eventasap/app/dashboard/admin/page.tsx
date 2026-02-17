'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/dashboard/dashboardLayout';
import AdminOverview, { AdminStats } from '@/app/components/admin/AdminOverview';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch admin stats');
            }

            const data = await response.json();
            setStats(data.data);
        } catch (error) {
            toast.error('Could not load administrative data');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-8 border-b border-gray-100">
                <div>
                    <div className="flex items-center space-x-3 text-slate-900 mb-2">
                        <div className="p-2 bg-orange-100 rounded-xl">
                            <ShieldCheck className="w-8 h-8 text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">System Oversight</h1>
                    </div>
                    <p className="text-gray-500 font-medium tracking-wide">
                        Comprehensive platform architecture and revenue monitoring.
                    </p>
                </div>

                <button
                    onClick={fetchAdminStats}
                    className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-900 font-bold rounded-xl hover:border-orange-500 transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                    <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Metrics</span>
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
                        <ShieldCheck className="w-8 h-8 text-orange-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs mt-6">Synchronizing platform data cluster...</p>
                </div>
            ) : stats ? (
                <AdminOverview stats={stats} />
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Deployment Incomplete</p>
                    <p className="text-gray-400 mt-2">No system metrics available in current cluster.</p>
                </div>
            )}
        </div>
    );
}
