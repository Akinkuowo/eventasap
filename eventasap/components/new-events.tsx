'use client';

import React, { useEffect, useState } from 'react';
import {
    Calendar,
    MapPin,
    DollarSign,
    ArrowRight,
    Search,
    Clock,
    User
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ServiceRequest {
    id: string;
    serviceType: string;
    description: string;
    eventLocation: string;
    eventDate: string;
    budgetMin: number;
    budgetMax: number;
    createdAt: string;
    client: {
        firstName: string;
        lastName: string;
        avatarUrl?: string;
    };
}

const NewEvents = () => {
    const router = useRouter();
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestRequests = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/service-requests?limit=4');
                const data = await response.json();
                if (data.success) {
                    setRequests(data.data.serviceRequests);
                }
            } catch (error) {
                console.error('Error fetching latest requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestRequests();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours / 24)}d ago`;
    };

    if (loading) {
        return (
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse space-y-8">
                        <div className="h-10 bg-gray-100 rounded-full w-48"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-48 bg-gray-50 rounded-[2rem]"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (requests.length === 0) return null;

    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-full text-orange-600 text-sm font-bold mb-6">
                            <Clock className="w-4 h-4" />
                            <span>Recent Requests</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-dm-sans font-bold text-gray-900 tracking-tight">
                            Explore <span className="text-orange-600">new opportunities</span>
                        </h2>
                    </div>
                    <button
                        onClick={() => router.push('/vendors')}
                        className="group flex items-center space-x-2 text-gray-900 font-bold hover:text-orange-600 transition-colors"
                    >
                        <span>View all requests</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] hover:bg-white hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-500 group"
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {request.serviceType}
                                        </h3>
                                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {request.client.avatarUrl ? (
                                                    <img src={request.client.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-3 h-3 text-gray-400" />
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-500">{request.client.firstName} {request.client.lastName[0]}.</span>
                                            <span>•</span>
                                            <span>{formatTimeAgo(request.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-white rounded-2xl border border-gray-100 text-gray-900 font-bold text-sm shadow-sm group-hover:border-orange-100 transition-colors">
                                        ${request.budgetMin.toLocaleString()} - ${request.budgetMax.toLocaleString()}
                                    </div>
                                </div>

                                <p className="text-gray-500 font-medium line-clamp-2 mb-8 flex-1 leading-relaxed">
                                    {request.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                                    <div className="flex items-center space-x-3 text-gray-500">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Location</span>
                                            <span className="text-sm font-bold text-gray-900 truncate">{request.eventLocation}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 text-gray-500">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Event Date</span>
                                            <span className="text-sm font-bold text-gray-900">{formatDate(request.eventDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push(`/vendors?id=${request.id}`)}
                                    className="mt-8 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 active:scale-95"
                                >
                                    View Details & Bid
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sell CTA */}
                <div className="mt-16 text-center">
                    <p className="text-gray-500 font-medium mb-6">Are you a professional event service provider?</p>
                    <button
                        onClick={() => router.push('/signup?role=vendor')}
                        className="inline-flex items-center space-x-3 px-8 py-4 bg-white border-2 border-gray-900 text-gray-900 rounded-full font-bold hover:bg-gray-900 hover:text-white transition-all duration-300 group"
                    >
                        <span>Join as a Vendor</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NewEvents;
