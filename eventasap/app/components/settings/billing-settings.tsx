'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Building, User, Info, Loader2, Landmark } from 'lucide-react';
import { toast } from 'sonner';

export default function BillingSettings() {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        accountName: '',
        bankName: '',
        accountNumber: '',
        sortCode: '',
        iban: '',
        swiftCode: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.accountName || !formData.accountNumber || !formData.bankName) {
            toast.error('Please fill in the required fields');
            return;
        }
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update-billing`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                toast.success('Payout details saved successfully');
            } else {
                toast.error('Failed to save payout details');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div>
                <h2 className="text-xl font-bold text-gray-900">Billing & Payouts</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your bank account details for receiving payments</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-purple-50 rounded-2xl p-6 border border-orange-100 flex items-start space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Landmark className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Payout Account</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Ensure your bank details are correct to avoid delays in receiving your funds.
                        Funds are typically settled within 3-5 business days.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Holder Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="accountName"
                            placeholder="Full Name or Business Name"
                            value={formData.accountName}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="bankName"
                            placeholder="e.g. Barclays, HSBC"
                            value={formData.bankName}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="accountNumber"
                            placeholder="Enter 8-digit account number"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Code
                    </label>
                    <input
                        type="text"
                        name="sortCode"
                        placeholder="XX-XX-XX"
                        value={formData.sortCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        IBAN (Optional)
                    </label>
                    <input
                        type="text"
                        name="iban"
                        placeholder="GBXX XXXX XXXX XXXX XXXX XX"
                        value={formData.iban}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Info className="w-4 h-4" />
                    <span>Your details are encrypted and stored securely</span>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Account Details'
                    )}
                </button>
            </div>
        </motion.div>
    );
}
