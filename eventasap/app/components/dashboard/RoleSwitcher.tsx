// components/dashboard/RoleSwitcher.tsx
'use client';

import React, { useState } from 'react';
import { Users, Briefcase, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/utils/tokenManager';

interface RoleSwitcherProps {
    user: any;
    onRoleSwitch?: (newRole: string) => void;
}

const NEXT_AUTH_PATH = process.env.NEXT_PUBLIC_API_URL

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ user, onRoleSwitch }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);

    const roles = [
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
            disabled: !user?.hasVendorProfile
        }
    ];

    const currentRole = roles.find(role => role.id === user?.activeRole);

    const handleRoleSwitch = async (roleId: 'VENDOR' | 'CLIENT') => {
        if (roleId === user?.activeRole) {
            setIsOpen(false);
            return;
        }

        if (roleId === 'VENDOR' && !user?.hasVendorProfile) {
            toast.error('Please complete your vendor profile first');
            setIsOpen(false);
            return;
        }

        setIsSwitching(true);

        try {
            const response = await fetchWithAuth(`${NEXT_AUTH_PATH}/api/auth/switch-role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: roleId })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(`Switched to ${roleId.toLowerCase()} mode`);

                // Update localStorage with new user data
                const updatedUser = {
                    ...user,
                    activeRole: roleId,
                    // Update with any new user data from response
                    ...(data.data?.user || {})
                };

                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Update tokens if provided in response
                if (data.data?.accessToken) {
                    localStorage.setItem('accessToken', data.data.accessToken);
                }
                if (data.data?.refreshToken) {
                    localStorage.setItem('refreshToken', data.data.refreshToken);
                }

                // Call the callback if provided
                if (onRoleSwitch) {
                    onRoleSwitch(roleId);
                }

                // Dispatch event for other components to react
                window.dispatchEvent(new CustomEvent('roleSwitched', {
                    detail: {
                        newRole: roleId,
                        user: updatedUser
                    }
                }));

                // Reload the page after a short delay to update the dashboard
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

            } else {
                toast.error(data.error || 'Failed to switch role');

                // If the error is about session, clear tokens
                if (data.error?.includes('session') || data.error?.includes('token')) {
                    localStorage.clear();
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                }
            }
        } catch (error: any) {
            console.error('Role switch error:', error);

            if (error.message === 'Authentication failed' ||
                error.message === 'Failed to refresh token' ||
                error.message.includes('session')) {

                toast.error('Session expired. Please login again.');
                localStorage.clear();
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            } else if (error.message === 'Failed to fetch') {
                toast.error('Cannot connect to server. Please check your connection.');
            } else {
                toast.error(error.message || 'Network error. Please try again.');
            }
        } finally {
            setIsSwitching(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isSwitching}
                className="w-full flex items-center justify-between p-3 border rounded-xl hover:shadow-md transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentRole?.bgColor}`}>
                        {currentRole && <currentRole.icon className={`w-5 h-5 ${currentRole.color}`} />}
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">
                            {currentRole?.label}
                            {isSwitching && <span className="ml-2 text-xs text-gray-500">(switching...)</span>}
                        </div>
                        <div className="text-xs text-gray-500">{currentRole?.description}</div>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                        <div className="p-2">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => handleRoleSwitch(role.id as 'VENDOR' | 'CLIENT')}
                                    disabled={role.disabled || isSwitching}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 mb-1 ${role.disabled
                                        ? 'opacity-50 cursor-not-allowed'
                                        : isSwitching
                                            ? 'opacity-50 cursor-wait'
                                            : 'hover:bg-gray-50'
                                        } ${user?.activeRole === role.id
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
                                    {user?.activeRole === role.id && (
                                        <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}

                            {!user?.hasVendorProfile && (
                                <a
                                    href="/dashboard/settings?tab=vendor"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsOpen(false);
                                        window.location.href = '/dashboard/settings?tab=vendor';
                                    }}
                                    className="w-full mt-2 p-3 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-orange-500" />
                                    <div className="text-left">
                                        <div className="text-sm font-semibold text-gray-900">Complete Vendor Profile</div>
                                        <div className="text-xs text-gray-500">Add business details to enable vendor mode</div>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RoleSwitcher;