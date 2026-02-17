'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '@/utils/tokenManager';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '@/app/components/dashboard/payment-form';

// Make sure to add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface Booking {
    id: string;
    eventType: string;
    eventDate: string;
    eventLocation: string;
    quotedPrice?: number;
    budget: number;
    adjustedPrice?: number;
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
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            if (!bookingId) return;

            try {
                // 1. Fetch Booking Details
                const bookingRes = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}`
                );
                const bookingData = await bookingRes.json();

                if (bookingData.success) {
                    setBooking(bookingData.data.booking);

                    // 2. Create Payment Intent
                    const intentRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bookingId })
                    });
                    const intentData = await intentRes.json();

                    if (intentData.success) {
                        setClientSecret(intentData.clientSecret);
                    } else {
                        toast.error(intentData.error || 'Failed to initialize payment');
                    }

                } else {
                    toast.error('Failed to load booking details');
                    router.push('/dashboard/bookings');
                }
            } catch (error) {
                console.error('Failed to initialize payment page:', error);
                toast.error('Failed to load payment details');
            } finally {
                setLoading(false);
            }
        };

        if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
            initialize();
        } else {
            // If key is missing, stop loading but show error
            setLoading(false);
            toast.error("Stripe Publishable Key is missing in environment variables.");
        }
    }, [bookingId, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!booking) {
        return null; // Or some error state
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        return (
            <div className="max-w-2xl mx-auto py-8 px-4 text-center">
                <h1 className="text-xl font-bold text-red-600">Configuration Error</h1>
                <p>Stripe Publishable Key is missing. Please check your environment variables.</p>
            </div>
        );
    }

    const amount = booking.adjustedPrice || booking.quotedPrice || booking.budget;
    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#f97316',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

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

                {/* Stripe Elements Form */}
                <div className="p-0">
                    {clientSecret && (
                        <Elements options={options} stripe={stripePromise}>
                            <PaymentForm
                                amount={amount}
                                vendorName={`${booking.vendor.firstName} ${booking.vendor.lastName}`}
                            />
                        </Elements>
                    )}
                </div>
            </div>

            {/* Info Notice */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> After successful payment, your booking will be confirmed.
                    70% of the payment will be released to the vendor after service completion.
                </p>
            </div>
        </div>
    );
}
