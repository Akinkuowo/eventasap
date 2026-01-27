'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProfileSettingsProps {
    user: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleProfileUpdate: () => Promise<void>;
    isSaving: boolean;
}

export default function ProfileSettings({ user, handleInputChange, handleProfileUpdate, isSaving }: ProfileSettingsProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        value={user.firstName || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        value={user.lastName || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                </label>
                <input
                    type="email"
                    value={user.email || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed"
                    disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                </label>
                <input
                    type="tel"
                    name="phoneNumber"
                    value={user.phoneNumber || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                    placeholder="+44 1234 567890"
                />
            </div>

            <button
                onClick={handleProfileUpdate}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center"
            >
                {isSaving ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                    </>
                ) : (
                    'Save Changes'
                )}
            </button>
        </motion.div>
    );
}
