// app/dashboard/services/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, DollarSign,
    Clock, CheckCircle, XCircle, AlertCircle,
    MessageSquare, Eye, Calendar as CalendarIcon,
    MapPin, Users, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/utils/tokenManager';

interface ServiceRequest {
    id: string;
    serviceType: string;
    description: string;
    budgetMin: number;
    budgetMax: number;
    eventDate: string;
    eventLocation: string;
    guests: number;
    requirements: string[];
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'ACTIVE' | 'CLOSED' | 'FULFILLED';
    createdAt: string;
    client: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
    proposals: Array<{
        id: string;
        vendorId: string;
        price: number;
        message: string;
        status: string;
        createdAt: string;
    }>;
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ServicesPage() {
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'closed' | 'fulfilled'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchServiceRequests();
    }, [filter]);

    const fetchServiceRequests = async () => {
        setLoading(true);
        try {
            const status = filter === 'all' ? undefined : filter.toUpperCase();
            const response = await fetchWithAuth(
                `${NEXT_PUBLIC_API_URL}/api/my-service-requests?status=${status || ''}`
            );

            const data = await response.json();

            if (data.success) {
                // Ensure proposals is always an array
                const normalizedRequests = data.data.serviceRequests.map((req: ServiceRequest) => ({
                    ...req,
                    proposals: req.proposals || []
                }));
                setServiceRequests(normalizedRequests);
            } else {
                toast.error(data.error || 'Failed to fetch service requests');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load service requests');
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'HIGH': return 'bg-red-100 text-red-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'LOW': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-blue-100 text-blue-800';
            case 'FULFILLED': return 'bg-green-100 text-green-800';
            case 'CLOSED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const filteredRequests = serviceRequests.filter(request => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        return (
            request.serviceType.toLowerCase().includes(searchLower) ||
            request.description.toLowerCase().includes(searchLower) ||
            request.eventLocation.toLowerCase().includes(searchLower)
        );
    });

    const activeRequests = serviceRequests.filter(r => r.status === 'ACTIVE').length;
    const fulfilledRequests = serviceRequests.filter(r => r.status === 'FULFILLED').length;
    const totalProposals = serviceRequests.reduce((sum, req) => sum + (req.proposals?.length || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
                    <p className="text-gray-600">Post and manage your service needs</p>
                </div>
                <button
                    onClick={() => window.location.href = '/dashboard/services/new'}
                    className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Service Request
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Requests</p>
                            <p className="text-2xl font-bold text-blue-600">{activeRequests}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Fulfilled</p>
                            <p className="text-2xl font-bold text-green-600">{fulfilledRequests}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Proposals</p>
                            <p className="text-2xl font-bold text-purple-600">{totalProposals}</p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Avg Budget</p>
                            <p className="text-2xl font-bold text-gray-900">
                                £{serviceRequests.length > 0 ?
                                    Math.round(serviceRequests.reduce((sum, req) => sum + (req.budgetMin + req.budgetMax) / 2, 0) / serviceRequests.length).toLocaleString()
                                    : '0'}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search service requests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-xl ${filter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-4 py-2 rounded-xl flex items-center ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Active
                        </button>
                        <button
                            onClick={() => setFilter('fulfilled')}
                            className={`px-4 py-2 rounded-xl flex items-center ${filter === 'fulfilled' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Fulfilled
                        </button>
                        <button
                            onClick={() => setFilter('closed')}
                            className={`px-4 py-2 rounded-xl flex items-center ${filter === 'closed' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Closed
                        </button>
                    </div>
                </div>
            </div>

            {/* Service Requests List */}
            {loading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading service requests...</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Service Requests</h3>
                    <p className="text-gray-600 mb-4">Post a service request to get quotes from vendors</p>
                    <button
                        onClick={() => window.location.href = '/dashboard/services/new'}
                        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                        Create First Request
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((request) => (
                        <div key={request.id} className="bg-white rounded-xl border border-gray-200 hover:border-orange-300 transition-all duration-200">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    {/* Left side: Request details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{request.serviceType}</h3>
                                                <div className="flex items-center mt-1 space-x-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                        {request.status}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                                                        {request.urgency} URGENCY
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {request.proposals?.length || 0} proposals
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-gray-900">
                                                    £{request.budgetMin.toLocaleString()} - £{request.budgetMax.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-500">Budget Range</div>
                                            </div>
                                        </div>

                                        <p className="mt-3 text-gray-700">{request.description}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                            <div className="flex items-center space-x-2">
                                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Event Date</p>
                                                    <p className="text-sm font-medium">{formatDate(request.eventDate)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Location</p>
                                                    <p className="text-sm font-medium">{request.eventLocation}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Guests</p>
                                                    <p className="text-sm font-medium">{request.guests} people</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Tag className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Posted</p>
                                                    <p className="text-sm font-medium">{formatDate(request.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {request.requirements && request.requirements.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {request.requirements.map((req, index) => (
                                                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                            {req}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {request.proposals && request.proposals.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Recent Proposals:</p>
                                                <div className="space-y-2">
                                                    {request.proposals.slice(0, 2).map((proposal) => (
                                                        <div key={proposal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">£{proposal.price.toLocaleString()}</p>
                                                                <p className="text-xs text-gray-600">{proposal.message.substring(0, 60)}...</p>
                                                            </div>
                                                            <span className={`px-2 py-1 rounded text-xs ${proposal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                                {proposal.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right side: Actions */}
                                    <div className="flex flex-col space-y-3">
                                        <button
                                            onClick={() => window.location.href = `/dashboard/services/${request.id}`}
                                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </button>
                                        {request.status === 'ACTIVE' && (
                                            <>
                                                <button
                                                    onClick={() => window.location.href = `/dashboard/services/${request.id}/proposals`}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
                                                >
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    View Proposals ({request.proposals?.length || 0})
                                                </button>
                                                <button
                                                    onClick={() => window.location.href = `/dashboard/bookings/new?service=${request.id}`}
                                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Accept Proposal
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}