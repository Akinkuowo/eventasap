'use client';

import React, { Suspense } from 'react';
import Header from '@/components/header';
import ForClient from '@/app/components/dashboard/for-client';
import Footer from '@/components/footer';

export default function ClientsDiscoveryPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading...</div>}>
                    <ForClient />
                </Suspense>
            </div>
            <Footer />
        </main>
    );
}
