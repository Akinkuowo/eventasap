// components/auth/LoginForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Mail,
    Lock,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    Loader2,
    ArrowRight,
    Sparkles,
    Shield,
    Users,
    Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const NEXT_AUTH_PATH = process.env.NEXT_PUBLIC_API_URL

const LoginForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

    // Check for redirect from registration
    useEffect(() => {
        const registeredEmail = searchParams.get('registered');
        if (registeredEmail) {
            toast.success('Registration successful! Please verify your email before logging in.');
            setFormData(prev => ({ ...prev, email: registeredEmail }));
        }

        const verified = searchParams.get('verified');
        if (verified === 'true') {
            toast.success('Email verified successfully! You can now login.');
        }
    }, [searchParams]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch(`${NEXT_AUTH_PATH}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Login successful!');

                // Store tokens and user data
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                // Redirect to dashboard immediately
                setTimeout(() => {
                    router.push('/dashboard');
                }, 500);

            } else if (response.status === 403 && data.requiresVerification) {
                // Email not verified
                setPendingVerificationEmail(data.email);
                setShowVerificationModal(true);
                toast.error('Please verify your email address');

            } else {
                toast.error(data.error || 'Login failed');
                setErrors({
                    general: data.error || 'Invalid credentials'
                });
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
            setErrors({
                general: 'Network error. Please check your connection.'
            });
        } finally {
            setIsLoading(false);
        }
    };


    const handleResendVerification = async () => {
        try {
            setIsLoading(true);
            // This endpoint needs to be created in your backend
            const response = await fetch(`${NEXT_AUTH_PATH}/api/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: pendingVerificationEmail }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Verification email sent! Check your inbox.');
                setShowVerificationModal(false);
            } else {
                toast.error(data.error || 'Failed to send verification email');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!formData.email) {
            toast.error('Please enter your email address first');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${NEXT_AUTH_PATH}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Password reset instructions sent to your email');
            } else {
                toast.error(data.error || 'Failed to send reset instructions');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const VerificationModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
                    <p className="text-gray-600">
                        Please check your email ({pendingVerificationEmail}) for the verification link before logging in.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-2">What to do next:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                            <li>Check your email inbox (and spam folder)</li>
                            <li>Click the verification link in the email</li>
                            <li>Return here and login again</li>
                        </ol>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowVerificationModal(false)}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleResendVerification}
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                                    Sending...
                                </>
                            ) : (
                                'Resend Email'
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );


    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="md:flex">
                        {/* Left Side - Branding */}
                        <div className="md:w-2/5 bg-gradient-to-br from-orange-500 to-purple-600 p-8 text-white">
                            <div className="h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center space-x-3 mb-8">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                            <Sparkles className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold">EventASAP</h1>
                                            <p className="text-orange-100 text-sm">Event Marketplace</p>
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-bold mb-4">
                                        Welcome Back!
                                    </h2>

                                    <p className="text-orange-100 mb-6">
                                        Sign in to access your client or vendor dashboard. Switch roles instantly with one account.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <span>Instant role switching</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <span>Secure account protection</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <span>AI-powered insights</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <p className="text-sm text-orange-100">
                                        New to EventASAP?{' '}
                                        <Link href="/signup" className="text-white font-semibold hover:underline">
                                            Create account
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="md:w-3/5 p-8">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-gray-900">Sign In</h3>
                                <p className="text-gray-600 mt-1">Enter your credentials to continue</p>
                            </div>

                            {errors.general && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <p className="text-red-700 font-medium">{errors.general}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-black ${errors.email
                                                ? 'border-red-500 focus:ring-red-200'
                                                : 'border-black focus:ring-gray-200 focus:border-black'
                                                }`}
                                            placeholder="your.email@example.com"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Password *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            disabled={isLoading}
                                            className="text-sm font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-black ${errors.password
                                                ? 'border-red-500 focus:ring-red-200'
                                                : 'border-black focus:ring-gray-200 focus:border-black'
                                                }`}
                                            placeholder="Enter your password"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                    />
                                    <label htmlFor="rememberMe" className="text-sm text-gray-700">
                                        Remember me for 30 days
                                    </label>
                                </div>

                                {/* Security Note */}
                                <div className="p-4 bg-gradient-to-r from-orange-50 to-purple-50 border border-orange-200 rounded-xl">
                                    <div className="flex items-start space-x-3">
                                        <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">Secure Login</h4>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Your session is protected with end-to-end encryption. Never share your credentials.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Login Button */}
                                <button
                                    onClick={handleLogin}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                {/* Demo Accounts (for development) */}
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setFormData({
                                                email: 'demo@eventasap.com',
                                                password: 'demo123',
                                                rememberMe: false
                                            });
                                        }}
                                        disabled={isLoading}
                                        className="w-full py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                                    >
                                        Use Demo Account
                                    </button>

                                    <div className="text-center">
                                        <Link
                                            href="/signup"
                                            className="text-sm font-medium text-orange-600 hover:text-orange-700"
                                        >
                                            Don't have an account? Sign up
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-xs text-gray-500 text-center">
                                    By signing in, you agree to our{' '}
                                    <Link href="/terms" className="text-orange-600 hover:underline font-medium">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="text-orange-600 hover:underline font-medium">
                                        Privacy Policy
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tech Stack */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 mb-2">Powered by</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full">Next.js</span>
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full">PostgreSQL</span>
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full">Fastify</span>
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-400 to-purple-400 text-white text-xs font-bold rounded-full">Prisma</span>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showVerificationModal && <VerificationModal />}
        </div>
    );
};

export default LoginForm;