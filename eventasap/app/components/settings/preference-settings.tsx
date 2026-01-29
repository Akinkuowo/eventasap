'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, DollarSign, Moon, Sun, Info, Loader2, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../theme-provider';

export default function PreferenceSettings() {
    const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        language: 'en',
        currency: 'GBP',
        theme: globalTheme,
        timezone: 'UTC'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
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
                body: JSON.stringify(settings)
            });
            if (response.ok) {
                setGlobalTheme(settings.theme as any);
                toast.success('Preferences saved');
            } else {
                toast.error('Failed to save preferences');
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
                <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
                <p className="text-sm text-gray-500 mt-1">Customize your platform experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Language & Regions */}
                <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Regional Settings</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Languages className="w-4 h-4 mr-2" />
                            Language
                        </label>
                        <select
                            name="language"
                            value={settings.language}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 appearance-none bg-white"
                        >
                            <option value="en">English (UK)</option>
                            <option value="us">English (US)</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="es">Spanish</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Default Currency
                        </label>
                        <select
                            name="currency"
                            value={settings.currency}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 appearance-none bg-white"
                        >
                            <option value="GBP">GBP (£)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                        </select>
                    </div>
                </div>

                {/* Appearance */}
                <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Appearance</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">Color Theme</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
                                className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${settings.theme === 'light' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                            >
                                <Sun className="w-5 h-5 mr-2" />
                                <span className="font-medium">Light</span>
                            </button>
                            <button
                                onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                                className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${settings.theme === 'dark' ? 'border-orange-500 bg-orange-900 text-orange-400' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                            >
                                <Moon className="w-5 h-5 mr-2" />
                                <span className="font-medium">Dark</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                            name="timezone"
                            value={settings.timezone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 appearance-none bg-white"
                        >
                            <option value="UTC">UTC (London)</option>
                            <option value="EST">EST (New York)</option>
                            <option value="PST">PST (Los Angeles)</option>
                            <option value="CET">CET (Paris)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Info className="w-4 h-4" />
                    <span>Some images and layout might change based on theme</span>
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
