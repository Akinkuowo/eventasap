'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Star,
    MapPin,
    Phone,
    Mail,
    Clock,
    ShieldCheck,
    ArrowLeft,
    Calendar,
    Award,
    Users,
    Loader2,
    AlertCircle,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface VendorData {
    id: string;
    businessName: string;
    businessEmail: string;
    businessPhone: string;
    city: string;
    state: string | null;
    country: string;
    category: string;
    description: string | null;
    website: string | null;
    isVerified: boolean;
    rating: number | null;
    totalReviews: number;
    serviceAreas: string[];
    portfolioImages: string[];
    responseTime: number | null;
    minBookingPrice: number | null;
    maxBookingPrice: number | null;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        avatarUrl: string | null;
    };
    servicePackages: {
        id: string;
        title: string;
        description: string;
        price: number;
        currency: string;
        duration: number;
        mainImage: string | null;
        inclusions: string[];
    }[];
    reviews: {
        id: string;
        rating: number;
        title: string | null;
        comment: string | null;
        createdAt: string;
        client: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    }[];
}

export default function VendorDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const vendorId = params.id as string;

    const [vendor, setVendor] = useState<VendorData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchVendorDetails();
    }, [vendorId]);

    const fetchVendorDetails = async () => {
        try {
            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/vendors/${vendorId}`);
            const data = await response.json();

            if (data.success) {
                setVendor(data.data);
            } else {
                setError(data.error || 'Failed to fetch vendor details');
            }
        } catch (err) {
            console.error('Error fetching vendor:', err);
            setError('Failed to connect to the server');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
                <p className="mt-4 text-gray-600">Loading vendor details...</p>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={() => router.push('/dashboard/vendors')}
                    className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                >
                    Back to Vendors
                </button>
            </div>
        );
    }

    const coverImage = vendor.servicePackages?.[0]?.mainImage
        || vendor.portfolioImages?.[0]
        || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1469&auto=format&fit=crop';

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => router.push('/dashboard/vendors')}
                className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Vendors
            </button>

            {/* Hero Section */}
            <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden">
                <img
                    src={coverImage}
                    alt={vendor.businessName}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold">
                            {vendor.category}
                        </span>
                        {vendor.isVerified && (
                            <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/90 backdrop-blur-md rounded-full text-sm font-bold">
                                <ShieldCheck className="w-4 h-4" />
                                Verified
                            </div>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black mb-2">{vendor.businessName}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {vendor.city}, {vendor.country}
                        </div>
                        <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 fill-current" />
                            {vendor.rating ? vendor.rating.toFixed(1) : 'New'} ({vendor.totalReviews} reviews)
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center text-orange-600 mb-2">
                        <Clock className="w-5 h-5 mr-2" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{vendor.responseTime || 24}h</p>
                    <p className="text-sm text-gray-500">Response Time</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center text-orange-600 mb-2">
                        <Users className="w-5 h-5 mr-2" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{vendor.totalReviews}</p>
                    <p className="text-sm text-gray-500">Total Reviews</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center text-orange-600 mb-2">
                        <Award className="w-5 h-5 mr-2" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{vendor.servicePackages.length}</p>
                    <p className="text-sm text-gray-500">Service Packages</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center text-orange-600 mb-2">
                        <MapPin className="w-5 h-5 mr-2" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{vendor.serviceAreas.length}</p>
                    <p className="text-sm text-gray-500">Service Areas</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About {vendor.businessName}</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {vendor.description || `${vendor.businessName} is a professional ${vendor.category} service provider based in ${vendor.city}, ${vendor.country}. We are committed to delivering exceptional service for your events.`}
                        </p>
                        {vendor.serviceAreas.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-bold text-gray-900 mb-2">Service Areas</h3>
                                <div className="flex flex-wrap gap-2">
                                    {vendor.serviceAreas.map((area, index) => (
                                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Service Packages */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Packages</h2>
                        {vendor.servicePackages.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vendor.servicePackages.map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        onClick={() => router.push(`/dashboard/services/${pkg.id}`)}
                                        className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                                    >
                                        {pkg.mainImage && (
                                            <img
                                                src={pkg.mainImage}
                                                alt={pkg.title}
                                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                                            />
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                                {pkg.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pkg.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-orange-600">£{pkg.price}</span>
                                                <span className="text-sm text-gray-500">{pkg.duration} hours</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No service packages available</p>
                        )}
                    </div>

                    {/* Portfolio Gallery */}
                    {vendor.portfolioImages.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {vendor.portfolioImages.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Portfolio ${index + 1}`}
                                        className="w-full h-48 object-cover rounded-xl hover:scale-105 transition-transform cursor-pointer"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
                        {vendor.reviews.length > 0 ? (
                            <div className="space-y-4">
                                {vendor.reviews.map((review) => (
                                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                                {review.client.firstName[0]}{review.client.lastName[0]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-bold text-gray-900">
                                                        {review.client.firstName} {review.client.lastName}
                                                    </h4>
                                                    <div className="flex items-center text-orange-500">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                {review.title && (
                                                    <p className="font-semibold text-gray-800 mb-1">{review.title}</p>
                                                )}
                                                {review.comment && (
                                                    <p className="text-gray-600 text-sm">{review.comment}</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No reviews yet</p>
                        )}
                    </div>
                </div>

                {/* Right Column - Contact Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 sticky top-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>

                        <div className="space-y-3 mb-6">
                            <a
                                href={`mailto:${vendor.businessEmail}`}
                                className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
                            >
                                <Mail className="w-5 h-5 mr-3 text-orange-600" />
                                <span className="text-sm">{vendor.businessEmail}</span>
                            </a>
                            <a
                                href={`tel:${vendor.businessPhone}`}
                                className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
                            >
                                <Phone className="w-5 h-5 mr-3 text-orange-600" />
                                <span className="text-sm">{vendor.businessPhone}</span>
                            </a>
                            {vendor.website && (
                                <a
                                    href={vendor.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5 mr-3 text-orange-600" />
                                    <span className="text-sm">Visit Website</span>
                                </a>
                            )}
                        </div>

                        {vendor.minBookingPrice && (
                            <div className="mb-6 p-4 bg-orange-50 rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Starting from</p>
                                <p className="text-3xl font-bold text-orange-600">
                                    £{vendor.minBookingPrice.toLocaleString()}
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={() => router.push(`/dashboard/bookings/new?vendor=${vendor.id}`)}
                                className="w-full px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center"
                            >
                                <Calendar className="w-5 h-5 mr-2" />
                                Request Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
