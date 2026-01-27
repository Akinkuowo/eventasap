'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Package,
    Loader2,
    AlertCircle,
    TrendingUp,
    DollarSign,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/utils/tokenManager';
import PackageCard from './package-card';
import AddEditPackageModal from './add-package-modal';

interface ServicePackage {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    duration: number;
    inclusions: string[];
    isActive: boolean;
    minBooking?: number;
    maxBooking?: number;
    preparationTime?: number;
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const PackagesList: React.FC = () => {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // For Add/Edit Modal (to be implemented)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/vendor/packages`);
            const data = await response.json();

            if (data.success) {
                setPackages(data.data.packages || []);
            } else {
                // If API fails or doesn't exist yet, show empty but don't error out hard in dev
                console.warn('Failed to fetch packages:', data.error);
                setPackages([]);
            }
        } catch (error: any) {
            console.error('Error loading packages:', error);
            // toast.error('Failed to load packages');
            setPackages([]); // Mocking empty for now
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (pkg: ServicePackage) => {
        try {
            const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/vendor/packages/${pkg.id}/toggle-status`, {
                method: 'PATCH'
            });
            const data = await response.json();

            if (data.success) {
                setPackages(packages.map(p => p.id === pkg.id ? { ...p, isActive: !p.isActive } : p));
                toast.success(`Package ${pkg.isActive ? 'deactivated' : 'activated'} successfully`);
            } else {
                toast.error(data.error || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Error updating status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this package?')) return;

        try {
            const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/vendor/packages/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                setPackages(packages.filter(p => p.id !== id));
                toast.success('Package deleted successfully');
            } else {
                toast.error(data.error || 'Failed to delete package');
            }
        } catch (error) {
            toast.error('Error deleting package');
        }
    };

    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' ? true :
            filter === 'active' ? pkg.isActive : !pkg.isActive;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: packages.length,
        active: packages.filter(p => p.isActive).length,
        avgPrice: packages.length > 0
            ? Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length)
            : 0
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Service Packages</h1>
                    <p className="text-gray-600">Create and manage your service offerings</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedPackage(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Package
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Packages</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Packages</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.active}</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avg. Package Price</p>
                            <h3 className="text-2xl font-bold text-purple-600 mt-1">£{stats.avgPrice}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search packages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                    />
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter('inactive')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'inactive' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Inactive
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Fetching your packages...</p>
                </div>
            ) : filteredPackages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPackages.map(pkg => (
                        <PackageCard
                            key={pkg.id}
                            pkg={pkg}
                            onEdit={(p) => {
                                setSelectedPackage(p);
                                setIsModalOpen(true);
                            }}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 text-center px-6">
                    <div className="w-20 h-20 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mb-6">
                        <Package className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {searchQuery || filter !== 'all' ? 'No packages found matching your search' : 'No service packages yet'}
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        {searchQuery || filter !== 'all'
                            ? 'Try adjusting your filters or search terms'
                            : 'Start by creating your first service package to attract more clients and streamline your booking process.'}
                    </p>
                    <button
                        onClick={() => {
                            setSelectedPackage(null);
                            setIsModalOpen(true);
                        }}
                        className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        Create First Package
                    </button>
                </div>
            )}

            {/* Modal */}
            <AddEditPackageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchPackages}
                pkg={selectedPackage}
            />
        </div>
    );
};

export default PackagesList;
