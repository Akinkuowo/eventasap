// app/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/dashboard/dashboardLayout';
import {
    Calendar,
    DollarSign,
    TrendingUp,
    Users,
    Package,
    Clock,
    CheckCircle,
    AlertCircle,
    Star,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ClientBookingsList from '../components/dashboard/client-bookings-list';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {

    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

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

            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            const userData = data.data.user;
            setUser(userData);

            // Store user in localStorage for quick access
            localStorage.setItem('user', JSON.stringify(userData));

            // Redirect if admin
            if (userData.activeRole === 'ADMIN') {
                router.push('/dashboard/admin');
            }
        } catch (error) {
            toast.error('Session expired. Please login again.');
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    };

    const [stats, setStats] = useState<any>({
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        totalRevenue: 0,
        totalSpent: 0, // Initialize totalSpent
        avgRating: 0,
        activeClients: 0,
        upcomingEvents: 0
    });


    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStats({
                        ...data.data,
                        // Backend might not return all these fields yet, map what we can
                        totalBookings: data.data.totalBookings || 0,
                        pendingBookings: data.data.pendingBookings || 0,
                        completedBookings: data.data.completedBookings || 0,
                        totalRevenue: data.data.totalRevenue || 0,
                        avgRating: data.data.averageRating || 0,
                        activeClients: data.data.activeClients || data.data.activeVendors || 0,
                        upcomingEvents: data.data.pendingBookings || 0 // Proxy for now
                    });

                    // Set recent bookings if available
                    if (data.data.recentBookings) {
                        setRecentBookings(data.data.recentBookings);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchStats();
            fetchNotifications();
            fetchAIInsights();
        }
    }, [user]);

    const [recentBookings, setRecentBookings] = useState<any[]>([]);

    const quickActions = [
        { title: 'Create New Package', icon: Package, href: '/dashboard/packages', color: 'bg-purple-100 text-purple-600' },
        { title: 'View Calendar', icon: Calendar, href: '/dashboard/bookings', color: 'bg-blue-100 text-blue-600' },
        { title: 'Analytics Report', icon: TrendingUp, href: '/dashboard/analytics', color: 'bg-green-100 text-green-600' },
        { title: 'Manage Clients', icon: Users, href: '/dashboard/clients', color: 'bg-orange-100 text-orange-600' },
    ];

    const [notifications, setNotifications] = useState<any[]>([]);
    const [aiInsights, setAiInsights] = useState<any[]>([]);
    const [isAILoading, setIsAILoading] = useState(true);

    const fetchAIInsights = async () => {
        try {
            setIsAILoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/dashboard/ai-insights`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAiInsights(data.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch AI insights:', error);
        } finally {
            setIsAILoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/notifications?limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.data.notifications);
                }
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    // Show loading state while fetching user data
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Show error state if user data failed to load
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Failed to load user data</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
                            <p className="text-orange-100">
                                Here's what's happening with your business today.
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                                <Sparkles className="w-5 h-5" />
                                <span className="font-medium">{user.role} Mode</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <DollarSign className="w-6 h-6 text-orange-600" />
                            </div>
                            <span className="text-sm font-medium text-green-600 flex items-center">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                12.5%
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            £{((user.activeRole === 'CLIENT' ? stats.totalSpent : stats.totalRevenue) || 0).toLocaleString()}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                            {user.activeRole === 'CLIENT' ? 'Total Spent' : 'Total Revenue'}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-green-600 flex items-center">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                8.2%
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalBookings}</h3>
                        <p className="text-gray-600 text-sm mt-1">Total Bookings</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-green-600 flex items-center">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                15.3%
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.activeClients}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                            {user.activeRole === 'CLIENT' ? 'Active Vendors' : 'Active Clients'}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Star className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-red-600 flex items-center">
                                <ArrowDownRight className="w-4 h-4 mr-1" />
                                1.2%
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {user.activeRole === 'CLIENT' ? stats.completedBookings : stats.avgRating + '/5'}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                            {user.activeRole === 'CLIENT' ? 'Completed Events' : 'Average Rating'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Bookings */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
                            <a href="/dashboard/bookings" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                                View All →
                            </a>
                        </div>

                        <div className="space-y-4">
                            {user.activeRole === 'CLIENT' ? (
                                <ClientBookingsList />
                            ) : (
                                recentBookings.map((booking) => (
                                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${booking.status === 'Confirmed' ? 'bg-green-100' :
                                                booking.status === 'Pending' ? 'bg-yellow-100' : 'bg-gray-100'
                                                }`}>
                                                {booking.status === 'Confirmed' ? (
                                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                                ) : booking.status === 'Pending' ? (
                                                    <Clock className="w-6 h-6 text-yellow-600" />
                                                ) : (
                                                    <AlertCircle className="w-6 h-6 text-gray-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{booking.service}</h4>
                                                <p className="text-sm text-gray-600">{booking.client} • {new Date(booking.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900">£{booking.amount}</div>
                                            <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {booking.status}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Actions & Notifications */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                {quickActions.map((action, index) => (
                                    <a
                                        key={index}
                                        href={action.href}
                                        className="flex items-center space-x-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className={`p-2 rounded-lg ${action.color}`}>
                                            <action.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-gray-900">{action.title}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Notifications</h2>
                            <div className="space-y-4">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div key={notification.id} className="flex items-start space-x-3">
                                            <div className={`w-2 h-2 mt-2 rounded-full ${notification.type?.includes('BOOKING') ? 'bg-blue-500' :
                                                notification.type?.includes('PAYMENT') ? 'bg-green-500' :
                                                    'bg-purple-500'
                                                }`}></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">{notification.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatTime(notification.createdAt)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-gradient-to-r from-orange-50 to-purple-50 border border-orange-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">AI-Powered Insights</h3>
                                <p className="text-sm text-gray-600">Personalized recommendations for your business</p>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchAIInsights()}
                            className="px-4 py-2 bg-white border border-orange-300 text-orange-600 font-medium rounded-xl hover:bg-orange-50 transition-colors disabled:opacity-50"
                            disabled={isAILoading}
                        >
                            {isAILoading ? 'Analyzing...' : 'Refresh Insights'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isAILoading ? (
                            Array(2).fill(0).map((_, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 animate-pulse">
                                    <div className="h-5 bg-gray-100 rounded w-1/3 mb-2"></div>
                                    <div className="h-4 bg-gray-100 rounded w-full mb-3"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                </div>
                            ))
                        ) : (
                            aiInsights.map((insight, index) => (
                                <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        {insight.title}
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${insight.type === 'Optimization' ? 'bg-blue-100 text-blue-600' :
                                                insight.type === 'Boost' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {insight.type}
                                        </span>
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                                    <button className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
                                        {insight.action} <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}