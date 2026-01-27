'use client';

import React from 'react';
import {
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye
} from 'lucide-react';

interface ClientBookingCardProps {
    booking: {
        id: string;
        serviceType: string;
        eventDate: string;
        eventLocation: string;
        status: string;
        quotedPrice?: number;
        budget: number;
        vendor: {
            vendorProfile?: {
                businessName: string;
            } | null;
            firstName: string;
            lastName: string;
        };
    };
}

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'PENDING':
            return {
                bg: 'bg-yellow-50',
                text: 'text-yellow-700',
                border: 'border-yellow-200',
                icon: Clock
            };
        case 'CONFIRMED':
            return {
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                border: 'border-blue-200',
                icon: CheckCircle
            };
        case 'COMPLETED':
            return {
                bg: 'bg-green-50',
                text: 'text-green-700',
                border: 'border-green-200',
                icon: CheckCircle
            };
        case 'CANCELLED':
            return {
                bg: 'bg-red-50',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: XCircle
            };
        default:
            return {
                bg: 'bg-gray-50',
                text: 'text-gray-700',
                border: 'border-gray-200',
                icon: AlertCircle
            };
    }
};

export default function ClientBookingCard({ booking }: ClientBookingCardProps) {
    const statusStyle = getStatusStyles(booking.status);
    const StatusIcon = statusStyle.icon;
    const vendorName = booking.vendor.vendorProfile?.businessName || `${booking.vendor.firstName} ${booking.vendor.lastName}`;
    const price = booking.quotedPrice || booking.budget;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusStyle.bg}`}>
                    <StatusIcon className={`w-6 h-6 ${statusStyle.text}`} />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {booking.serviceType}
                    </h4>
                    <p className="text-sm text-gray-600">
                        {vendorName} • {formatDate(booking.eventDate)}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end mt-4 sm:mt-0 space-x-4">
                <div className="text-right">
                    <div className="font-bold text-gray-900">£{price.toLocaleString()}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block border ${statusStyle.border} ${statusStyle.bg} ${statusStyle.text}`}>
                        {booking.status}
                    </div>
                </div>
                <button
                    onClick={() => window.location.href = `/dashboard/bookings/${booking.id}`}
                    className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                    title="View Details"
                >
                    <Eye className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
