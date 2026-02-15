'use client';

import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { fetchWithAuth } from '@/utils/tokenManager';
import { toast } from 'sonner';

interface AdjustPriceModalProps {
    bookingId: string;
    currentPrice: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdjustPriceModal({
    bookingId,
    currentPrice,
    onClose,
    onSuccess
}: AdjustPriceModalProps) {
    const [adjustedPrice, setAdjustedPrice] = useState(currentPrice.toString());
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const priceValue = parseFloat(adjustedPrice);

        if (isNaN(priceValue) || priceValue <= 0) {
            toast.error('Please enter a valid price');
            return;
        }

        setLoading(true);
        try {
            const response = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/adjust-price`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        adjustedPrice: priceValue,
                        priceAdjustmentReason: reason
                    })
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success('Price adjusted successfully! Client will be notified.');
                onSuccess();
                onClose();
            } else {
                toast.error(data.error || 'Failed to adjust price');
            }
        } catch (error) {
            console.error('Adjust price error:', error);
            toast.error('Failed to adjust price');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Adjust Price</h2>
                    <p className="text-gray-500 mt-1">Update the quoted price for this booking</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Price
                        </label>
                        <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600">
                            £{currentPrice.toFixed(2)}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Price *
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={adjustedPrice}
                                onChange={(e) => setAdjustedPrice(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Adjustment (Optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                            rows={3}
                            placeholder="Explain why you're adjusting the price..."
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Adjusting...' : 'Adjust Price'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
