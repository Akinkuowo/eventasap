'use client';

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    DollarSign,
    Calendar,
    ArrowUpRight,
    CheckCircle,
    User,
    Briefcase,
    AlertCircle,
    Loader2,
    Search,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Payment {
    id: string;
    amount: number;
    vendorPayout: number;
    payoutStatus: 'HELD' | 'RELEASED_TO_VENDOR' | 'COMPLETED';
    createdAt: string;
    booking: {
        id: string;
        serviceType: string;
        eventDate: string;
        vendorProfile?: {
            businessName: string;
            billingDetails?: {
                accountName: string;
                bankName: string;
                accountNumber: string;
                sortCode?: string;
                iban?: string;
                swiftCode?: string;
            };
        };
        client: {
            firstName: string;
            lastName: string;
        }
    }
}

const PayoutManagement = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isReleasing, setIsReleasing] = useState<string | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchHeldPayments();
    }, []);

    const fetchHeldPayments = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/admin/payments/held`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch payments');
            const data = await response.json();
            setPayments(data.data.payments);
        } catch (error) {
            toast.error('Error loading held payments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReleaseAction = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const confirmRelease = async () => {
        if (!selectedPayment) return;

        const paymentId = selectedPayment.id;
        setIsReleasing(paymentId);
        setIsModalOpen(false);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/admin/payments/${paymentId}/release`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({}) // Ensure body is present for Fastify
            });

            if (!response.ok) throw new Error('Release failed');
            toast.success('Funds released successfully');
            fetchHeldPayments();
        } catch (error) {
            toast.error('Could not release funds');
        } finally {
            setIsReleasing(null);
            setSelectedPayment(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Stats for Payouts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-24 h-24 text-gray-900" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-orange-100 rounded-2xl">
                                <CreditCard className="w-6 h-6 text-orange-600" />
                            </div>
                            <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest">Held Escrow</h4>
                        </div>
                        <h3 className="text-4xl font-black text-gray-900">
                            £{payments.reduce((acc, curr) => acc + curr.vendorPayout, 0).toLocaleString()}
                        </h3>
                        <p className="text-xs text-gray-400 font-medium mt-2 uppercase tracking-wide">Across {payments.length} awaiting disbursements</p>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Financial Disbursements</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Found funds requiring administrative authorization</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-6 animate-pulse">Synchronizing platform ledger...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50/50">
                        <div className="p-6 bg-green-50 rounded-full w-fit mx-auto mb-6">
                            <ShieldCheck className="w-12 h-12 text-green-500" />
                        </div>
                        <p className="text-gray-900 font-black uppercase text-xl">All Ledgers Clear</p>
                        <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">There are no held payments awaiting authorization at this timestamp.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 border-b border-slate-800">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction & Service</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client & Vendor</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout Value</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Auth Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-black text-gray-900 uppercase text-xs">#{payment.booking.id.slice(-6).toUpperCase()}</p>
                                                <p className="text-[10px] text-orange-600 font-black mt-1 uppercase tracking-widest leading-none bg-orange-50 px-2 py-1 rounded inline-block">
                                                    {payment.booking.serviceType}
                                                </p>
                                                <div className="flex items-center text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(payment.booking.eventDate).toLocaleDateString('en-GB')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-xs text-gray-900 font-black uppercase truncate max-w-[180px]">
                                                    <Briefcase className="w-3 h-3 mr-2 text-purple-600" />
                                                    {payment.booking.vendorProfile?.businessName || 'N/A'}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500 font-bold uppercase tracking-tighter">
                                                    <User className="w-3 h-3 mr-2 text-blue-500" />
                                                    {payment.booking.client.firstName} {payment.booking.client.lastName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 inline-block">
                                                <p className="text-sm font-black text-gray-900">£{payment.vendorPayout.toLocaleString()}</p>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-tight">Gross: £{payment.amount.toLocaleString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-4 py-1 bg-orange-100 text-orange-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-orange-200">
                                                {payment.payoutStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                disabled={isReleasing === payment.id}
                                                onClick={() => handleReleaseAction(payment)}
                                                className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-orange-600 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 ml-auto shadow-xl shadow-slate-200 hover:shadow-orange-200"
                                            >
                                                {isReleasing === payment.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <>
                                                        <span>Authorize Release</span>
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Payout Confirmation Modal */}
            <AnimatePresence>
                {isModalOpen && selectedPayment && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-md relative shadow-2xl overflow-hidden"
                        >
                            <div className="h-2 w-full bg-gradient-to-r from-orange-500 to-orange-600" />

                            <div className="p-10">
                                <div className="w-20 h-20 bg-orange-50 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                                    <ShieldCheck className="w-10 h-10 text-orange-600" />
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 uppercase text-center mb-2 tracking-tight">
                                    Confirm Payout
                                </h3>
                                <p className="text-slate-500 font-medium text-sm text-center mb-8">
                                    Verification required for <span className="text-slate-900 font-black">£{selectedPayment.vendorPayout.toLocaleString()}</span> disbursement.
                                </p>

                                {/* Vendor Bank Details */}
                                <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-4">Vendor Bank Details</p>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[9px] text-slate-400 font-black uppercase">Account Name</p>
                                            <p className="text-sm font-black text-slate-900 uppercase">
                                                {selectedPayment.booking.vendorProfile?.billingDetails?.accountName || 'Not Provided'}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-black uppercase">Bank</p>
                                                <p className="text-xs font-bold text-slate-700">
                                                    {selectedPayment.booking.vendorProfile?.billingDetails?.bankName || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-black uppercase">Account Number</p>
                                                <p className="text-xs font-bold text-slate-700">
                                                    {selectedPayment.booking.vendorProfile?.billingDetails?.accountNumber || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedPayment.booking.vendorProfile?.billingDetails?.sortCode && (
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-black uppercase">Sort Code</p>
                                                <p className="text-xs font-bold text-slate-700">
                                                    {selectedPayment.booking.vendorProfile?.billingDetails?.sortCode}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={confirmRelease}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-orange-600 transition-all flex items-center justify-center"
                                    >
                                        Authorize & Pay 70%
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-600 transition-colors"
                                    >
                                        Cancel Authorization
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PayoutManagement;
