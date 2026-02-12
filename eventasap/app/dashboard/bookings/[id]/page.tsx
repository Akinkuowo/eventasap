'use client';

import React, { Suspense } from 'react';
import BookingDetails from '@/app/components/dashboard/booking-details';
import { use } from 'react';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);

    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium tracking-wide">Loading booking details...</p>
            </div>
        }>
            <BookingDetails bookingId={resolvedParams.id} />
        </Suspense>
    );
}
