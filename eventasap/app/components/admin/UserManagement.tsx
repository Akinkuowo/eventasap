'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    User,
    Mail,
    Phone,
    Shield,
    CheckCircle,
    XCircle,
    Calendar,
    MoreHorizontal,
    Search as SearchIcon,
    Loader2,
    ShieldAlert,
    Power,
    RefreshCw,
    UserPlus,
    ChevronRight,
    Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    activeRole: 'CLIENT' | 'VENDOR' | 'ADMIN';
    emailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    hasVendorProfile: boolean;
    hasClientProfile: boolean;
}

const UserManagement = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'ALL' | 'CLIENT' | 'VENDOR' | 'ADMIN'>('ALL');
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [isActing, setIsActing] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/admin/users/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data.data.users);
        } catch (error) {
            toast.error('Error loading users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (userId: string) => {
        setIsActing(userId);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (!response.ok) throw new Error('Failed to update status');
            const data = await response.json();

            setUsers(users.map(u => u.id === userId ? { ...u, isActive: data.data.isActive } : u));
            toast.success(data.message);
        } catch (error) {
            toast.error('Error updating user status');
        } finally {
            setIsActing(null);
            setActiveDropdownId(null);
        }
    };

    const handleSwitchRole = async (userId: string, newRole: string) => {
        setIsActing(userId);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/role`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) throw new Error('Failed to update role');
            const data = await response.json();

            setUsers(users.map(u => u.id === userId ? { ...u, activeRole: data.data.activeRole as any } : u));
            toast.success(data.message);
        } catch (error) {
            toast.error('Error updating user role');
        } finally {
            setIsActing(null);
            setActiveDropdownId(null);
        }
    };

    const handleResetPassword = async (userId: string) => {
        if (!confirm('This will set a temporary random password. Continue?')) return;

        setIsActing(userId);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (!response.ok) throw new Error('Failed to reset password');
            const data = await response.json();

            toast.success(`Password reset. New temp password: ${data.data.tempPassword}`, {
                duration: 10000
            });
        } catch (error) {
            toast.error('Error resetting password');
        } finally {
            setIsActing(null);
            setActiveDropdownId(null);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'ALL' || u.activeRole === filterRole;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            {/* Search & Filter */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    />
                </div>

                <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
                    {['ALL', 'CLIENT', 'VENDOR', 'ADMIN'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setFilterRole(role as any)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterRole === role
                                ? 'bg-white text-orange-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* User Table/Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Retrieving user database...</p>
                </div>
            ) : (
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status & Verification</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Profiles</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Join Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                                    {user.activeRole === 'ADMIN' ? (
                                                        <ShieldAlert className="w-6 h-6 text-orange-600" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-slate-400 group-hover:text-orange-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 uppercase text-sm tracking-tight">{user.firstName} {user.lastName}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${user.activeRole === 'ADMIN' ? 'bg-orange-100 text-orange-700' :
                                                        user.activeRole === 'VENDOR' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {user.activeRole}
                                                    </span>
                                                    {!user.isActive && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[9px] font-black uppercase tracking-tighter">
                                                            Disabled
                                                        </span>
                                                    )}
                                                    {user.emailVerified && (
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium">
                                                    {user.emailVerified ? 'Email Verified' : 'Awaiting verification'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                {user.hasVendorProfile && (
                                                    <span className="p-1.5 bg-purple-50 rounded-lg shadow-sm" title="Vendor Profile Active">
                                                        <Shield className="w-3 h-3 text-purple-600" />
                                                    </span>
                                                )}
                                                {user.hasClientProfile && (
                                                    <span className="p-1.5 bg-blue-50 rounded-lg shadow-sm" title="Client Profile Active">
                                                        <User className="w-3 h-3 text-blue-600" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs text-gray-500 font-medium">
                                                {new Date(user.createdAt).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={() => setActiveDropdownId(activeDropdownId === user.id ? null : user.id)}
                                                    className={`p-2 rounded-xl transition-all ${activeDropdownId === user.id ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                                                >
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>

                                                <AnimatePresence>
                                                    {activeDropdownId === user.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            ref={dropdownRef}
                                                            className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 overflow-hidden"
                                                        >
                                                            <div className="px-3 py-2 border-b border-gray-50 mb-1">
                                                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Administrative Actions</p>
                                                            </div>

                                                            <button
                                                                onClick={() => handleToggleStatus(user.id)}
                                                                disabled={isActing === user.id}
                                                                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-colors ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                            >
                                                                <div className="flex items-center">
                                                                    {user.isActive ? <Ban className="w-4 h-4 mr-3" /> : <CheckCircle className="w-4 h-4 mr-3" />}
                                                                    {user.isActive ? 'Disable Account' : 'Enable Account'}
                                                                </div>
                                                                <ChevronRight className="w-3 h-3 opacity-30" />
                                                            </button>

                                                            {user.activeRole !== 'VENDOR' && (
                                                                <button
                                                                    onClick={() => handleSwitchRole(user.id, 'VENDOR')}
                                                                    disabled={isActing === user.id}
                                                                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                                                >
                                                                    <div className="flex items-center">
                                                                        <UserPlus className="w-4 h-4 mr-3 text-purple-600" />
                                                                        Make Vendor
                                                                    </div>
                                                                    <ChevronRight className="w-3 h-3 opacity-30" />
                                                                </button>
                                                            )}

                                                            {user.activeRole !== 'CLIENT' && (
                                                                <button
                                                                    onClick={() => handleSwitchRole(user.id, 'CLIENT')}
                                                                    disabled={isActing === user.id}
                                                                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                                                >
                                                                    <div className="flex items-center">
                                                                        <User className="w-4 h-4 mr-3 text-blue-600" />
                                                                        Make Client
                                                                    </div>
                                                                    <ChevronRight className="w-3 h-3 opacity-30" />
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => handleResetPassword(user.id)}
                                                                disabled={isActing === user.id}
                                                                className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                                            >
                                                                <div className="flex items-center">
                                                                    <RefreshCw className={`w-4 h-4 mr-3 text-orange-600 ${isActing === user.id ? 'animate-spin' : ''}`} />
                                                                    Reset Password
                                                                </div>
                                                                <ChevronRight className="w-3 h-3 opacity-30" />
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
