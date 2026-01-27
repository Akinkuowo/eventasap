'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Building,
    Mail,
    Phone,
    Globe as GlobeIcon,
    Navigation,
    MapPin,
    Loader2,
    Search,
    Briefcase,
    X,
    Check
} from 'lucide-react';

interface VendorSetupFormProps {
    vendorFormData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleVendorProfileSubmit: () => Promise<void>;
    setShowVendorSetup: (val: boolean) => void;
    isSaving: boolean;
    countries: any[];
    states: any[];
    cities: any[];
    isLoadingCountries: boolean;
    isLoadingStates: boolean;
    isLoadingCities: boolean;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    setVendorFormData: React.Dispatch<React.SetStateAction<any>>;
    filteredCities: any[];
    serviceCategories: string[];
}

export default function VendorSetupForm({
    vendorFormData,
    handleInputChange,
    handleVendorProfileSubmit,
    setShowVendorSetup,
    isSaving,
    countries,
    states,
    cities,
    isLoadingCountries,
    isLoadingStates,
    isLoadingCities,
    searchQuery,
    setSearchQuery,
    setVendorFormData,
    filteredCities,
    serviceCategories
}: VendorSetupFormProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Setup Vendor Profile</h2>
                    <p className="text-gray-600">Complete your business information to start offering services</p>
                </div>
                <button
                    onClick={() => setShowVendorSetup(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Business Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Name *
                        </label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="vendor.businessName"
                                value={vendorFormData.businessName}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                placeholder="Your Business Name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Email *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                name="vendor.businessEmail"
                                value={vendorFormData.businessEmail}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                placeholder="business@example.com"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Phone
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                name="vendor.businessPhone"
                                value={vendorFormData.businessPhone}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                placeholder="+44 1234 567890"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website
                        </label>
                        <div className="relative">
                            <GlobeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="url"
                                name="vendor.website"
                                value={vendorFormData.website}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                placeholder="https://yourbusiness.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Location Selection */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Navigation className="w-5 h-5 mr-2 text-orange-500" />
                        Business Location
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Country Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country *
                            </label>
                            <div className="relative">
                                <GlobeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                {isLoadingCountries ? (
                                    <div className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center">
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Loading...
                                    </div>
                                ) : (
                                    <select
                                        name="vendor.country"
                                        value={vendorFormData.country}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            setVendorFormData((prev: any) => ({
                                                ...prev,
                                                state: '',
                                                city: ''
                                            }));
                                        }}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 appearance-none"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map((country) => (
                                            <option key={country.code} value={country.name}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* State Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                State / Province
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                {isLoadingStates ? (
                                    <div className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center">
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Loading...
                                    </div>
                                ) : (
                                    <select
                                        name="vendor.state"
                                        value={vendorFormData.state}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            setVendorFormData((prev: any) => ({
                                                ...prev,
                                                city: ''
                                            }));
                                        }}
                                        disabled={!vendorFormData.country || states.length === 0}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select State</option>
                                        {states.map((state) => (
                                            <option key={state.state_code} value={state.name}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* City Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City *
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                {isLoadingCities ? (
                                    <div className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center">
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Loading...
                                    </div>
                                ) : (
                                    <select
                                        name="vendor.city"
                                        value={vendorFormData.city}
                                        onChange={handleInputChange}
                                        disabled={!vendorFormData.country || (!vendorFormData.state && states.length > 0)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select City</option>
                                        {filteredCities.map((city, index) => (
                                            <option key={`${city.name}-${index}`} value={city.name}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Category *
                    </label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            name="vendor.category"
                            value={vendorFormData.category}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 appearance-none"
                        >
                            <option value="">Select Category</option>
                            {serviceCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4">
                    <button
                        onClick={() => setShowVendorSetup(false)}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleVendorProfileSubmit}
                        disabled={isSaving}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Creating Profile...
                            </>
                        ) : (
                            'Create Vendor Profile'
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
