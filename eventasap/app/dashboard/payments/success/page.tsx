'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Trigger confetti animation
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }

            confetti({
                particleCount: 2,
                angle: randomInRange(55, 125),
                spread: randomInRange(50, 70),
                origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                colors: ['#f97316', '#fb923c', '#fdba74']
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                    {/* Success Icon */}
                    <div className="mb-6 relative">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle className="w-14 h-14 text-white" strokeWidth={3} />
                        </div>
                        <div className="absolute inset-0 w-24 h-24 mx-auto bg-green-400 rounded-full animate-ping opacity-20"></div>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
                        Payment Successful! 🎉
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Your booking has been confirmed and payment processed successfully.
                        The vendor has been notified and will prepare for your event.
                    </p>

                    {/* Info Box */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
                        <h3 className="font-bold text-green-900 mb-2">What happens next?</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                            <li className="flex items-start">
                                <span className="mr-2">✓</span>
                                <span>You'll receive a confirmation email shortly</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">✓</span>
                                <span>The vendor will contact you to finalize details</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">✓</span>
                                <span>70% of your payment will be released to the vendor after service completion</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {bookingId && (
                            <button
                                onClick={() => router.push(`/dashboard/bookings/${bookingId}`)}
                                className="w-full flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                            >
                                View Booking Details
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        )}
                        <button
                            onClick={() => router.push('/dashboard/bookings')}
                            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Back to Bookings
                        </button>
                    </div>
                </div>

                {/* Additional Info */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Need help? Contact our support team at support@eventasap.com
                </p>
            </div>
        </div>
    );
}
