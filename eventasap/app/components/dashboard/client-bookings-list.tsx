'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '@/utils/tokenManager';
import ClientBookingCard from './client-booking-card';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ClientBookingsList() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecentBookings = async () => {
            try {
                const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/bookings?limit=4`);
                const data = await response.json();

                if (data.success) {
                    setBookings(data.data.bookings || []);
                } else {
                    setError(data.error || 'Failed to fetch bookings');
                }
            } catch (err) {
                console.error('Error fetching bookings:', err);
                setError('Failed to connect to the server');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentBookings();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
                <p>Loading your recent bookings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                <p className="text-red-700 font-medium mb-2">Wait, something went wrong</p>
                <p className="text-red-600 text-sm">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Bookings Yet</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                    When you start booking vendors for your events, they'll appear here.
                </p>
                <button
                    onClick={() => window.location.href = '/dashboard/services/new'}
                    className="px-6 py-2 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
                >
                    Find a Vendor
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <ClientBookingCard key={booking.id} booking={booking} />
            ))}
        </div>
    );
}
