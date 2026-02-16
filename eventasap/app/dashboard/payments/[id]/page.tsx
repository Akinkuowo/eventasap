'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '@/utils/tokenManager';
import { toast } from 'sonner';

interface Booking {
    id: string;
    eventType: string;
    eventDate: string;
    eventLocation: string;
    quotedPrice?: number;
    budget: number;
    status: string;
    vendor: {
        firstName: string;
        lastName: string;
    };
}

export default function PaymentPage() {
    const router = useRouter();
    const params = useParams();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    const fetchBooking = async () => {
        try {
            const response = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}`
            );
            const data = await response.json();

            if (data.success) {
                setBooking(data.data.booking);
            } else {
                toast.error('Failed to load booking details');
                router.push('/dashboard/bookings');
            }
        } catch (error) {
            console.error('Failed to fetch booking:', error);
            toast.error('Failed to load booking');
            router.push('/dashboard/bookings');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // Create PayPal order
            const response = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-paypal-order`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId })
                }
            );

            const data = await response.json();

            if (data.success) {
                // In production, redirect to PayPal approval URL
                // For now, simulate payment completion
                toast.success('Creating PayPal order...');

                // Simulate PayPal redirect and return
                setTimeout(async () => {
                    await capturePayment(data.data.paymentId);
                }, 2000);
            } else {
                toast.error(data.error || 'Failed to create payment');
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Failed to process payment');
        } finally {
            setProcessing(false);
        }
    };

    const capturePayment = async (paymentId: string) => {
        try {
            const response = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payments/capture-paypal-payment`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentId,
                        paypalOrderId: `MOCK_ORDER_${Date.now()}`
                    })
                }
            );

            const data = await response.json();

            if (data.success) {
                router.push(`/dashboard/payments/success?bookingId=${bookingId}`);
            } else {
                router.push(`/dashboard/payments/failure?bookingId=${bookingId}`);
            }
        } catch (error) {
            console.error('Capture payment error:', error);
            router.push(`/dashboard/payments/failure?bookingId=${bookingId}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!booking) {
        return null;
    }

    const amount = booking.quotedPrice || booking.budget;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Bookings
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                    <h1 className="text-2xl font-bold">Complete Your Payment</h1>
                    <p className="text-orange-100 mt-1">Secure your booking with {booking.vendor.firstName} {booking.vendor.lastName}</p>
                </div>

                {/* Booking Details */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Details</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Event Type:</span>
                            <span className="font-semibold text-gray-900">{booking.eventType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Event Date:</span>
                            <span className="font-semibold text-gray-900">
                                {new Date(booking.eventDate).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-semibold text-gray-900">{booking.eventLocation}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Vendor:</span>
                            <span className="font-semibold text-gray-900">
                                {booking.vendor.firstName} {booking.vendor.lastName}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="p-6 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-lg">
                            <span className="text-gray-600">Service Fee:</span>
                            <span className="font-semibold text-gray-900">£{amount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-300 pt-3 mt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                                <span className="text-2xl font-extrabold text-orange-600">£{amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>

                    <button
                        onClick={handlePayment}
                        disabled={processing}
                        className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-6 h-6 mr-3" />
                                Pay with PayPal
                            </>
                        )}
                    </button>

                    <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Secure payment powered by PayPal</span>
                    </div>
                </div>
            </div>

            {/* Info Notice */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> After successful payment, your booking will be confirmed.
                    Your payment is processed securely through PayPal. 70% of the payment will be released
                    to the vendor after service completion.
                </p>
            </div>
        </div>
    );
}
