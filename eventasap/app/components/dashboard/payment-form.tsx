'use client';

import React, { useState, FormEvent } from 'react';
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
}

export default function PaymentForm({ amount, vendorName }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}/dashboard/payments/success`,
            },
        });

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`. For some payment methods like iDEAL, your customer will
        // be redirected to an intermediate site first to authorize the payment, then
        // redirected to the `return_url`.
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "An unexpected error occurred.");
            toast.error(error.message);
        } else {
            setMessage("An unexpected error occurred.");
            toast.error("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <LinkAuthenticationElement
                id="link-authentication-element"
            />
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

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
