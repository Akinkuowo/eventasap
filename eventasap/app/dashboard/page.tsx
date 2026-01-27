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

    // Mock data - in real app, fetch from API
    const stats = {
        totalBookings: 12,
        pendingBookings: 3,
        completedBookings: 9,
        totalRevenue: 2450,
        avgRating: 4.8,
        activeClients: 8,
        upcomingEvents: 4
    };

    const recentBookings = [
        { id: 1, client: 'Sarah Johnson', service: 'Wedding Photography', date: '2024-12-15', status: 'Confirmed', amount: 1200 },
        { id: 2, client: 'Mike Wilson', service: 'Corporate Catering', date: '2024-12-10', status: 'Pending', amount: 850 },
        { id: 3, client: 'Emma Davis', service: 'Birthday Decoration', date: '2024-12-05', status: 'Completed', amount: 450 },
        { id: 4, client: 'James Brown', service: 'Live Music Band', date: '2024-12-01', status: 'Confirmed', amount: 2000 },
    ];

    const quickActions = [
        { title: 'Create New Package', icon: Package, href: '/dashboard/packages/new', color: 'bg-purple-100 text-purple-600' },
        { title: 'View Calendar', icon: Calendar, href: '/dashboard/bookings', color: 'bg-blue-100 text-blue-600' },
        { title: 'Analytics Report', icon: TrendingUp, href: '/dashboard/analytics', color: 'bg-green-100 text-green-600' },
        { title: 'Manage Clients', icon: Users, href: '/dashboard/clients', color: 'bg-orange-100 text-orange-600' },
    ];

    const notifications = [
        { id: 1, message: 'New booking request from Sarah Johnson', time: '2 hours ago', type: 'booking' },
        { id: 2, message: 'Payment received for wedding photography', time: '1 day ago', type: 'payment' },
        { id: 3, message: 'Your vendor profile is now verified!', time: '2 days ago', type: 'success' },
    ];

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
                        <h3 className="text-2xl font-bold text-gray-900">£{stats.totalRevenue.toLocaleString()}</h3>
                        <p className="text-gray-600 text-sm mt-1">Total Revenue</p>
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
                        <p className="text-gray-600 text-sm mt-1">Active Clients</p>
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
                        <h3 className="text-2xl font-bold text-gray-900">{stats.avgRating}/5</h3>
                        <p className="text-gray-600 text-sm mt-1">Average Rating</p>
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

                        {/* Notifications */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Notifications</h2>
                            <div className="space-y-4">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="flex items-start space-x-3">
                                        <div className={`w-2 h-2 mt-2 rounded-full ${notification.type === 'booking' ? 'bg-blue-500' :
                                            notification.type === 'payment' ? 'bg-green-500' : 'bg-purple-500'
                                            }`}></div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900">{notification.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                        </div>
                                    </div>
                                ))}
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
                        <button className="px-4 py-2 bg-white border border-orange-300 text-orange-600 font-medium rounded-xl hover:bg-orange-50 transition-colors">
                            View All Insights
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">Pricing Optimization</h4>
                            <p className="text-sm text-gray-600 mb-3">Increase your photography package by 15% based on market demand</p>
                            <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
                                Apply Suggestion →
                            </button>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">Availability Boost</h4>
                            <p className="text-sm text-gray-600 mb-3">Open December weekends for 20% higher bookings</p>
                            <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
                                Update Calendar →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}