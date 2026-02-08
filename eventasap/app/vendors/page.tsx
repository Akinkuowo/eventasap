'use client';

import React from 'react';
import Header from '@/components/header';
import ForVendor from '@/app/components/dashboard/for-vendor';
import Footer from '@/components/footer';

export default function VendorsDiscoveryPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <ForVendor />
            </div>
            <Footer />
        </main>
    );
}
