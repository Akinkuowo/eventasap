'use client';

import React from 'react';
import {
    User,
    Mail,
    Phone,
    Calendar,
    MessageSquare,
    ExternalLink,
    Clock,
    UserCircle
} from 'lucide-react';

interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    avatarUrl?: string;
    totalBookings: number;
    lastBookingDate: string;
    status: 'ACTIVE' | 'RECURRING' | 'NEW';
}

interface ClientCardProps {
    client: Client;
    onViewDetail: (id: string) => void;
    onContact: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onViewDetail, onContact }) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'RECURRING':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'NEW':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    const initials = `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-orange-200 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center text-orange-600 font-bold text-xl overflow-hidden shadow-sm">
                            {client.avatarUrl ? (
                                <img src={client.avatarUrl} alt={client.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${client.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">
                            {client.firstName} {client.lastName}
                        </h3>
                        <div className={`inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold border ${getStatusStyles(client.status)}`}>
                            {client.status} CLIENT
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onViewDetail(client.id)}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                >
                    <ExternalLink className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{client.phoneNumber}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50 mb-6">
                <div className="text-center bg-gray-50 rounded-xl p-2">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Total Bookings</p>
                    <p className="text-lg font-bold text-gray-900">{client.totalBookings}</p>
                </div>
                <div className="text-center bg-gray-50 rounded-xl p-2">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Last Order</p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                        {new Date(client.lastBookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <button
                    onClick={() => onContact(client.id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-orange-200 hover:text-orange-600 transition-all text-sm"
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                </button>
                <button
                    onClick={() => onViewDetail(client.id)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
                >
                    View History
                </button>
            </div>
        </div>
    );
};

export default ClientCard;
