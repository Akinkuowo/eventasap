'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    CreditCard,
    History,
    ShieldCheck,
    Sparkles,
    AlertCircle,
    Loader2
} from 'lucide-react';
import PaymentForm from '@/app/components/dashboard/payment-form';
import PaymentHistory from '@/app/components/dashboard/payment-history';
import { fetchWithAuth } from '@/utils/tokenManager';

export default function PaymentsPage() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('booking');

    const [activeTab, setActiveTab] = useState(bookingId ? 'pay' : 'history');
    const [booking, setBooking] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (bookingId) {
            fetchBookingDetails();
        }
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}`);
            const data = await response.json();

            if (data.success) {
                setBooking(data.data.booking);
            } else {
                setError(data.error || 'Failed to fetch booking details');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header section with branding */}
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
                <div className="relative z-10">
                    <div className="flex items-center space-x-2 text-orange-100 font-bold text-sm mb-4 uppercase tracking-widest">
                        <Sparkles className="w-4 h-4" />
                        <span>Financial Center</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black mb-4">Payments & Transactions</h1>
                    <p className="text-orange-50 text-lg opacity-90 max-w-xl">
                        Securely pay for your event services and keep track of your financial history.
                    </p>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-10 w-32 h-32 bg-orange-400/20 rounded-full translate-y-1/2 blur-2xl"></div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
                {bookingId && (
                    <button
                        onClick={() => setActiveTab('pay')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'pay'
                                ? 'bg-white text-orange-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>Process Payment</span>
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'history'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <History className="w-4 h-4" />
                    <span>Payment History</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {activeTab === 'pay' && bookingId ? (
                        isLoading ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
                                <p className="text-gray-600">Loading booking information...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-white rounded-2xl border border-red-100 p-12 text-center space-y-4">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                                <h3 className="text-xl font-bold text-gray-900">Oops! Something went wrong</h3>
                                <p className="text-gray-600">{error}</p>
                                <button
                                    onClick={() => window.location.href = '/dashboard/bookings'}
                                    className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold"
                                >
                                    Go back to bookings
                                </button>
                            </div>
                        ) : booking ? (
                            <PaymentForm
                                bookingId={bookingId}
                                amount={booking.quotedPrice || booking.budget}
                                vendorName={booking.vendor?.vendorProfile?.businessName || `${booking.vendor?.firstName} ${booking.vendor?.lastName}`}
                                serviceType={booking.serviceType}
                                onSuccess={() => setActiveTab('history')}
                            />
                        ) : null
                    ) : (
                        <PaymentHistory />
                    )}
                </div>

                {/* Sidebar Info/Trust Box */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-start space-x-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">Our Security Guarantee</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Every transaction on EventASAP is protected by industry-standard encryption and security protocols.
                            </p>
                        </div>
                    </div>

                    <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 relative overflow-hidden">
                        <h4 className="font-bold text-orange-900 mb-2 relative z-10">Need Assistance?</h4>
                        <p className="text-sm text-orange-800 leading-relaxed mb-4 relative z-10">
                            Our support team is available 24/7 to help you with any billing or payment questions.
                        </p>
                        <button className="text-orange-600 font-bold text-sm flex items-center hover:text-orange-700 transition-colors relative z-10">
                            Contact Billing Support
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-10">
                            <Sparkles className="w-24 h-24 text-orange-600" />
                        </div>
                    </div>

                    {activeTab === 'pay' && booking && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h4 className="font-bold text-gray-900 mb-4">Payment Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Service Fee</span>
                                    <span className="text-gray-900 font-medium">£{(booking.quotedPrice || booking.budget).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Booking Commission</span>
                                    <span className="text-gray-900 font-medium">Included</span>
                                </div>
                                <div className="h-px bg-gray-50 my-2"></div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-900">Total Due</span>
                                    <span className="font-black text-orange-600 text-lg">£{(booking.quotedPrice || booking.budget).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Minimal arrow icon for the sidebar
function ArrowRight({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
    );
}
