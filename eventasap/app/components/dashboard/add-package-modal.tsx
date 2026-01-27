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
    UploadCloud
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

        if (isOpen) {
            fetchCountries();
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
            setFormData({
                ...pkg,
                inclusions: pkg.inclusions.length > 0 ? pkg.inclusions : [''],
                gallery: pkg.gallery || [],
                availability: pkg.availability || {
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
            if (pkg.mainImage) {
                setImagePreview(pkg.mainImage);
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

    const addGalleryItem = () => {
        setFormData({ ...formData, gallery: [...formData.gallery, ''] });
    };

    const handleGalleryChange = (index: number, value: string) => {
        const newGallery = [...formData.gallery];
        newGallery[index] = value;
        setFormData({ ...formData, gallery: newGallery });
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
                className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity duration-500"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] z-10 border border-gray-100 animate-in zoom-in-95 duration-500">
                <div className="px-10 py-8 bg-white flex justify-between items-center border-b border-gray-50 flex-shrink-0 relative z-20">
                    <div className="flex items-center space-x-5">
                        <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                                {pkg ? 'Synchronize Experience' : 'Manifest New Service'}
                            </h3>
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mt-2">
                                Vendor Control Suite &bull; EventASAP
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-4 text-gray-300 hover:text-gray-900 hover:bg-gray-100 transition-all rounded-2xl group"
                    >
                        <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="flex px-10 bg-gray-50/50 border-b border-gray-50 gap-2 flex-shrink-0">
                    {[
                        { id: 'basic', label: 'Details', icon: Type },
                        { id: 'media', label: 'Media', icon: ImageIcon },
                        { id: 'availability', label: 'Schedule', icon: CalendarIcon }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-8 py-5 text-[11px] font-black transition-all flex items-center space-x-3 border-b-4 uppercase tracking-[0.2em] ${activeTab === tab.id
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex-grow overflow-y-auto no-scrollbar bg-white px-10 py-10">
                    <form className="space-y-12" id="package-form" onSubmit={handleSubmit}>
                        {activeTab === 'basic' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                    <div className="lg:col-span-8 space-y-10">
                                        <div className="group">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 group-focus-within:text-orange-500 transition-colors">
                                                Package Identity (Title)
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g., Ultimate Wedding Collection"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-200 transition-all font-bold text-gray-900 text-xl shadow-inner"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Investment (GBP)</label>
                                                <div className="relative">
                                                    <PoundSterling className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        value={formData.price}
                                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                                        className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-200 transition-all font-bold text-gray-900 text-lg shadow-inner"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Time Unit (Min)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                                    className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-200 transition-all font-bold text-gray-900 text-lg shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">The Narrative (Description)</label>
                                                <div className="flex items-center space-x-2 bg-gray-100/80 p-1.5 rounded-xl border border-gray-200 shadow-sm">
                                                    <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-orange-600 transition-all shadow-sm"><Bold className="w-4 h-4" /></button>
                                                    <button type="button" onClick={() => execCommand('underline')} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-orange-600 transition-all shadow-sm"><Underline className="w-4 h-4" /></button>
                                                    <button type="button" onClick={() => execCommand('list')} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-orange-600 transition-all shadow-sm"><ListIcon className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            <textarea
                                                required
                                                rows={10}
                                                placeholder="Detail the experience you provide in high-def..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-10 py-8 bg-gray-50 border-2 border-transparent rounded-[2.5rem] focus:bg-white focus:border-orange-200 transition-all font-medium text-gray-800 leading-[1.8] text-lg shadow-inner resize-none min-h-[300px] placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 space-y-12">
                                        <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 shadow-inner">
                                            <div className="flex justify-between items-center mb-8">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Experience Metrics</label>
                                                <button type="button" onClick={addInclusion} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform">
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                                {formData.inclusions.map((inclusion, index) => (
                                                    <div key={index} className="flex items-center space-x-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 transition-all hover:border-orange-100">
                                                        <input
                                                            type="text"
                                                            placeholder="Add feature..."
                                                            value={inclusion}
                                                            onChange={(e) => handleInclusionChange(index, e.target.value)}
                                                            className="flex-1 px-4 py-2 border-none rounded-lg text-sm font-black text-gray-600 focus:ring-0"
                                                        />
                                                        {formData.inclusions.length > 1 && (
                                                            <button type="button" onClick={() => removeInclusion(index)} className="p-3 text-gray-200 hover:text-red-500 rounded-xl transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4">Deployment Zone (Country)</label>
                                            <div className="relative group/loc">
                                                <div
                                                    onClick={() => setShowLocationSelect(!showLocationSelect)}
                                                    className="w-full pl-6 pr-12 py-5 bg-gray-50 border-2 border-transparent rounded-2xl focus-within:bg-white focus-within:border-orange-200 transition-all font-bold text-gray-900 shadow-inner flex items-center justify-between cursor-pointer group-hover/loc:border-orange-100"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <Globe className="w-5 h-5 text-orange-500" />
                                                        <span className={formData.location ? 'text-gray-900' : 'text-gray-300'}>
                                                            {formData.location || 'Select Deployment Country'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform ${showLocationSelect ? 'rotate-180' : ''}`} />
                                                </div>

                                                {showLocationSelect && (
                                                    <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
                                                        <div className="relative mb-6">
                                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                            <input
                                                                type="text"
                                                                autoFocus
                                                                placeholder="Search countries..."
                                                                value={locationSearch}
                                                                onChange={(e) => setLocationSearch(e.target.value)}
                                                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-orange-100"
                                                            />
                                                        </div>
                                                        <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-1">
                                                            {fetchingCountries ? (
                                                                <div className="py-10 text-center flex flex-col items-center justify-center opacity-40">
                                                                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">Global Scan Active</span>
                                                                </div>
                                                            ) : filteredCountries.length > 0 ? (
                                                                filteredCountries.map(country => (
                                                                    <button
                                                                        key={country.code}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData({ ...formData, location: country.name });
                                                                            setShowLocationSelect(false);
                                                                            setLocationSearch('');
                                                                        }}
                                                                        className="w-full flex items-center space-x-4 p-4 hover:bg-orange-50 rounded-2xl transition-all group/item"
                                                                    >
                                                                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
                                                                            <img src={country.flag} alt={country.name} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <span className="text-sm font-black text-gray-700 group-hover/item:text-orange-600 uppercase tracking-wider">{country.name}</span>
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="py-10 text-center text-gray-300 flex flex-col items-center">
                                                                    <Globe className="w-8 h-8 mb-4 opacity-20" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">No matching terrain</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-gray-100">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Expert Context (About Vendor)</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Why should the client trust you for this specific package?"
                                        value={formData.aboutVendor}
                                        onChange={(e) => setFormData({ ...formData, aboutVendor: e.target.value })}
                                        className="w-full px-10 py-8 bg-gray-50 border-2 border-transparent rounded-[2.5rem] focus:bg-white focus:border-orange-200 transition-all font-bold text-gray-700 leading-relaxed shadow-inner lg:text-lg"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-10">
                                        <div className="bg-orange-50 p-10 rounded-[3rem] border border-orange-100 shadow-inner">
                                            <div className="flex items-center space-x-6 mb-8">
                                                <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-xl flex items-center justify-center">
                                                    <ImageIcon className="w-8 h-8 text-orange-500" />
                                                </div>
                                                <h4 className="font-black text-gray-900 uppercase tracking-[0.3em] text-sm">Package Image</h4>
                                            </div>

                                            <div className="relative group/upload">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                />
                                                <div className="w-full px-8 py-10 bg-white border-2 border-dashed border-orange-200 rounded-[2rem] flex flex-col items-center justify-center transition-all group-hover/upload:border-orange-500 group-hover/upload:bg-orange-50/50">
                                                    <UploadCloud className="w-10 h-10 text-orange-400 mb-4 group-hover/upload:scale-110 transition-transform" />
                                                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest text-center">
                                                        {imageFile ? imageFile.name : 'Upload Package Image'}
                                                    </p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 text-center leading-relaxed px-4">
                                                        Select artifacts from library or drag and drop. (Max 5MB)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {imagePreview && (
                                            <div className="rounded-[4rem] overflow-hidden aspect-video bg-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-[6px] border-white relative group">
                                                <img src={imagePreview} alt="Package Preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                <div className="absolute bottom-8 left-10 right-10 flex justify-between items-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <span className="px-5 py-2.5 bg-white/90 backdrop-blur rounded-xl text-[10px] font-black uppercase tracking-widest text-orange-600 shadow-xl">Live Artifact Preview</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setImageFile(null); setImagePreview(null); setFormData({ ...formData, mainImage: '' }); }}
                                                        className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-10">
                                        <div className="flex justify-between items-center px-4">
                                            <div>
                                                <h4 className="font-black text-gray-900 uppercase tracking-widest text-sm">Media Reservoir</h4>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Populate your gallery</p>
                                            </div>
                                            <button type="button" onClick={addGalleryItem} className="px-8 py-4 bg-black text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl text-[10px] uppercase tracking-widest">
                                                Inject Media
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-8 max-h-[600px] overflow-y-auto pr-6 no-scrollbar">
                                            {formData.gallery.map((item, index) => (
                                                <div key={index} className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 transition-all hover:bg-white hover:shadow-xl group">
                                                    <div className="flex items-center space-x-4 mb-6">
                                                        <input
                                                            type="text"
                                                            placeholder="Gallery Asset URL"
                                                            value={item}
                                                            onChange={(e) => handleGalleryChange(index, e.target.value)}
                                                            className="flex-1 px-5 py-4 bg-white border-2 border-transparent rounded-xl text-xs font-bold text-gray-500 shadow-inner group-hover:border-orange-50"
                                                        />
                                                        <button type="button" onClick={() => removeGalleryItem(index)} className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    {item && <img src={item} alt="Gallery" className="w-full h-40 object-cover rounded-[1.5rem] shadow-lg border-2 border-white" />}
                                                </div>
                                            ))}
                                            {formData.gallery.length === 0 && (
                                                <div className="py-24 flex flex-col items-center justify-center text-gray-200 border-4 border-dashed border-gray-100 rounded-[3rem]">
                                                    <ImageIcon className="w-16 h-16 mb-6 opacity-5" />
                                                    <p className="text-[12px] font-black uppercase tracking-[0.4em] opacity-30">Reservoir Depleted</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'availability' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-10">
                                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.02)]">
                                            <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] mb-10 border-b border-gray-50 pb-6 text-center">Service Frequency</h4>
                                            <div className="space-y-4">
                                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        onClick={() => toggleDay(day)}
                                                        className={`w-full flex items-center justify-between px-8 py-5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border-2 ${formData.availability[day]
                                                            ? 'bg-orange-500 border-transparent text-white shadow-[0_15px_30px_rgba(249,115,22,0.3)] scale-[1.03]'
                                                            : 'bg-gray-50 border-transparent text-gray-300 hover:border-gray-200'
                                                            }`}
                                                    >
                                                        <span>{day}</span>
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.availability[day] ? 'bg-white text-orange-600' : 'bg-gray-200 text-transparent'}`}>
                                                            <CheckCircle className="w-4 h-4" />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-12">
                                        <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 shadow-inner">
                                            <div className="flex items-center space-x-4 mb-10 px-4">
                                                <CalendarIcon className="w-6 h-6 text-orange-600" />
                                                <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] leading-none">Blackout Schedule</h4>
                                            </div>
                                            <div className="grid grid-cols-7 gap-3 mb-12">
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                                                    const dateStr = `2026-01-${date.toString().padStart(2, '0')}`;
                                                    const isBlocked = formData.availability.blockedDates?.includes(dateStr);
                                                    return (
                                                        <button
                                                            key={date}
                                                            type="button"
                                                            onClick={() => toggleDate(dateStr)}
                                                            className={`aspect-square flex items-center justify-center rounded-2xl text-[11px] font-black transition-all ${isBlocked
                                                                ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                                                                : 'bg-white text-gray-400 hover:bg-orange-600 hover:text-white hover:scale-110'
                                                                }`}
                                                        >
                                                            {date}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-gray-200">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Min. Units</label>
                                                    <input
                                                        type="number"
                                                        value={formData.minBooking}
                                                        onChange={(e) => setFormData({ ...formData, minBooking: parseInt(e.target.value) })}
                                                        className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-black text-sm text-gray-900 shadow-inner focus:border-orange-200 outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Prep Buffer (Days)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.preparationTime}
                                                        onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                                                        className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-black text-sm text-gray-900 shadow-inner focus:border-orange-200 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="px-10 py-12 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-10 flex-shrink-0 relative z-20">
                    <div className="flex items-center space-x-4 bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Ready for State Synchronization</span>
                    </div>
                    <div className="flex space-x-6 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-12 py-5 bg-white border-2 border-gray-100 text-gray-950 font-black rounded-2xl hover:bg-gray-50 transition-all text-[11px] uppercase tracking-[0.3em] shadow-sm"
                        >
                            Retract
                        </button>
                        <button
                            type="submit"
                            form="package-form"
                            disabled={loading}
                            className="flex-1 sm:flex-none flex items-center justify-center px-14 py-5 bg-orange-600 text-white font-black rounded-2xl hover:scale-105 hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] transition-all shadow-xl disabled:opacity-50 text-[11px] uppercase tracking-[0.4em]"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Save className="w-6 h-6 mr-4" />}
                            {pkg ? 'Sync Progress' : 'Launch Service'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditPackageModal;
