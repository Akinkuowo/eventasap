// app/dashboard/settings/page.tsx - Refactored with modular components
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
    Mail,
    Phone,
    MapPin,
    Building,
    AlertCircle,
    Loader2,
    Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

// Modular Components
import ProfileSettings from './settings/profile-settings';
import VendorProfileSettings from './settings/vendor-profile-settings';
import SecuritySettings from './settings/security-settings';
import NotificationSettings from './settings/notification-settings';
import BillingSettings from './settings/billing-settings';
import PreferenceSettings from './settings/preference-settings';
import VendorSetupForm from './settings/vendor-setup-form';

const NEXT_AUTH_PATH = process.env.NEXT_PUBLIC_API_URL

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showVendorSetup, setShowVendorSetup] = useState(false);
    const [avatarData, setAvatarData] = useState<string | null>(null);

    // Location API states
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
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

    useEffect(() => {
        fetchCountries();
        fetchUserData();
    }, []);

    useEffect(() => {
        if (vendorFormData.country) {
            fetchStates(vendorFormData.country);
        } else {
            setStates([]);
            setCities([]);
        }
    }, [vendorFormData.country]);

    useEffect(() => {
        if (vendorFormData.country && vendorFormData.state) {
            fetchCities(vendorFormData.country, vendorFormData.state);
        } else {
            setCities([]);
        }
    }, [vendorFormData.country, vendorFormData.state]);

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
                    .sort((a: any, b: any) => a.name.localeCompare(b.name));
                setCountries(sortedCountries);
            }
        } catch (error) {
            console.error('Error fetching countries:', error);
        } finally {
            setIsLoadingCountries(false);
        }
    };

    const fetchStates = async (countryName: string) => {
        setIsLoadingStates(true);
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: countryName })
            });
            const data = await response.json();
            if (data.error === false && data.data && data.data.states) {
                const sortedStates = data.data.states
                    .map((state: any) => ({
                        name: state.name,
                        state_code: state.state_code || state.name
                    }))
                    .sort((a: any, b: any) => a.name.localeCompare(b.name));
                setStates(sortedStates);
            }
        } catch (error) {
            console.error('Error fetching states:', error);
        } finally {
            setIsLoadingStates(false);
        }
    };

    const fetchCities = async (countryName: string, stateName: string) => {
        setIsLoadingCities(true);
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: countryName, state: stateName })
            });
            const data = await response.json();
            if (data.error === false && data.data) {
                const sortedCities = data.data
                    .map((city: string) => ({ name: city }))
                    .sort((a: any, b: any) => a.name.localeCompare(b.name));
                setCities(sortedCities);
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setIsLoadingCities(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                window.location.href = '/login';
                return;
            }
            const response = await fetch(`${NEXT_AUTH_PATH}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.data.user);
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('setup') === 'vendor' && !data.data.user.hasVendorProfile) {
                    setShowVendorSetup(true);
                }
            } else if (response.status === 401) {
                localStorage.clear();
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
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
            setUser((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleProfileUpdate = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const payload: any = {
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber
            };

            // Include avatar data if changed
            if (avatarData !== null) {
                payload.avatarUrl = avatarData;
            }

            const response = await fetch(`${NEXT_AUTH_PATH}/api/user/update-profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const data = await response.json();
                toast.success('Profile updated successfully');
                // Update local user state with new avatar URL
                const updatedUser = { ...user, avatarUrl: data.data.user.avatarUrl };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setAvatarData(null); // Reset avatar data after successful upload
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
                body: JSON.stringify({ ...vendorFormData })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Vendor profile created successfully! Awaiting approval.');
                setUser((prev: any) => ({
                    ...prev,
                    hasVendorProfile: true,
                    vendorProfile: data.data.vendorProfile
                }));
                setShowVendorSetup(false);
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

    const handleVendorProfileUpdate = async (updatedData: any) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${NEXT_AUTH_PATH}/api/vendor/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Vendor profile updated successfully');
                setUser((prev: any) => ({
                    ...prev,
                    vendorProfile: data.data.vendorProfile
                }));
            } else {
                toast.error(data.error || 'Failed to update vendor profile');
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

    const filteredCities = searchQuery
        ? cities.filter(city => city.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : cities;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
        );
    }

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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>
                <div className="mt-2 md:mt-0">
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${user.activeRole === 'VENDOR' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700' : 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700'}`}>
                        <Briefcase className="w-4 h-4" />
                        <span className="font-medium">
                            {user.activeRole === 'VENDOR' ? 'Vendor Mode' : 'Client Mode'}
                        </span>
                    </div>
                </div>
            </div>

            {user.activeRole === 'CLIENT' && !user.hasVendorProfile && !showVendorSetup && (
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
                            <h3 className="text-xl font-bold">Ready to offer your services?</h3>
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

            {showVendorSetup && (
                <VendorSetupForm
                    vendorFormData={vendorFormData}
                    handleInputChange={handleInputChange}
                    handleVendorProfileSubmit={handleVendorProfileSubmit}
                    setShowVendorSetup={setShowVendorSetup}
                    isSaving={isSaving}
                    countries={countries}
                    states={states}
                    cities={cities}
                    isLoadingCountries={isLoadingCountries}
                    isLoadingStates={isLoadingStates}
                    isLoadingCities={isLoadingCities}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setVendorFormData={setVendorFormData}
                    filteredCities={filteredCities}
                    serviceCategories={serviceCategories}
                />
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-64">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                if (tab.id === 'vendor' && !user.hasVendorProfile) return null;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-orange-50 to-purple-50 text-orange-600 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
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

                <div className="flex-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        {activeTab === 'profile' && (
                            <ProfileSettings
                                user={user}
                                handleInputChange={handleInputChange}
                                handleProfileUpdate={handleProfileUpdate}
                                isSaving={isSaving}
                                onAvatarChange={setAvatarData}
                            />
                        )}
                        {activeTab === 'vendor' && (
                            <VendorProfileSettings
                                user={user}
                                onUpdate={handleVendorProfileUpdate}
                                isSaving={isSaving}
                            />
                        )}
                        {activeTab === 'security' && (
                            <SecuritySettings />
                        )}
                        {activeTab === 'notifications' && (
                            <NotificationSettings />
                        )}
                        {activeTab === 'billing' && (
                            <BillingSettings />
                        )}
                        {activeTab === 'preferences' && (
                            <PreferenceSettings />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}