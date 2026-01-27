'use client';

import React, { useState, useEffect } from 'react';
import {
    Clock,
    CheckCircle2,
    ArrowUpRight,
    Download,
    Filter,
    Search,
    Loader2,
    Calendar,
    Building
} from 'lucide-react';
import { fetchWithAuth } from '@/utils/tokenManager';

export default function PaymentHistory() {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPayments();
    }, [page]);

    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const response = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payments?page=${page}&limit=10`
            );
            const data = await response.json();

            if (data.success) {
                setPayments(data.data.payments);
                setTotalPages(data.data.pagination.totalPages);
            }
        } catch (err) {
            console.error('Error fetching payments:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (isLoading && payments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
                <p>Loading transaction history...</p>
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Transactions Yet</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                    Once you make payments for your bookings, they will appear here.
                </p>
                <button
                    onClick={() => window.location.href = '/dashboard/bookings'}
                    className="px-6 py-2 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors"
                >
                    View My Bookings
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Spent</p>
                    <p className="text-2xl font-black text-gray-900">
                        £{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </p>
                    <div className="flex items-center text-xs text-green-600 font-bold mt-1">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        Live Balance
                    </div>
                </div>
                {/* Additional summary cards can go here */}
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                                <Building className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{payment.booking?.serviceType || 'Payment'}</p>
                                                <p className="text-xs text-gray-500">#{payment.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-700">
                                            {payment.booking?.vendor?.vendorProfile?.businessName ||
                                                `${payment.booking?.vendor?.firstName} ${payment.booking?.vendor?.lastName}` ||
                                                'Vendor'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">{formatDate(payment.createdAt)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-sm font-black text-gray-900">£{payment.amount.toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-green-600 font-bold text-xs bg-green-50 px-2.5 py-1 rounded-full w-fit">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            {payment.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-white transition-all"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500 font-medium">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-white transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
