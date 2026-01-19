// components/RoleSwitcher.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Users, Briefcase, ChevronDown, LogOut, UserPlus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    activeRole: 'VENDOR' | 'CLIENT';
    hasVendorProfile: boolean;
    hasClientProfile: boolean;
    vendorProfile?: any;
    clientProfile?: any;
}

interface RoleSwitcherProps {
    user: UserData;
    onRoleSwitch?: (newRole: 'VENDOR' | 'CLIENT') => void;
    compact?: boolean;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ user, onRoleSwitch, compact = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);

    const availableRoles = [
        {
            id: 'CLIENT',
            label: 'Client Mode',
            description: 'Browse and book vendors',
            icon: Users,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200'
        },
        {
            id: 'VENDOR',
            label: 'Vendor Mode',
            description: 'Manage your business',
            icon: Briefcase,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            disabled: !user.hasVendorProfile
        }
    ];

    const currentRole = availableRoles.find(role => role.id === user.activeRole);

    const handleRoleSwitch = async (roleId: 'VENDOR' | 'CLIENT') => {
        if (roleId === user.activeRole) {
            setIsOpen(false);
            return;
        }

        if (roleId === 'VENDOR' && !user.hasVendorProfile) {
            setShowVendorModal(true);
            setIsOpen(false);
            return;
        }

        setIsSwitching(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/switch-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ role: roleId })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Switched to ${roleId.toLowerCase()} mode`);

                // Update localStorage
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                currentUser.activeRole = roleId;
                localStorage.setItem('user', JSON.stringify(currentUser));

                // Update token with new role
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    payload.activeRole = roleId;
                    // Note: In production, you'd get a new token from the server
                }

                onRoleSwitch?.(roleId);
                window.location.reload(); // Refresh to load correct dashboard
            } else {
                toast.error(data.error || 'Failed to switch role');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsSwitching(false);
            setIsOpen(false);
        }
    };

    const AddVendorProfileModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Become a Vendor</h3>
                    <p className="text-gray-600">
                        Add a vendor profile to offer your services on EventASAP
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="p-4 border border-gray-200 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-2">Vendor Benefits</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center space-x-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>List your services to thousands of clients</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>AI-powered pricing recommendations</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Automated booking and payments</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Advanced analytics dashboard</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowVendorModal(false)}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Later
                    </button>
                    <button
                        onClick={() => {
                            setShowVendorModal(false);
                            window.location.href = '/vendor/setup';
                        }}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                        Setup Vendor Profile
                    </button>
                </div>
            </div>
        </div>
    );

    if (compact) {
        return (
            <>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isSwitching}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                    {currentRole && (
                        <>
                            <currentRole.icon className={`w-5 h-5 ${currentRole.color}`} />
                            <span className="font-medium text-gray-700">
                                {currentRole.label}
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </>
                    )}
                </button>

                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-40">
                        <div className="p-2">
                            {availableRoles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => handleRoleSwitch(role.id as 'VENDOR' | 'CLIENT')}
                                    disabled={role.disabled || isSwitching}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${role.disabled
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-gray-50'
                                        } ${user.activeRole === role.id
                                            ? `${role.bgColor} ${role.borderColor} border`
                                            : ''
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role.bgColor}`}>
                                            <role.icon className={`w-5 h-5 ${role.color}`} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-gray-900">{role.label}</div>
                                            <div className="text-xs text-gray-500">{role.description}</div>
                                        </div>
                                    </div>
                                    {user.activeRole === role.id && (
                                        <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}

                            {!user.hasVendorProfile && (
                                <button
                                    onClick={() => setShowVendorModal(true)}
                                    className="w-full mt-2 p-3 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-50 to-purple-50 flex items-center justify-center">
                                            <UserPlus className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-gray-900">Become a Vendor</div>
                                            <div className="text-xs text-gray-500">Add vendor profile</div>
                                        </div>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {showVendorModal && <AddVendorProfileModal />}
            </>
        );
    }

    // Full version for dashboard
    return (
        <>
            <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Account Mode</h3>
                        <p className="text-sm text-gray-600">Switch between client and vendor roles</p>
                    </div>
                    {currentRole && (
                        <div className={`px-4 py-2 rounded-full ${currentRole.bgColor} ${currentRole.borderColor} border`}>
                            <div className="flex items-center space-x-2">
                                <currentRole.icon className={`w-5 h-5 ${currentRole.color}`} />
                                <span className="font-semibold">{currentRole.label}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {availableRoles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => handleRoleSwitch(role.id as 'VENDOR' | 'CLIENT')}
                            disabled={role.disabled || isSwitching}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${role.disabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:scale-[1.02] hover:shadow-lg'
                                } ${user.activeRole === role.id
                                    ? `${role.borderColor} ${role.bgColor} shadow-md`
                                    : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${role.bgColor}`}>
                                    <role.icon className={`w-6 h-6 ${role.color}`} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900">{role.label}</div>
                                    <div className="text-sm text-gray-600">{role.description}</div>
                                </div>
                            </div>

                            {user.activeRole === role.id && (
                                <div className="mt-4 flex items-center justify-center">
                                    <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-purple-600 text-white text-sm font-semibold rounded-full">
                                        Current Mode
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {!user.hasVendorProfile && (
                    <div className="mt-6 p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-50 to-purple-50 flex items-center justify-center">
                                    <UserPlus className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Ready to offer your services?</div>
                                    <div className="text-sm text-gray-600">Add a vendor profile to start accepting bookings</div>
                                </div>
                            </div>
                            <button
                                onClick={() => window.location.href = '/vendor/setup'}
                                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showVendorModal && <AddVendorProfileModal />}
        </>
    );
};

export default RoleSwitcher;