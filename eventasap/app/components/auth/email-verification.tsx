// components/auth/email-verification.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, X, Loader2, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const NEXT_AUTH_PATH = process.env.NEXT_PUBLIC_API_URL;

const VerifyEmailComponent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (token) {
            verifyEmailToken();
        } else {
            setVerificationStatus('error');
            setMessage('No verification token provided');
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (verificationStatus === 'success' && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);

            if (countdown === 0) {
                router.push('/login');
            }

            return () => clearTimeout(timer);
        }
    }, [verificationStatus, countdown, router]);

    const verifyEmailToken = async () => {
        try {
            const response = await fetch(`${NEXT_AUTH_PATH}/api/auth/verify-email/${token}`, {
                method: 'GET', // Changed from POST to GET
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setVerificationStatus('success');
                setMessage(data.message || 'Email verified successfully!');
                toast.success('Email verified successfully!');
            } else {
                setVerificationStatus('error');
                setMessage(data.error || 'Verification failed');
                toast.error(data.error || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setVerificationStatus('error');
            setMessage('Network error. Please try again.');
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            toast.error('Email is required to resend verification');
            return;
        }

        try {
            const response = await fetch(`${NEXT_AUTH_PATH}/api/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Verification email resent successfully!');
            } else {
                toast.error(data.error || 'Failed to resend verification email');
            }
        } catch (error) {
            console.error('Resend error:', error);
            toast.error('Network error. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying your email...</h2>
                        <p className="text-gray-600 text-center">
                            Please wait while we verify your email address.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${verificationStatus === 'success'
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}>
                        {verificationStatus === 'success' ? (
                            <Check className="w-10 h-10 text-white" />
                        ) : (
                            <X className="w-10 h-10 text-white" />
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {verificationStatus === 'success' ? 'Email Verified!' : 'Verification Failed'}
                    </h2>

                    <p className="text-gray-600 mb-6">
                        {message}
                    </p>

                    {verificationStatus === 'success' && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl mb-6">
                            <div className="flex items-center justify-center space-x-3">
                                <Check className="w-5 h-5 text-green-600" />
                                <p className="text-sm text-gray-700">
                                    Your email has been successfully verified.
                                </p>
                            </div>
                        </div>
                    )}

                    {verificationStatus === 'error' && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl mb-6">
                            <div className="flex items-center justify-center space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <p className="text-sm text-gray-700">
                                    {message}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {verificationStatus === 'success' ? (
                            <>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4">
                                    <p className="text-sm text-blue-700">
                                        Redirecting to login in <span className="font-bold">{countdown}</span> seconds...
                                    </p>
                                </div>

                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                                >
                                    Go to Login
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Back to Login
                                </button>

                                {email && (
                                    <button
                                        onClick={handleResendVerification}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Resend Verification Email
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            Need help?{' '}
                            <a href="/contact" className="text-orange-600 hover:underline font-medium">
                                Contact Support
                            </a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default VerifyEmailComponent; // Make sure this is exported as default