'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Smartphone, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        bookingUpdates: true,
        marketingEmails: false,
        paymentReminders: true,
        newProposals: true
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update-preferences`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notifications: settings })
            });
            if (response.ok) {
                toast.success('Notification preferences updated');
            } else {
                toast.error('Failed to update preferences');
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
                <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Choose how you want to be notified about updates and activity</p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    {/* Channel Settings */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Notification Channels</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Email Notifications</p>
                                        <p className="text-xs text-gray-500">Receive updates via your registered email</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">SMS Notifications</p>
                                        <p className="text-xs text-gray-500">Get instant alerts on your mobile phone</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={settings.smsNotifications} onChange={() => handleToggle('smsNotifications')} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Activity Settings */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Activity Alerts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { id: 'bookingUpdates', label: 'Booking Updates', desc: 'When a booking status changes' },
                                { id: 'newProposals', label: 'New Proposals', desc: 'When you receive a new proposal' },
                                { id: 'paymentReminders', label: 'Payment Reminders', desc: 'Alerts about upcoming payments' },
                                { id: 'marketingEmails', label: 'News & Promotions', desc: 'Updates about features and offers' }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.label}</p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={settings[item.id as keyof typeof settings]} onChange={() => handleToggle(item.id as keyof typeof settings)} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Info className="w-4 h-4" />
                    <span>Some critical alerts cannot be disabled</span>
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
                        'Save Preferences'
                    )}
                </button>
            </div>
        </motion.div>
    );
}
