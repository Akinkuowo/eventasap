// app/dashboard/settings/page.tsx - Updated with proper null checks
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Shield,
    Bell,
    CreditCard,
    Globe,
    HelpCircle,
    LogOut,
    Briefcase,
    Building,
    MapPin,
    Phone,
    Mail,
    Globe as GlobeIcon,
    Check,
    AlertCircle,
    Sparkles,
    Upload,
    X,
    Loader2,
    Search,
    Navigation
} from 'lucide-react';
import { toast } from 'sonner';

// Types for location data
interface Country {
    name: string;
    code: string;
}

interface State {
    name: string;
    state_code: string;
}

interface City {
    name: string;
}

const NEXT_AUTH_PATH = process.env.NEXT_PUBLIC_API_URL

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showVendorSetup, setShowVendorSetup] = useState(false);

    // Location API states
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(false);
    const [isLoadingStates, setIsLoadingStates] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [vendorFormData, setVendorFormData] = useState({
        businessName: '',
        businessEmail: '',
        businessPhone: '',
        country: '',
        state: '',
        city: '',
        category: '',
        description: '',
        serviceAreas: [] as string[],
        whatsappEnabled: false,
        website: '',
        businessAddress: ''
    });

    // Service categories
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

    // Fetch countries on component mount
    useEffect(() => {
        fetchCountries();
        fetchUserData();
    }, []);

    // Fetch states when country changes
    useEffect(() => {
        if (vendorFormData.country) {
            fetchStates(vendorFormData.country);
        } else {
            setStates([]);
            setCities([]);
        }
    }, [vendorFormData.country]);

    // Fetch cities when state changes
    useEffect(() => {
        if (vendorFormData.country && vendorFormData.state) {
            fetchCities(vendorFormData.country, vendorFormData.state);
        } else {
            setCities([]);
        }
    }, [vendorFormData.country, vendorFormData.state]);

    // Fetch all countries from API
    const fetchCountries = async () => {
        setIsLoadingCountries(true);
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries');
            const data = await response.json();

            if (data.error === false && data.data) {
                const sortedCountries = data.data
                    .map((country: any) => ({
                        name: country.country,
                        code: country.iso2 || country.country
                    }))
                    .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

                setCountries(sortedCountries);
            }
        } catch (error) {
            console.error('Error fetching countries:', error);
            toast.error('Failed to load countries');
        } finally {
            setIsLoadingCountries(false);
        }
    };

    // Fetch states for a specific country
    const fetchStates = async (countryName: string) => {
        setIsLoadingStates(true);
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    country: countryName
                })
            });

            const data = await response.json();

            if (data.error === false && data.data && data.data.states) {
                const sortedStates = data.data.states
                    .map((state: any) => ({
                        name: state.name,
                        state_code: state.state_code || state.name
                    }))
                    .sort((a: State, b: State) => a.name.localeCompare(b.name));

                setStates(sortedStates);
            }
        } catch (error) {
            console.error('Error fetching states:', error);
            toast.error('Failed to load states');
        } finally {
            setIsLoadingStates(false);
        }
    };

    // Fetch cities for a specific country and state
    const fetchCities = async (countryName: string, stateName: string) => {
        setIsLoadingCities(true);
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    country: countryName,
                    state: stateName
                })
            });

            const data = await response.json();

            if (data.error === false && data.data) {
                const sortedCities = data.data
                    .map((city: string) => ({
                        name: city
                    }))
                    .sort((a: City, b: City) => a.name.localeCompare(b.name));

                setCities(sortedCities);
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
            toast.error('Failed to load cities');
        } finally {
            setIsLoadingCities(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                toast.error('Please login to access settings');
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`${NEXT_AUTH_PATH}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data.user);

                // Check URL parameters for vendor setup
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('setup') === 'vendor' && !data.data.user.hasVendorProfile) {
                    setShowVendorSetup(true);
                }
            } else if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                localStorage.clear();
                window.location.href = '/login';
            } else {
                toast.error('Failed to load user data');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (name.includes('vendor.')) {
            const fieldName = name.split('.')[1];
            setVendorFormData(prev => ({
                ...prev,
                [fieldName]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
            }));
        } else if (user) {
            setUser((prev: any) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleProfileUpdate = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${NEXT_AUTH_PATH}/api/user/update-profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber
                })
            });

            if (response.ok) {
                toast.success('Profile updated successfully');
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleVendorProfileSubmit = async () => {
        // Validate vendor form
        if (!vendorFormData.businessName || !vendorFormData.businessEmail ||
            !vendorFormData.country || !vendorFormData.city || !vendorFormData.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${NEXT_AUTH_PATH}/api/auth/add-vendor-profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    businessName: vendorFormData.businessName,
                    businessEmail: vendorFormData.businessEmail,
                    businessPhone: vendorFormData.businessPhone,
                    city: vendorFormData.city,
                    country: vendorFormData.country,
                    state: vendorFormData.state,
                    category: vendorFormData.category,
                    description: vendorFormData.description,
                    serviceAreas: vendorFormData.serviceAreas,
                    whatsappEnabled: vendorFormData.whatsappEnabled,
                    website: vendorFormData.website,
                    businessAddress: vendorFormData.businessAddress
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Vendor profile created successfully! Awaiting approval.');

                // Update user state
                setUser((prev: any) => ({
                    ...prev,
                    hasVendorProfile: true,
                    vendorProfile: data.data.vendorProfile
                }));

                setShowVendorSetup(false);

                // Reload user data
                setTimeout(() => fetchUserData(), 1000);
            } else {
                toast.error(data.error || 'Failed to create vendor profile');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'vendor', label: 'Vendor Profile', icon: Briefcase },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'preferences', label: 'Preferences', icon: Globe },
    ];

    // Filter cities based on search query
    const filteredCities = searchQuery
        ? cities.filter(city =>
            city.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : cities;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Show loading state if user is null
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <AlertCircle className="w-12 h-12 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Unable to load user data</h3>
                <button
                    onClick={() => window.location.href = '/login'}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with role status */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                {/* Role status badge - Safe access with optional chaining */}
                <div className="mt-2 md:mt-0">
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${user?.activeRole === 'VENDOR' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700' : 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700'}`}>
                        <Briefcase className="w-4 h-4" />
                        <span className="font-medium">
                            {user?.activeRole === 'VENDOR' ? 'Vendor Mode' : 'Client Mode'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Vendor Setup Prompt - Safe access with optional chaining */}
            {user?.activeRole === 'CLIENT' && !user?.hasVendorProfile && !showVendorSetup && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl p-6 text-white"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Ready to offer your services?</h3>
                                <p className="text-orange-100 mb-4">
                                    Add a vendor profile to start accepting bookings and grow your business on EventASAP.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="flex items-center text-sm">
                                        <Check className="w-4 h-4 mr-1" />
                                        AI-powered pricing recommendations
                                    </span>
                                    <span className="flex items-center text-sm">
                                        <Check className="w-4 h-4 mr-1" />
                                        Automated booking management
                                    </span>
                                    <span className="flex items-center text-sm">
                                        <Check className="w-4 h-4 mr-1" />
                                        Advanced analytics dashboard
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowVendorSetup(true)}
                            className="mt-4 md:mt-0 px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                        >
                            Setup Vendor Profile
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Vendor Setup Form */}
            {showVendorSetup && (
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
                                                Loading countries...
                                            </div>
                                        ) : (
                                            <select
                                                name="vendor.country"
                                                value={vendorFormData.country}
                                                onChange={(e) => {
                                                    handleInputChange(e);
                                                    // Reset state and city when country changes
                                                    setVendorFormData(prev => ({
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

                                {/* State/Province Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State / Province
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        {isLoadingStates ? (
                                            <div className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center">
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Loading states...
                                            </div>
                                        ) : (
                                            <select
                                                name="vendor.state"
                                                value={vendorFormData.state}
                                                onChange={(e) => {
                                                    handleInputChange(e);
                                                    // Reset city when state changes
                                                    setVendorFormData(prev => ({
                                                        ...prev,
                                                        city: ''
                                                    }));
                                                }}
                                                disabled={!vendorFormData.country || states.length === 0}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="">Select State</option>
                                                {states.length === 0 && vendorFormData.country && (
                                                    <option value="" disabled>No states available for this country</option>
                                                )}
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
                                                Loading cities...
                                            </div>
                                        ) : (
                                            <>
                                                {/* Search input for cities */}
                                                <div className="relative mb-2">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search cities..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-200"
                                                    />
                                                </div>

                                                <select
                                                    name="vendor.city"
                                                    value={vendorFormData.city}
                                                    onChange={handleInputChange}
                                                    disabled={!vendorFormData.country || (!vendorFormData.state && states.length > 0)}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">Select City</option>
                                                    {filteredCities.length === 0 && (
                                                        <option value="" disabled>
                                                            {searchQuery ? 'No cities found' : 'Select country and state first'}
                                                        </option>
                                                    )}
                                                    {filteredCities.map((city, index) => (
                                                        <option key={`${city.name}-${index}`} value={city.name}>
                                                            {city.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Business Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Address
                                </label>
                                <textarea
                                    name="vendor.businessAddress"
                                    value={vendorFormData.businessAddress}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                    placeholder="Street address, building, floor, etc."
                                />
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

                        {/* Business Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Description
                            </label>
                            <textarea
                                name="vendor.description"
                                value={vendorFormData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                placeholder="Describe your services, experience, and what makes your business unique..."
                            />
                        </div>

                        {/* WhatsApp Option */}
                        <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl">
                            <input
                                type="checkbox"
                                id="whatsappEnabled"
                                name="vendor.whatsappEnabled"
                                checked={vendorFormData.whatsappEnabled}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <label htmlFor="whatsappEnabled" className="text-sm text-gray-700">
                                Enable WhatsApp notifications for booking inquiries
                            </label>
                        </div>

                        {/* Service Areas (for future enhancement) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Areas (Optional)
                            </label>
                            <div className="flex flex-wrap gap-2 p-4 border border-gray-300 rounded-xl min-h-[60px]">
                                {vendorFormData.serviceAreas.map((area, index) => (
                                    <div
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-50 to-purple-50 text-orange-700 rounded-full text-sm"
                                    >
                                        {area}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setVendorFormData(prev => ({
                                                    ...prev,
                                                    serviceAreas: prev.serviceAreas.filter((_, i) => i !== index)
                                                }));
                                            }}
                                            className="ml-2 text-orange-500 hover:text-orange-700"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    placeholder="Add service area and press Enter"
                                    className="flex-1 min-w-[200px] outline-none bg-transparent"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                            e.preventDefault();
                                            setVendorFormData(prev => ({
                                                ...prev,
                                                serviceAreas: [...prev.serviceAreas, e.currentTarget.value.trim()]
                                            }));
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
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
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;

                                // Hide vendor tab if user doesn't have vendor profile
                                if (tab.id === 'vendor' && !user?.hasVendorProfile) {
                                    return null;
                                }

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-orange-50 to-purple-50 text-orange-600 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                            <a
                                href="/help"
                                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                <HelpCircle className="w-5 h-5" />
                                <span className="font-medium">Help & Support</span>
                            </a>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.href = '/login';
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        {/* Profile Settings */}
                        {activeTab === 'profile' && user && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={user.firstName || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={user.lastName || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email || ''}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed"
                                        disabled
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={user.phoneNumber || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                        placeholder="+44 1234 567890"
                                    />
                                </div>

                                <button
                                    onClick={handleProfileUpdate}
                                    disabled={isSaving}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* Vendor Profile Settings */}
                        {activeTab === 'vendor' && user?.vendorProfile && (
                            <motion.div
                                key="vendor"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Vendor Profile</h2>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.vendorProfile.status === 'APPROVED'
                                                ? 'bg-green-100 text-green-700'
                                                : user.vendorProfile.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {user.vendorProfile.status}
                                            </span>
                                            {user.vendorProfile.isVerified && (
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Business Name
                                        </label>
                                        <input
                                            type="text"
                                            value={user.vendorProfile.businessName || ''}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Business Email
                                        </label>
                                        <input
                                            type="email"
                                            value={user.vendorProfile.businessEmail || ''}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Business Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={user.vendorProfile.businessPhone || ''}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={`${user.vendorProfile.city || ''}, ${user.vendorProfile.country || ''}`}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service Category
                                    </label>
                                    <input
                                        type="text"
                                        value={user.vendorProfile.category || ''}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Business Description
                                    </label>
                                    <textarea
                                        value={user.vendorProfile.description || ''}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                                        disabled
                                    />
                                </div>

                                <div className="p-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl border border-orange-200">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Profile Status</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {user.vendorProfile.status === 'PENDING'
                                                    ? 'Your vendor profile is under review. You will be notified once approved.'
                                                    : user.vendorProfile.status === 'APPROVED'
                                                        ? 'Your vendor profile is active and visible to clients.'
                                                        : 'Your vendor profile has been rejected. Please contact support for more information.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-bold text-gray-900">Security</h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>

                                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300">
                                    Change Password
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
}