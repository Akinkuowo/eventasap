'use client';

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { fetchWithAuth } from '@/utils/tokenManager';
import { toast } from 'sonner';

interface BookingActionsProps {
    bookingId: string;
    onSuccess: () => void;
}

export default function BookingActions({ bookingId, onSuccess }: BookingActionsProps) {
    const [loading, setLoading] = useState(false);
    const [showDeclineInput, setShowDeclineInput] = useState(false);
    const [declineReason, setDeclineReason] = useState('');

    const handleAccept = async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/accept`,
                { method: 'PUT' }
            );

            const data = await response.json();

            if (data.success) {
                toast.success('Booking accepted! Client will be notified to proceed with payment.');
                onSuccess();
            } else {
                toast.error(data.error || 'Failed to accept booking');
            }
        } catch (error) {
            console.error('Accept booking error:', error);
            toast.error('Failed to accept booking');
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/decline`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ declineReason })
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success('Booking declined. Client has been notified.');
                onSuccess();
            } else {
                toast.error(data.error || 'Failed to decline booking');
            }
        } catch (error) {
            console.error('Decline booking error:', error);
            toast.error('Failed to decline booking');
        } finally {
            setLoading(false);
        }
    };

    if (showDeclineInput) {
        return (
            <div className="space-y-3">
                <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Why are you declining this booking? (Optional)"
                />
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowDeclineInput(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDecline}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
                    >
                        {loading ? 'Declining...' : 'Confirm Decline'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex space-x-3">
            <button
                onClick={() => setShowDeclineInput(true)}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
                <X className="w-5 h-5 mr-2" />
                Decline
            </button>
            <button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
                <Check className="w-5 h-5 mr-2" />
                {loading ? 'Processing...' : 'Accept Booking'}
            </button>
        </div>
    );
}
