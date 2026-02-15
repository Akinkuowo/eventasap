'use client';

import React, { useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '@/utils/tokenManager';
import { toast } from 'sonner';

interface PriceApprovalCardProps {
    bookingId: string;
    adjustedPrice: number;
    originalPrice: number;
    reason?: string;
    onSuccess: () => void;
}

export default function PriceApprovalCard({
    bookingId,
    adjustedPrice,
    originalPrice,
    reason,
    onSuccess
}: PriceApprovalCardProps) {
    const [loading, setLoading] = useState(false);
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/approve-price`,
                { method: 'PUT' }
            );

            const data = await response.json();

            if (data.success) {
                toast.success('Price approved! Vendor has been notified.');
                onSuccess();
            } else {
                toast.error(data.error || 'Failed to approve price');
            }
        } catch (error) {
            console.error('Approve price error:', error);
            toast.error('Failed to approve price');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/reject-price`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rejectionReason })
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success('Price rejected. Vendor has been notified.');
                onSuccess();
            } else {
                toast.error(data.error || 'Failed to reject price');
            }
        } catch (error) {
            console.error('Reject price error:', error);
            toast.error('Failed to reject price');
        } finally {
            setLoading(false);
        }
    };

    const priceDifference = adjustedPrice - originalPrice;
    const isIncrease = priceDifference > 0;

    return (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6 mb-4">
            <div className="flex items-start space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">Price Adjustment Pending</h3>
                    <p className="text-gray-600 text-sm mt-1">
                        The vendor has proposed a new price for this booking
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-3 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="font-semibold text-gray-900">£{originalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Adjusted Price:</span>
                    <span className="font-bold text-orange-600 text-lg">£{adjustedPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-600">Difference:</span>
                    <span className={`font-semibold ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                        {isIncrease ? '+' : ''}£{priceDifference.toFixed(2)}
                    </span>
                </div>
            </div>

            {reason && (
                <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason for adjustment:</p>
                    <p className="text-gray-600">{reason}</p>
                </div>
            )}

            {!showRejectInput ? (
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowRejectInput(true)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 mr-2" />
                        Reject
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                        <Check className="w-5 h-5 mr-2" />
                        {loading ? 'Processing...' : 'Approve'}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Why are you rejecting this price adjustment? (Optional)"
                    />
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowRejectInput(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
                        >
                            {loading ? 'Rejecting...' : 'Confirm Rejection'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
