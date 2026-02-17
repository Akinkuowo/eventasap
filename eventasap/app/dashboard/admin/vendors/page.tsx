'use client';

import React from 'react';
import VendorManagement from '@/app/components/admin/VendorManagement';
import { Briefcase } from 'lucide-react';

export default function AdminVendorsPage() {
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-8 border-b border-gray-100">
                <div>
                    <div className="flex items-center space-x-3 text-slate-900 mb-2">
                        <div className="p-2 bg-purple-100 rounded-xl">
                            <Briefcase className="w-8 h-8 text-purple-600" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Vendor Oversight</h1>
                    </div>
                    <p className="text-gray-500 font-medium tracking-wide">
                        Registration auditing and vendor profile authorization.
                    </p>
                </div>
            </div>

            <VendorManagement />
        </div>
    );
}
