'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Shield,
    Lock,
    Mail,
    User,
    Phone,
    Key,
    Loader2,
    ArrowRight,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const NEXT_AUTH_PATH = process.env.NEXT_PUBLIC_API_URL;

const AdminRegister = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        adminSecret: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${NEXT_AUTH_PATH}/api/admin/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Admin registered successfully!');
                setTimeout(() => {
                    router.push('/admin/login');
                }, 2000);
            } else {
                toast.error(data.error || 'Registration failed');
                if (data.details) {
                    const newErrors: Record<string, string> = {};
                    data.details.forEach((err: any) => {
                        newErrors[err.field] = err.message;
                    });
                    setErrors(newErrors);
                } else {
                    setErrors({ general: data.error || 'Registration failed' });
                }
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="md:flex">
                        <div className="md:w-1/3 bg-slate-900 p-8 text-white flex flex-col justify-between border-r border-slate-800">
                            <div>
                                <Shield className="w-12 h-12 text-orange-500 mb-6" />
                                <h1 className="text-2xl font-bold mb-4">Request Admin Access</h1>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Administrative accounts are restricted to platform staff. A valid security key is required.
                                </p>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center space-x-3 text-sm text-slate-300">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Full platform oversight</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-slate-300">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Financial control</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-slate-300">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>User & Vendor management</span>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-2/3 p-8">
                            <form onSubmit={handleRegister} className="space-y-4">
                                {errors.general && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 mb-6">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <p className="text-red-700 text-sm font-medium">{errors.general}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="firstName"
                                                required
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="lastName"
                                                required
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                                            placeholder="admin@eventasap.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            required
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                                            placeholder="+44 700 000 000"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1 text-orange-600">Admin Secret Key</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                                            <input
                                                type="password"
                                                name="adminSecret"
                                                required
                                                value={formData.adminSecret}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2 bg-orange-50 border border-orange-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                                                placeholder="Enter Key"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Request Access</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                <div className="text-center pt-4">
                                    <p className="text-xs text-slate-500">
                                        Already have an admin account?{' '}
                                        <Link href="/admin/login" className="text-orange-600 font-semibold hover:underline">
                                            Login here
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminRegister;
