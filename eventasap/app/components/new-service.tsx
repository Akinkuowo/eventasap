// app/dashboard/services/new/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Save, DollarSign, Calendar as CalendarIcon,
    MapPin, Users, AlertCircle, Tag, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/utils/tokenManager';

const serviceCategories = [
    'Photography & Videography',
    'Catering & Food Services',
    'Venue & Location',
    'Entertainment & Music',
    'Decoration & Florist',
    'Makeup & Hairstyling',
    'Event Planning & Coordination',
    'Audio-Visual & Lighting',
    'Transportation',
    'Wedding Services',
    'Corporate Events',
    'Party Planning',
    'Other'
];

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NewServiceRequestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [requirements, setRequirements] = useState<string[]>([]);
    const [currentRequirement, setCurrentRequirement] = useState('');

    const [formData, setFormData] = useState({
        serviceType: '',
        description: '',
        budgetRange: {
            min: 500,
            max: 5000
        },
        eventDate: '',
        eventLocation: '',
        guests: 50,
        urgency: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof typeof formData] as any,
                    [child]: name === 'budgetRange.min' || name === 'budgetRange.max' ? parseInt(value) || 0 : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'guests' ? parseInt(value) || 0 : value
            }));
        }
    };

    const addRequirement = () => {
        if (currentRequirement.trim() && !requirements.includes(currentRequirement.trim())) {
            setRequirements([...requirements, currentRequirement.trim()]);
            setCurrentRequirement('');
        }
    };

    const removeRequirement = (index: number) => {
        setRequirements(requirements.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                requirements,
                budgetRange: {
                    min: formData.budgetRange.min,
                    max: formData.budgetRange.max
                }
            };

            const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/service-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Service request posted successfully!');
                router.push('/dashboard/services');
            } else {
                toast.error(data.error || 'Failed to create service request');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create service request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">New Service Request</h1>
                    <p className="text-gray-600">Post your service needs to get quotes from vendors</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Type *
                            </label>
                            <select
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                            >
                                <option value="">Select service type</option>
                                {serviceCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                placeholder="Describe your event and what services you need..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Budget (£) *
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        name="budgetRange.min"
                                        value={formData.budgetRange.min}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Budget (£) *
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        name="budgetRange.max"
                                        value={formData.budgetRange.max}
                                        onChange={handleInputChange}
                                        required
                                        min={formData.budgetRange.min}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Date *
                                </label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleInputChange}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Guests *
                                </label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        name="guests"
                                        value={formData.guests}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Location *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="eventLocation"
                                        value={formData.eventLocation}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                        placeholder="City or venue address"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Urgency Level
                                </label>
                                <select
                                    name="urgency"
                                    value={formData.urgency}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                >
                                    <option value="LOW">Low (Planning stage)</option>
                                    <option value="MEDIUM">Medium (Need within 1-2 months)</option>
                                    <option value="HIGH">High (Urgent - within weeks)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Special Requirements
                            </label>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={currentRequirement}
                                        onChange={(e) => setCurrentRequirement(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                        placeholder="Add a requirement (e.g., 'Vegetarian options', 'Outdoor setup')"
                                    />
                                    <button
                                        type="button"
                                        onClick={addRequirement}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {requirements.map((req, index) => (
                                        <div
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                                        >
                                            {req}
                                            <button
                                                type="button"
                                                onClick={() => removeRequirement(index)}
                                                className="ml-2 text-orange-500 hover:text-orange-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-start space-x-4">
                        <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Tips for getting the best quotes:</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Be specific about your requirements and preferences
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Include your maximum budget to get realistic quotes
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Provide as much detail as possible about your event
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Respond to vendor questions promptly for better service
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Posting...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Post Service Request
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}