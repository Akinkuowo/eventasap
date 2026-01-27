'use client';

import React from 'react';
import ClientsList from '@/app/components/dashboard/clients-list';

export default function VendorClientsPage() {
    return (
        <div className="container mx-auto py-4">
            <ClientsList />
        </div>
    );
}
