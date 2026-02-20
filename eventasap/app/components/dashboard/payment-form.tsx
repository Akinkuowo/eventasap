'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
    useStripe,
    useElements,
    PaymentElement,
    LinkAuthenticationElement
} from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

interface PaymentFormProps {
    amount: number;
    vendorName: string;
    onSuccess?: () => void;
}

export default function PaymentForm({ amount, vendorName, onSuccess }: PaymentFormProps) {
    const router = useRouter();
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard/payments?status=success`,
            },
            redirect: 'if_required'
        });

        if (error) {
            if (error.type === 'card_error' || error.type === 'validation_error') {
                setMessage(error.message || 'An unexpected error occurred.');
                toast.error(error.message);
            } else {
                setMessage('An unexpected error occurred. Please try again.');
                toast.error('Payment failed. Please try again.');
            }
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            toast.success('Payment successful! Redirecting to your bookings...');
            onSuccess?.();
            router.push('/dashboard/bookings');
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <LinkAuthenticationElement id="link-authentication-element" />
            <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />

            <div className="bg-orange-50 rounded-xl p-4 flex items-start space-x-3 mt-4">
                <ShieldCheck className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-orange-900">Secure Payment by Stripe</p>
                    <p className="text-xs text-orange-700">Your payment data is encrypted and secure.</p>
                </div>
            </div>

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 mt-6"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Pay £{amount.toLocaleString()} Now
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                )}
            </button>
            {message && <div id="payment-message" className="text-red-500 text-sm mt-2">{message}</div>}
        </form>
    );
}
