'use client';

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Lock,
    ShieldCheck,
    AlertCircle,
    Loader2,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import { fetchWithAuth } from '@/utils/tokenManager';
import { toast } from 'sonner';

interface PaymentFormProps {
    bookingId: string;
    amount: number;
    vendorName: string;
    serviceType: string;
    onSuccess?: () => void;
}

export default function PaymentForm({ bookingId, amount, vendorName, serviceType, onSuccess }: PaymentFormProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiry: '',
        cvc: '',
        name: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.cardNumber || !formData.expiry || !formData.cvc || !formData.name) {
            toast.error('Please fill in all card details');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bookingId,
                    amount,
                    description: `Payment for ${serviceType} with ${vendorName}`
                })
            });

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                toast.success('Payment processed successfully!');
                if (onSuccess) {
                    setTimeout(onSuccess, 2000);
                }
            } else {
                toast.error(data.error || 'Payment failed');
            }
        } catch (err) {
            console.error('Payment error:', err);
            toast.error('Failed to process payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-white rounded-2xl border border-green-100 p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
                <p className="text-gray-600">
                    Your payment of £{amount.toLocaleString()} has been processed.
                    The vendor has been notified.
                </p>
                <div className="pt-4">
                    <button
                        onClick={() => window.location.href = '/dashboard/bookings'}
                        className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all"
                    >
                        Go to My Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Secure Payment</h3>
                        <p className="text-sm text-gray-500">Service: {serviceType} with {vendorName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Amount</p>
                        <p className="text-2xl font-black text-orange-600">£{amount.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Full name as on card"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                placeholder="0000 0000 0000 0000"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                            <input
                                type="text"
                                name="expiry"
                                value={formData.expiry}
                                onChange={handleInputChange}
                                placeholder="MM/YY"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="cvc"
                                    value={formData.cvc}
                                    onChange={handleInputChange}
                                    placeholder="000"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-4 flex items-start space-x-3">
                    <ShieldCheck className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-orange-900">Encrypted Transaction</p>
                        <p className="text-xs text-orange-700">Your payment data is protected with 128-bit SSL encryption. We don't store your full card details.</p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Authorizing...
                        </>
                    ) : (
                        <>
                            Pay £{amount.toLocaleString()} Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                    )}
                </button>

                <div className="flex items-center justify-center space-x-4 opacity-50 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                </div>
            </form>
        </div>
    );
}
