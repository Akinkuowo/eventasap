'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Calendar,
    MapPin,
    Users,
    DollarSign,
    MessageSquare,
    Loader2,
    CheckCircle,
    AlertCircle,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/utils/tokenManager';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface BookingFormProps {
    vendorId?: string;
    serviceId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function BookingRequestForm({
    vendorId: propVendorId,
    serviceId: propServiceId,
    onSuccess,
    onCancel
}: BookingFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get vendor and service from props or URL params
    const vendorId = propVendorId || searchParams.get('vendor') || '';
    const serviceId = propServiceId || searchParams.get('service') || '';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        vendorId,
        serviceId,
        serviceType: '',
        eventDate: '',
        eventLocation: '',
        guests: 1,
        budget: '',
        message: '',
        customRequirements: [] as string[]
    });
    const [customRequirement, setCustomRequirement] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'guests' || name === 'budget' ? Number(value) : value
        }));
    };

    const addCustomRequirement = () => {
        if (customRequirement.trim()) {
            setFormData(prev => ({
                ...prev,
                customRequirements: [...prev.customRequirements, customRequirement.trim()]
            }));
            setCustomRequirement('');
        }
    };

    const removeCustomRequirement = (index: number) => {
        setFormData(prev => ({
            ...prev,
            customRequirements: prev.customRequirements.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validation
            if (!formData.vendorId) {
                toast.error('Vendor ID is required');
                setIsSubmitting(false);
                return;
            }

            if (!formData.serviceType) {
                toast.error('Please select a service type');
                setIsSubmitting(false);
                return;
            }

            if (!formData.eventDate) {
                toast.error('Please select an event date');
                setIsSubmitting(false);
                return;
            }

            if (!formData.eventLocation) {
                toast.error('Please enter event location');
                setIsSubmitting(false);
                return;
            }

            if (!formData.budget || Number(formData.budget) <= 0) {
                toast.error('Please enter a valid budget');
                setIsSubmitting(false);
                return;
            }

            const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    budget: Number(formData.budget),
                    guests: Number(formData.guests)
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Booking request submitted successfully!');
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push('/dashboard/bookings');
                }
            } else {
                toast.error(data.error || 'Failed to submit booking request');
            }
        } catch (error) {
            console.error('Booking submission error:', error);
            toast.error('Failed to submit booking request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Request a Booking</h2>
                <p className="text-gray-600">Fill out the form below to request a booking with this vendor</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Type */}
                <div>
                    <label htmlFor="serviceType" className="block text-sm font-bold text-gray-900 mb-2">
                        Service Type *
                    </label>
                    <select
                        id="serviceType"
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all"
                    >
                        <option value="">Select a service type</option>
                        <option value="Photography">Photography</option>
                        <option value="Catering">Catering</option>
                        <option value="Decoration">Decoration</option>
                        <option value="Music">Music</option>
                        <option value="Venue">Venue</option>
                        <option value="Makeup">Makeup</option>
                        <option value="Videography">Videography</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Event Date */}
                <div>
                    <label htmlFor="eventDate" className="block text-sm font-bold text-gray-900 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Event Date *
                    </label>
                    <input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all"
                    />
                </div>

                {/* Event Location */}
                <div>
                    <label htmlFor="eventLocation" className="block text-sm font-bold text-gray-900 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Event Location *
                    </label>
                    <input
                        type="text"
                        id="eventLocation"
                        name="eventLocation"
                        value={formData.eventLocation}
                        onChange={handleInputChange}
                        placeholder="Enter event location"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all"
                    />
                </div>

                {/* Number of Guests */}
                <div>
                    <label htmlFor="guests" className="block text-sm font-bold text-gray-900 mb-2">
                        <Users className="w-4 h-4 inline mr-2" />
                        Number of Guests *
                    </label>
                    <input
                        type="number"
                        id="guests"
                        name="guests"
                        value={formData.guests}
                        onChange={handleInputChange}
                        min="1"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all"
                    />
                </div>

                {/* Budget */}
                <div>
                    <label htmlFor="budget" className="block text-sm font-bold text-gray-900 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Budget (£) *
                    </label>
                    <input
                        type="number"
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="Enter your budget"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all"
                    />
                </div>

                {/* Message */}
                <div>
                    <label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-2">
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Additional Message
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Tell the vendor more about your event..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all resize-none"
                    />
                </div>

                {/* Custom Requirements */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Custom Requirements
                    </label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={customRequirement}
                            onChange={(e) => setCustomRequirement(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomRequirement())}
                            placeholder="Add a custom requirement"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all"
                        />
                        <button
                            type="button"
                            onClick={addCustomRequirement}
                            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Add
                        </button>
                    </div>
                    {formData.customRequirements.length > 0 && (
                        <div className="space-y-2">
                            {formData.customRequirements.map((req, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-700">{req}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeCustomRequirement(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Submit Request
                            </>
                        )}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
