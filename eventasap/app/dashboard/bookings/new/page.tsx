'use client';

import React, { Suspense } from 'react';
import BookingRequestForm from '@/app/components/dashboard/booking-request-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function BookingNewContent() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <Link
                    href="/dashboard/discover"
                    className="inline-flex items-center text-gray-600 hover:text-orange-600 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Discover
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Request a New Booking</h1>
                <p className="text-gray-500 mt-2">
                    Send a booking request to your selected vendor. They will review your requirements and get back to you.
                </p>
            </div>

            <BookingRequestForm />
        </div>
    );
}

export default function BookingNewPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
        }>
            <BookingNewContent />
        </Suspense>
    );
}
