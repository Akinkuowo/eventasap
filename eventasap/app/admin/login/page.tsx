'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Shield,
    Lock,
    Mail,
    Loader2,
    ArrowRight,
    AlertCircle,
    LayoutDashboard
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const NEXT_AUTH_PATH = process.env.NEXT_PUBLIC_API_URL;

const AdminLogin = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${NEXT_AUTH_PATH}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.data.user.activeRole !== 'ADMIN') {
                    toast.error('Unauthorized access. Admin privileges required.');
                    setIsLoading(false);
                    return;
                }

                toast.success('Admin login successful!');
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000);
            } else {
                toast.error(data.error || 'Login failed');
                setErrors({ general: data.error || 'Invalid credentials' });
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="p-8 bg-slate-900 text-white text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                            <Shield className="w-8 h-8 text-orange-500" />
                        </div>
                        <h1 className="text-2xl font-bold">Admin Portal</h1>
                        <p className="text-slate-400 text-sm mt-1">Platform Administration & Control</p>
                    </div>

                    <form onSubmit={handleLogin} className="p-8 space-y-6">
                        {errors.general && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <p className="text-red-700 text-sm font-medium">{errors.general}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Admin Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900"
                                        placeholder="admin@eventasap.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Security Code
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Authenticate</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-4">
                            <p className="text-sm text-slate-500">
                                Need an admin account?{' '}
                                <Link href="/admin/register" className="text-orange-600 font-semibold hover:underline">
                                    Register Access
                                </Link>
                            </p>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <Link
                                    href="/login"
                                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                                >
                                    <LayoutDashboard className="w-3 h-3 mr-1" />
                                    Back to Main Dashboard
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-400 mt-8">
                    &copy; 2026 EventASAP. Protected Administrative Access.
                </p>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
