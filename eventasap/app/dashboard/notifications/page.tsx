'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Filter } from 'lucide-react';
import { fetchWithAuth } from '@/utils/tokenManager';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
    }, [filter, page]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const unreadOnly = filter === 'unread' ? 'true' : 'false';
            const response = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/notifications?page=${page}&limit=20&unreadOnly=${unreadOnly}`
            );
            const data = await response.json();

            if (data.success) {
                setNotifications(data.data.notifications);
                setTotalPages(data.data.pagination.totalPages);
                setUnreadCount(data.data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`,
                { method: 'PUT' }
            );

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/mark-all-read`,
                { method: 'PUT' }
            );
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
    };

    const getNotificationIcon = (type: string) => {
        const icons: { [key: string]: string } = {
            PRICE_ADJUSTED: '💰',
            PRICE_APPROVED: '✅',
            PRICE_REJECTED: '❌',
            BOOKING_ACCEPTED: '🎉',
            BOOKING_DECLINED: '😞',
            PAYMENT_RECEIVED: '💳',
            PAYOUT_RELEASED: '💵',
            BOOKING_REQUEST: '📋',
        };
        return icons[type] || '🔔';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Notifications</h1>
                    <p className="text-gray-500 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                    >
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-gray-200">
                <button
                    onClick={() => { setFilter('all'); setPage(1); }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                            ? 'bg-orange-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => { setFilter('unread'); setPage(1); }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'unread'
                            ? 'bg-orange-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No notifications</p>
                        <p className="text-sm mt-1">
                            {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-5 cursor-pointer transition-colors ${notification.isRead
                                        ? 'bg-white hover:bg-gray-50'
                                        : 'bg-orange-50 hover:bg-orange-100'
                                    }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <span className="text-3xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <p className="font-bold text-gray-900">{notification.title}</p>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2"></div>
                                            )}
                                        </div>
                                        <p className="text-gray-600 mt-1">{notification.message}</p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
