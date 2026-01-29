'use client';

import React from 'react';
import Header from '@/components/header';
import ForClient from '@/app/components/dashboard/for-client';

export default function ClientsDiscoveryPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <ForClient />
            </div>
        </main>
    );
}
