'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Plus,
    Trash2,
    Loader2,
    Save,
    Info,
    CheckCircle,
    PoundSterling,
    Image as ImageIcon,
    Calendar as CalendarIcon,
    MapPin,
    Type,
    Bold,
    Underline,
    List as ListIcon,
    ChevronDown,
    Search,
    Globe,
    UploadCloud,
    Clock,
    Users,
    Package as PackageIcon,
    LayoutGrid,
    Settings,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/utils/tokenManager';

interface Country {
    name: string;
    flag: string;
    code: string;
}

interface ServicePackage {
    id?: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    duration: number;
    inclusions: string[];
    isActive: boolean;
    aboutVendor?: string;
    mainImage?: string;
    gallery: string[];
    location?: string;
    state?: string;
    availability?: any;
    minBooking?: number;
    maxBooking?: number;
    preparationTime?: number;
}

interface AddEditPackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    pkg: ServicePackage | null;
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const AddEditPackageModal: React.FC<AddEditPackageModalProps> = ({ isOpen, onClose, onSuccess, pkg }) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'availability'>('basic');
    const [countries, setCountries] = useState<Country[]>([]);
    const [fetchingCountries, setFetchingCountries] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [showLocationSelect, setShowLocationSelect] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [states, setStates] = useState<string[]>([]);
    const [fetchingStates, setFetchingStates] = useState(false);
    const [stateSearch, setStateSearch] = useState('');
    const [showStateSelect, setShowStateSelect] = useState(false);
    const [formData, setFormData] = useState<ServicePackage>({
        title: '',
        description: '',
        price: 0,
        currency: 'GBP',
        duration: 60,
        inclusions: [''],
        isActive: true,
        aboutVendor: '',
        mainImage: '',
        gallery: [],
        location: '',
        availability: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
            blockedDates: []
        },
        minBooking: 1,
        preparationTime: 1
    });

    const [hasProof, setHasProof] = useState<boolean>(true);
    const [checkingProof, setCheckingProof] = useState<boolean>(true);

    useEffect(() => {
        const fetchCountries = async () => {
            if (countries.length > 0) return;
            setFetchingCountries(true);
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca2');
                const data = await response.json();
                const formatted = data.map((c: any) => ({
                    name: c.name.common,
                    flag: c.flags.svg || c.flags.png,
                    code: c.cca2
                })).sort((a: any, b: any) => a.name.localeCompare(b.name));
                setCountries(formatted);
            } catch (error) {
                console.error('Error fetching countries:', error);
            } finally {
                setFetchingCountries(false);
            }
        };

        const checkBusinessProof = async () => {
            try {
                const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/auth/me`);
                const data = await response.json();
                if (data.success && data.data.user.vendorProfile) {
                    setHasProof(!!data.data.user.vendorProfile.businessProof);
                }
            } catch (error) {
                console.error('Error checking proof:', error);
            } finally {
                setCheckingProof(false);
            }
        };

        if (isOpen) {
            fetchCountries();
            checkBusinessProof();
        }
    }, [isOpen]);

    const fetchStates = async (countryName: string) => {
        setFetchingStates(true);
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: countryName })
            });
            const data = await response.json();
            if (!data.error) {
                setStates(data.data.states.map((s: any) => s.name));
            } else {
                setStates([]);
            }
        } catch (error) {
            console.error('Error fetching states:', error);
            setStates([]);
        } finally {
            setFetchingStates(false);
        }
    };

    useEffect(() => {
        if (formData.location) {
            fetchStates(formData.location);
        } else {
            setStates([]);
        }
    }, [formData.location]);

    useEffect(() => {
        if (pkg) {
            const safePkg = pkg;
            setFormData({
                ...safePkg,
                inclusions: safePkg.inclusions.length > 0 ? safePkg.inclusions : [''],
                gallery: safePkg.gallery || [],
                availability: safePkg.availability || {
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: true,
                    sunday: true,
                    blockedDates: []
                }
            });
            if (safePkg.mainImage) {
                setImagePreview(safePkg.mainImage);
            }
        } else {
            setFormData({
                title: '',
                description: '',
                price: 0,
                currency: 'GBP',
                duration: 60,
                inclusions: [''],
                isActive: true,
                aboutVendor: '',
                mainImage: '',
                gallery: [],
                location: '',
                state: '',
                availability: {
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: true,
                    sunday: true,
                    blockedDates: []
                },
                minBooking: 1,
                preparationTime: 1
            });
            setImagePreview(null);
            setImageFile(null);
        }
    }, [pkg, isOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setFormData({ ...formData, mainImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInclusionChange = (index: number, value: string) => {
        const newInclusions = [...formData.inclusions];
        newInclusions[index] = value;
        setFormData({ ...formData, inclusions: newInclusions });
    };

    const addInclusion = () => {
        setFormData({ ...formData, inclusions: [...formData.inclusions, ''] });
    };

    const removeInclusion = (index: number) => {
        const newInclusions = formData.inclusions.filter((_, i) => i !== index);
        setFormData({ ...formData, inclusions: newInclusions.length > 0 ? newInclusions : [''] });
    };

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`File ${file.name} is too large. Max size is 5MB.`);
                    return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({
                        ...prev,
                        gallery: [...prev.gallery, reader.result as string]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeGalleryItem = (index: number) => {
        const newGallery = formData.gallery.filter((_, i) => i !== index);
        setFormData({ ...formData, gallery: newGallery });
    };

    const toggleDay = (day: string) => {
        setFormData({
            ...formData,
            availability: {
                ...formData.availability,
                [day]: !formData.availability[day]
            }
        });
    };

    const toggleDate = (date: string) => {
        const blocked = formData.availability.blockedDates || [];
        const newBlocked = blocked.includes(date)
            ? blocked.filter((d: string) => d !== date)
            : [...blocked, date];

        setFormData({
            ...formData,
            availability: {
                ...formData.availability,
                blockedDates: newBlocked
            }
        });
    };

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(locationSearch.toLowerCase())
    );

    const filteredStates = states.filter(s =>
        s.toLowerCase().includes(stateSearch.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = pkg
                ? `${NEXT_PUBLIC_API_URL}/api/vendor/packages/${pkg.id}`
                : `${NEXT_PUBLIC_API_URL}/api/vendor/packages`;

            const method = pkg ? 'PUT' : 'POST';

            const cleanedData = {
                ...formData,
                inclusions: formData.inclusions.filter(i => i.trim() !== ''),
                gallery: formData.gallery.filter(i => i.trim() !== '')
            };

            const response = await fetchWithAuth(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanedData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Package ${pkg ? 'updated' : 'created'} successfully`);
                onSuccess();
                onClose();
            } else {
                toast.error(data.error || 'Something went wrong');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error saving package');
        } finally {
            setLoading(false);
        }
    };

    const execCommand = (command: string) => {
        toast.info(`${command} applied (Dynamic Simulation)`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                                <PackageIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {pkg ? 'Edit Service Package' : 'Create New Service Package'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {pkg ? 'Update your existing service details' : 'Add a new service to your offerings'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50/50 px-8">
                    {[
                        { id: 'basic', label: 'Basic Info', icon: Settings },
                        { id: 'media', label: 'Media', icon: ImageIcon },
                        { id: 'availability', label: 'Schedule', icon: CalendarIcon }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-4 text-sm font-medium transition-all flex items-center space-x-2 border-b-2 ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-700 bg-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-8">
                    {!checkingProof && !hasProof && !pkg ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Proof of Business Required</h3>
                            <p className="text-gray-500 max-w-md mb-8">
                                To ensure quality and trust on our platform, we require all vendors to provide proof of business before creating service packages.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <form className="space-y-8" id="package-form" onSubmit={handleSubmit}>
                            {activeTab === 'basic' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left Column */}
                                        <div className="lg:col-span-2 space-y-8">
                                            {/* Title */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Package Title
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g., Premium Wedding Photography Package"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                                                />
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Description
                                                    </label>
                                                    <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-lg">
                                                        <button type="button" onClick={() => execCommand('bold')} className="p-1.5 hover:bg-white rounded text-gray-600 hover:text-blue-600 transition-all">
                                                            <Bold className="w-4 h-4" />
                                                        </button>
                                                        <button type="button" onClick={() => execCommand('underline')} className="p-1.5 hover:bg-white rounded text-gray-600 hover:text-blue-600 transition-all">
                                                            <Underline className="w-4 h-4" />
                                                        </button>
                                                        <button type="button" onClick={() => execCommand('list')} className="p-1.5 hover:bg-white rounded text-gray-600 hover:text-blue-600 transition-all">
                                                            <ListIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <textarea
                                                    required
                                                    rows={8}
                                                    placeholder="Describe your service package in detail..."
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 resize-none"
                                                />
                                            </div>

                                            {/* Price & Duration */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Price (£)
                                                    </label>
                                                    <div className="relative">
                                                        <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="number"
                                                            required
                                                            min="0"
                                                            step="0.01"
                                                            value={formData.price}
                                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Duration (minutes)
                                                    </label>
                                                    <div className="relative">
                                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="number"
                                                            required
                                                            min="1"
                                                            value={formData.duration}
                                                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* About Vendor */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    About You (Vendor)
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    placeholder="Tell clients about your expertise and experience..."
                                                    value={formData.aboutVendor}
                                                    onChange={(e) => setFormData({ ...formData, aboutVendor: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-8">
                                            {/* Inclusions */}
                                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                                <div className="flex items-center justify-between mb-4">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Inclusions
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={addInclusion}
                                                        className="p-2 hover:bg-white rounded-lg transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                </div>
                                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                                    {formData.inclusions.map((inclusion, index) => (
                                                        <div key={index} className="flex items-center space-x-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Add feature..."
                                                                value={inclusion}
                                                                onChange={(e) => handleInclusionChange(index, e.target.value)}
                                                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                            {formData.inclusions.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeInclusion(index)}
                                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Location */}
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Country
                                                    </label>
                                                    <div className="relative">
                                                        <div
                                                            onClick={() => setShowLocationSelect(!showLocationSelect)}
                                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <Globe className="w-4 h-4 text-gray-400" />
                                                                <span className={formData.location ? 'text-gray-900' : 'text-gray-400'}>
                                                                    {formData.location || 'Select country'}
                                                                </span>
                                                            </div>
                                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showLocationSelect ? 'rotate-180' : ''}`} />
                                                        </div>

                                                        {showLocationSelect && (
                                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                                                <div className="p-3 border-b">
                                                                    <div className="relative">
                                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                        <input
                                                                            type="text"
                                                                            autoFocus
                                                                            placeholder="Search countries..."
                                                                            value={locationSearch}
                                                                            onChange={(e) => setLocationSearch(e.target.value)}
                                                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="max-h-[200px] overflow-y-auto">
                                                                    {fetchingCountries ? (
                                                                        <div className="py-8 text-center">
                                                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                                                                            <p className="text-sm text-gray-500">Loading countries...</p>
                                                                        </div>
                                                                    ) : filteredCountries.length > 0 ? (
                                                                        filteredCountries.map(country => (
                                                                            <button
                                                                                key={country.code}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setFormData({ ...formData, location: country.name });
                                                                                    setShowLocationSelect(false);
                                                                                }}
                                                                                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-left"
                                                                            >
                                                                                <img src={country.flag} alt={country.name} className="w-6 h-4 object-cover rounded" />
                                                                                <span className="text-sm text-gray-700">{country.name}</span>
                                                                            </button>
                                                                        ))
                                                                    ) : (
                                                                        <div className="py-8 text-center">
                                                                            <p className="text-sm text-gray-500">No countries found</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {formData.location && (
                                                    <div className="animate-in fade-in duration-300">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            State/Region
                                                        </label>
                                                        <div className="relative">
                                                            <div
                                                                onClick={() => setShowStateSelect(!showStateSelect)}
                                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors flex items-center justify-between"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                                    <span className={formData.state ? 'text-gray-900' : 'text-gray-400'}>
                                                                        {formData.state || 'Select state/region'}
                                                                    </span>
                                                                </div>
                                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showStateSelect ? 'rotate-180' : ''}`} />
                                                            </div>

                                                            {showStateSelect && (
                                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                                                    <div className="p-3 border-b">
                                                                        <div className="relative">
                                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                            <input
                                                                                type="text"
                                                                                autoFocus
                                                                                placeholder="Search states..."
                                                                                value={stateSearch}
                                                                                onChange={(e) => setStateSearch(e.target.value)}
                                                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="max-h-[200px] overflow-y-auto">
                                                                        {fetchingStates ? (
                                                                            <div className="py-8 text-center">
                                                                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                                                                                <p className="text-sm text-gray-500">Loading states...</p>
                                                                            </div>
                                                                        ) : filteredStates.length > 0 ? (
                                                                            filteredStates.map(stateName => (
                                                                                <button
                                                                                    key={stateName}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setFormData({ ...formData, state: stateName });
                                                                                        setShowStateSelect(false);
                                                                                    }}
                                                                                    className="w-full p-3 hover:bg-gray-50 transition-colors text-left"
                                                                                >
                                                                                    <span className="text-sm text-gray-700">{stateName}</span>
                                                                                </button>
                                                                            ))
                                                                        ) : (
                                                                            <div className="py-8 text-center">
                                                                                <p className="text-sm text-gray-500">No states found</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'media' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Main Image Upload */}
                                        <div className="space-y-6">
                                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Main Image</h3>
                                                <p className="text-sm text-gray-500 mb-6">
                                                    Upload a high-quality image that represents your service
                                                </p>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                                                        <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                                            {imageFile ? imageFile.name : 'Click to upload image'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            PNG, JPG, GIF up to 5MB
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {imagePreview && (
                                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                                    <div className="relative aspect-video">
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute top-4 right-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setImageFile(null);
                                                                    setImagePreview(null);
                                                                    setFormData({ ...formData, mainImage: '' });
                                                                }}
                                                                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Gallery */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Gallery</h3>
                                                    <p className="text-sm text-gray-500">Upload multiple images to showcase your work</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="file"
                                                        id="gallery-upload"
                                                        multiple
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleGalleryUpload}
                                                    />
                                                    <label
                                                        htmlFor="gallery-upload"
                                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center space-x-2"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        <span>Add Images</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                                                {formData.gallery.map((item, index) => (
                                                    <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                                                        <img
                                                            src={item}
                                                            alt={`Gallery ${index + 1}`}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeGalleryItem(index)}
                                                                className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {formData.gallery.length === 0 && (
                                                    <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                                        <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                        <p className="text-sm text-gray-500">No gallery images added yet</p>
                                                        <p className="text-xs text-gray-400 mt-1">Upload high-quality images of your service</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'availability' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Days of Week */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Available Days</h3>
                                            <p className="text-sm text-gray-500">Select which days you offer this service</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        onClick={() => toggleDay(day.toLowerCase())}
                                                        className={`p-4 rounded-lg border transition-all flex items-center justify-between ${formData.availability[day.toLowerCase()]
                                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <span className="font-medium">{day}</span>
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.availability[day.toLowerCase()]
                                                            ? 'border-blue-600 bg-blue-600'
                                                            : 'border-gray-300'
                                                            }`}>
                                                            {formData.availability[day.toLowerCase()] && (
                                                                <CheckCircle className="w-3 h-3 text-white" />
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Other Settings */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Booking Settings</h3>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Minimum Booking
                                                    </label>
                                                    <div className="relative">
                                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={formData.minBooking}
                                                            onChange={(e) => setFormData({ ...formData, minBooking: parseInt(e.target.value) })}
                                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Preparation Time (days)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={formData.preparationTime}
                                                        onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Blocked Dates
                                                </label>
                                                <p className="text-sm text-gray-500 mb-4">Select dates when this service is not available</p>
                                                <div className="grid grid-cols-7 gap-2">
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                                                        const dateStr = `2026-01-${date.toString().padStart(2, '0')}`;
                                                        const isBlocked = formData.availability.blockedDates?.includes(dateStr);
                                                        return (
                                                            <button
                                                                key={date}
                                                                type="button"
                                                                onClick={() => toggleDate(dateStr)}
                                                                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${isBlocked
                                                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                                                                    }`}
                                                            >
                                                                {date}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span>All changes are saved automatically</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="package-form"
                                disabled={loading}
                                className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{pkg ? 'Update Package' : 'Create Package'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditPackageModal;