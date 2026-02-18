'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Camera, X, User } from 'lucide-react';
import { toast } from 'sonner';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ProfileSettingsProps {
    user: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleProfileUpdate: () => Promise<void>;
    isSaving: boolean;
    onAvatarChange: (avatarData: string | null) => void;
}

export default function ProfileSettings({ user, handleInputChange, handleProfileUpdate, isSaving, onAvatarChange }: ProfileSettingsProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Only PNG, JPG, and WEBP are allowed');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size exceeds 5MB limit');
            return;
        }

        // Convert to base64 and preview
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setAvatarPreview(base64String);
            onAvatarChange(base64String);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        onAvatarChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const currentAvatar = avatarPreview || (user.avatarUrl ? `${NEXT_PUBLIC_API_URL}${user.avatarUrl}` : null);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>

            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-200">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                        {currentAvatar ? (
                            <img
                                src={currentAvatar}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-16 h-16 text-gray-400" />
                        )}
                    </div>

                    {/* Hover overlay */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar || isSaving}
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <Camera className="w-8 h-8 text-white" />
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                />

                <div className="flex gap-3">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar || isSaving}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                    >
                        Change Photo
                    </button>

                    {(currentAvatar || user.avatarUrl) && (
                        <button
                            onClick={handleRemoveAvatar}
                            disabled={isUploadingAvatar || isSaving}
                            className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Remove
                        </button>
                    )}
                </div>

                <p className="text-xs text-gray-500 text-center max-w-xs">
                    Recommended: Square image, at least 400x400px. Max size: 5MB. Formats: PNG, JPG, WEBP
                </p>
            </div>

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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 text-black"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 text-black"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-black"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 text-black"
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
