'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Calendar,
    MapPin,
    Clock,
    CheckCircle,
    Star,
    ArrowLeft,
    Loader2,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/utils/tokenManager';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ServicePackage {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    duration: number;
    inclusions: string[];
    mainImage: string | null;
    vendor: {
        id: string;
        businessName: string;
        category: string;
        rating: number;
        user: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        }
    }
}

export default function ServiceDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [pkg, setPkg] = useState<ServicePackage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);

    // Booking Form State
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [guests, setGuests] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchPackageDetails(params.id as string);
        }
    }, [params.id]);

    const fetchPackageDetails = async (id: string) => {
        setIsLoading(true);
        try {
            // First try fetching specifically (assuming endpoint exists)
            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/packages/${id}`);
            const data = await response.json();

            if (data.success) {
                setPkg(data.data);
            } else {
                // Fallback: fetch all and find (not ideal but robust for now)
                const allResponse = await fetch(`${NEXT_PUBLIC_API_URL}/api/packages?limit=100`);
                const allData = await allResponse.json();
                if (allData.success) {
                    const found = allData.data.packages.find((p: ServicePackage) => p.id === id);
                    if (found) setPkg(found);
                    else toast.error('Package not found');
                }
            }
        } catch (error) {
            console.error('Error fetching package:', error);
            toast.error('Failed to load package details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pkg) return;

        setIsBooking(true);
        try {
            const bookingData = {
                servicePackageId: pkg.id,
                vendorId: pkg.vendor.id,
                eventDate: `${eventDate}T${eventTime}:00.000Z`, // Construct ISO string
                eventLocation: location,
                description: description,
                requirements: [description], // Mapping description to requirements as "proof/details"
                guests: parseInt(guests) || 0,
                status: 'PENDING',
                quotedPrice: pkg.price // Initial price from package
            };

            const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/bookings`, {
                method: 'POST',
                body: JSON.stringify(bookingData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Booking request sent successfully!');
                router.push('/dashboard/bookings');
            } else {
                toast.error(data.error || 'Failed to submit booking');
            }
        } catch (error) {
            console.error('Booking error:', error);
            toast.error('An error occurred while booking');
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            </div>
        );
    }

    if (!pkg) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Package Not Found</h2>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header / Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Services
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Package Details */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                        <div className="aspect-video bg-gray-100 relative">
                            {pkg.mainImage ? (
                                <img src={pkg.mainImage} alt={pkg.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
                                    <ShieldCheck className="w-20 h-20" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                {pkg.vendor.category}
                            </div>
                        </div>
                        <div className="p-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{pkg.title}</h1>
                            <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
                                <div className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {pkg.duration} Hours</div>
                                <div className="flex items-center items-center gap-1 text-orange-600">
                                    <Star className="w-4 h-4 fill-current" /> {pkg.vendor.rating.toFixed(1)}
                                </div>
                            </div>

                            <p className="text-gray-600 leading-relaxed mb-8">{pkg.description}</p>

                            <div className="space-y-3">
                                <h3 className="font-bold text-gray-900">What's Included at £{pkg.price}</h3>
                                <ul className="space-y-2">
                                    {pkg.inclusions?.map((item, i) => (
                                        <li key={i} className="flex items-start text-sm text-gray-600">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Vendor Info Component could go here */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden">
                            {pkg.vendor.user.avatarUrl ? (
                                <img src={pkg.vendor.user.avatarUrl} alt={pkg.vendor.businessName} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                                    {pkg.vendor.businessName[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Service Provider</p>
                            <h3 className="font-bold text-gray-900 text-lg">{pkg.vendor.businessName}</h3>
                            <p className="text-sm text-gray-400">Verified Vendor</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Booking Form */}
                <div className="lg:sticky lg:top-8 h-fit">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Book this Service</h2>
                            <p className="text-gray-500 text-sm">Fill in the details to request a booking</p>
                        </div>

                        <form onSubmit={handleBooking} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={eventTime}
                                        onChange={(e) => setEventTime(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full address or venue name"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Guests (Optional)</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 100"
                                    value={guests}
                                    onChange={(e) => setGuests(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Details & Requirements</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Please describe your event and any specific requirements effectively..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:outline-none resize-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">Provide clear details to help the vendor understand your needs.</p>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Total Price</span>
                                    <span className="text-2xl font-bold text-gray-900">£{pkg.price}</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isBooking}
                                    className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {isBooking ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Request to Book'
                                    )}
                                </button>
                                <p className="text-xs text-center text-gray-400 mt-3">You won't be charged yet. The vendor will confirm your request.</p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
