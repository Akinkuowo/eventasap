'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function SecuritySettings() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <h2 className="text-xl font-bold text-gray-900">Security</h2>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                </label>
                <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                    placeholder="Enter current password"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                    </label>
                    <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                        placeholder="Enter new password"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                        placeholder="Confirm new password"
                    />
                </div>
            </div>

            <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300">
                Change Password
            </button>
        </motion.div>
    );
}
