'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface VendorProfileSettingsProps {
    user: any;
}

export default function VendorProfileSettings({ user }: VendorProfileSettingsProps) {
    if (!user?.vendorProfile) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Vendor Profile</h2>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.vendorProfile.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : user.vendorProfile.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                            {user.vendorProfile.status}
                        </span>
                        {user.vendorProfile.isVerified && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                Verified
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name
                    </label>
                    <input
                        type="text"
                        value={user.vendorProfile.businessName || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 uppercase"
                        disabled
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Email
                    </label>
                    <input
                        type="email"
                        value={user.vendorProfile.businessEmail || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                        disabled
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Phone
                    </label>
                    <input
                        type="tel"
                        value={user.vendorProfile.businessPhone || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                        disabled
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                    </label>
                    <input
                        type="text"
                        value={`${user.vendorProfile.city || ''}, ${user.vendorProfile.country || ''}`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                        disabled
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Category
                </label>
                <input
                    type="text"
                    value={user.vendorProfile.category || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    disabled
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                </label>
                <textarea
                    value={user.vendorProfile.description || ''}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    disabled
                />
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl border border-orange-200">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-gray-900">Profile Status</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            {user.vendorProfile.status === 'PENDING'
                                ? 'Your vendor profile is under review. You will be notified once approved.'
                                : user.vendorProfile.status === 'APPROVED'
                                    ? 'Your vendor profile is active and visible to clients.'
                                    : 'Your vendor profile has been rejected. Please contact support for more information.'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
