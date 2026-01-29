'use client';

import React, { useState, useEffect } from 'react';
import ForVendor from '@/app/components/dashboard/for-vendor';
import ForClient from '@/app/components/dashboard/for-client';
import { Loader2 } from 'lucide-react';

export default function DiscoverPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            </div>
        );
    }

    if (user?.activeRole === 'VENDOR') {
        return <ForVendor />;
    }

    return <ForClient />;
}
