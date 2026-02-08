'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Upload, FileText, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VendorProfileSettingsProps {
    user: any;
    onUpdate: (data: any) => Promise<void>;
    isSaving: boolean;
}

export default function VendorProfileSettings({ user, onUpdate, isSaving }: VendorProfileSettingsProps) {
    const [proofFile, setProofFile] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');

    if (!user?.vendorProfile) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("File size should be less than 5MB");
                return;
            }

            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofFile(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadProof = async () => {
        if (!proofFile) return;

        await onUpdate({
            businessProof: proofFile
        });

        setProofFile(null);
        setFileName('');
    };

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

            {/* Proof of Business Section */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proof of Business</h3>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Business Document
                            </label>
                            <p className="text-sm text-gray-500 mb-4">
                                Please upload a valid business license, registration document, or poof of address to verify your business.
                                <span className="text-orange-600 font-medium ml-1">
                                    Note: Uploading a new document will reset your verification status to PENDING.
                                </span>
                            </p>

                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose File
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        disabled={isSaving}
                                    />
                                </label>
                                {fileName && (
                                    <span className="text-sm text-gray-600 flex items-center">
                                        <FileText className="w-4 h-4 mr-1" />
                                        {fileName}
                                    </span>
                                )}
                            </div>
                        </div>

                        {proofFile && (
                            <button
                                onClick={handleUploadProof}
                                disabled={isSaving}
                                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Submit Document
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {user.vendorProfile.businessProof && !proofFile && (
                        <div className="mt-4 flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg inline-flex">
                            <Check className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Proof of Business document on file</span>
                        </div>
                    )}
                </div>
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
