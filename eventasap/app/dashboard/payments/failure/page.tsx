'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, RefreshCw, ArrowLeft, HelpCircle } from 'lucide-react';

export default function PaymentFailurePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const [retrying, setRetrying] = useState(false);

    const handleRetry = () => {
        if (bookingId) {
            setRetrying(true);
            router.push(`/dashboard/payments/${bookingId}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                    {/* Error Icon */}
                    <div className="mb-6 relative">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                            <XCircle className="w-14 h-14 text-white" strokeWidth={3} />
                        </div>
                    </div>

                    {/* Error Message */}
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
                        Payment Failed
                    </h1>
                    <p className="text-gray-600 mb-8">
                        We were unable to process your payment. This could be due to insufficient funds,
                        incorrect payment details, or a network issue.
                    </p>

                    {/* Common Reasons */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
                        <div className="flex items-start mb-3">
                            <HelpCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                            <h3 className="font-bold text-red-900">Common reasons for payment failure:</h3>
                        </div>
                        <ul className="text-sm text-red-800 space-y-2 ml-7">
                            <li>• Insufficient funds in your account</li>
                            <li>• Incorrect payment details</li>
                            <li>• Payment blocked by your bank</li>
                            <li>• Network or connection issues</li>
                        </ul>
                    </div>

                    {/* What to do next */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                        <h3 className="font-bold text-blue-900 mb-2">What you can do:</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                            <li className="flex items-start">
                                <span className="mr-2">1.</span>
                                <span>Check your payment method has sufficient funds</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">2.</span>
                                <span>Verify your payment details are correct</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">3.</span>
                                <span>Try a different payment method</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">4.</span>
                                <span>Contact your bank if the issue persists</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {bookingId && (
                            <button
                                onClick={handleRetry}
                                disabled={retrying}
                                className="w-full flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                                {retrying ? 'Redirecting...' : 'Try Again'}
                            </button>
                        )}
                        <button
                            onClick={() => router.push('/dashboard/bookings')}
                            className="w-full flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Bookings
                        </button>
                    </div>
                </div>

                {/* Support Info */}
                <div className="bg-white rounded-xl shadow-lg p-4 mt-6 text-center">
                    <p className="text-sm text-gray-700 mb-2">
                        <strong>Need assistance?</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                        Contact our support team at{' '}
                        <a href="mailto:support@eventasap.com" className="text-orange-500 hover:text-orange-600 font-medium">
                            support@eventasap.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
