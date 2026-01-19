// components/dashboard/DashboardLayout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Package,
    Users,
    CreditCard,
    Settings,
    Bell,
    Search,
    TrendingUp,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Menu,
    X,
    LogOut,
    HelpCircle,
    BarChart3,
    Sparkles,
    Briefcase,
    UserCircle
} from 'lucide-react';
import RoleSwitcher from './RoleSwitcher';
import { toast } from 'sonner';
import Image from 'next/image';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Fetch user data on mount
    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch('http://localhost:5000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            setUser(data.data.user);

            // Store user in localStorage for quick access
            localStorage.setItem('user', JSON.stringify(data.data.user));
        } catch (error) {
            toast.error('Session expired. Please login again.');
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            toast.success('Logged out successfully');
            router.push('/login');
        } catch (error) {
            toast.error('Error logging out');
        }
    };

    const navigationItems = [
        {
            name: 'Overview',
            href: '/dashboard',
            icon: LayoutDashboard,
            roles: ['CLIENT', 'VENDOR']
        },
        {
            name: 'Bookings',
            href: '/dashboard/bookings',
            icon: Calendar,
            roles: ['CLIENT', 'VENDOR']
        },
        {
            name: 'Packages',
            href: '/dashboard/packages',
            icon: Package,
            roles: ['VENDOR']
        },
        {
            name: 'Clients',
            href: '/dashboard/clients',
            icon: Users,
            roles: ['VENDOR']
        },
        {
            name: 'Vendors',
            href: '/dashboard/vendors',
            icon: Briefcase,
            roles: ['CLIENT']
        },
        {
            name: 'Payments',
            href: '/dashboard/payments',
            icon: CreditCard,
            roles: ['CLIENT', 'VENDOR']
        },
        {
            name: 'Analytics',
            href: '/dashboard/analytics',
            icon: BarChart3,
            roles: ['VENDOR']
        },
        {
            name: 'Settings',
            href: '/dashboard/settings',
            icon: Settings,
            roles: ['CLIENT', 'VENDOR']
        },
    ];

    const filteredNavigation = navigationItems.filter(item =>
        item.roles.includes(user?.activeRole || 'CLIENT')
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-xl flex items-center justify-center">
                                <Image src="/images/events-asap-logo.png" alt="EventASAP" width={100} height={100} />
                            </div>
                            <div>

                                <p className="text-xs text-gray-500">Dashboard</p>
                            </div>
                        </div>
                    </div>

                    {/* User Profile & Role Switcher */}
                    <div className="p-4 border-b border-gray-100">
                        {user && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-purple-100 rounded-full flex items-center justify-center">
                                        <UserCircle className="w-8 h-8 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>

                                <RoleSwitcher user={user} />
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {filteredNavigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 hover:text-orange-600 rounded-xl transition-all duration-200 group"
                                >
                                    <Icon className="w-5 h-5 group-hover:text-orange-500" />
                                    <span className="font-medium">{item.name}</span>
                                </a>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 space-y-2">
                        <a
                            href="/help"
                            className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:text-orange-600 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <HelpCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Help & Support</span>
                        </a>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Left side */}
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="lg:hidden p-2 text-gray-600 hover:text-orange-600 hover:bg-gray-100 rounded-lg"
                                >
                                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>

                                {/* Search */}
                                <div className="hidden md:block relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 w-64 lg:w-80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                    />
                                </div>
                            </div>

                            {/* Right side */}
                            <div className="flex items-center space-x-4">
                                {/* Notifications */}
                                <button className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-gray-100 rounded-lg">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* Quick Stats */}
                                <div className="hidden lg:flex items-center space-x-6">
                                    {user?.activeRole === 'VENDOR' && (
                                        <>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">£2,450</div>
                                                <div className="text-xs text-gray-500">This Month</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">12</div>
                                                <div className="text-xs text-gray-500">Bookings</div>
                                            </div>
                                        </>
                                    )}

                                    {user?.activeRole === 'CLIENT' && (
                                        <>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">3</div>
                                                <div className="text-xs text-gray-500">Upcoming</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">£850</div>
                                                <div className="text-xs text-gray-500">To Pay</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;