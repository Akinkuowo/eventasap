'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Globe, ChevronDown, Rocket, Zap, Music, Camera, Utensils, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Country {
    name: string;
    flag: string;
    code: string;
}

const Hero = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [isStateOpen, setIsStateOpen] = useState(false);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);

    // Fetch countries
    useEffect(() => {
        const fetchCountries = async () => {
            setLoadingCountries(true);
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
                setLoadingCountries(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch states when country changes
    useEffect(() => {
        const fetchStates = async () => {
            if (!selectedCountry) {
                setStates([]);
                return;
            }
            setLoadingStates(true);
            try {
                const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: selectedCountry })
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
                setLoadingStates(false);
            }
        };
        fetchStates();
    }, [selectedCountry]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedCountry) params.append('country', selectedCountry);
        if (selectedState) params.append('state', selectedState);
        router.push(`/clients?${params.toString()}`);
    };

    const popularSearches = [
        { label: 'Photography & Video', icon: Camera },
        { label: 'Food & Drinks', icon: Utensils },
        { label: 'DJ & Live Bands', icon: Music },
        { label: 'Decor & Styling', icon: Zap },
        { label: 'Venue & Space Rental', icon: MapPin },
        { label: 'Speakers & Host', icon: Star },
    ];

    return (
        <section className="relative h-[650px] w-full flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
                style={{ backgroundImage: "url('/images/hero-bg.png')" }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
            </div>

            {/* Content */}
            <div className="container relative z-10 px-4 mx-auto text-center">
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-dm-sans font-bold text-white tracking-tight leading-tight">
                            Say goodbye to <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">hidden costs</span> in events.
                        </h1>
                        <p className="text-lg md:text-xl text-orange-50/90 font-medium tracking-wide">
                            Creating Memories, One Celebration at a Time!
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-5xl mx-auto">
                        <form
                            onSubmit={handleSearch}
                            className="bg-white p-2 sm:p-3 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0"
                        >
                            {/* Service Query */}
                            <div className="flex-1 flex items-center px-4 sm:px-6 relative group border-r border-gray-100/50">
                                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="What are you looking for?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-800 placeholder:text-gray-400 py-4 h-full"
                                />
                            </div>

                            {/* Country Selector */}
                            <div className="relative group sm:w-48 px-4 border-r border-gray-100/50">
                                <button
                                    type="button"
                                    onClick={() => { setIsCountryOpen(!isCountryOpen); setIsStateOpen(false); }}
                                    className="w-full flex items-center justify-between text-left h-full"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Globe className="w-4 h-4 text-gray-400" />
                                        <span className={`text-sm font-medium truncate ${selectedCountry ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {selectedCountry || 'Country'}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isCountryOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsCountryOpen(false)}></div>
                                        <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-200">
                                            {loadingCountries ? (
                                                <div className="p-4 text-center text-xs text-gray-500 font-medium">Loading countries...</div>
                                            ) : (
                                                countries.map((country) => (
                                                    <button
                                                        key={country.code}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCountry(country.name);
                                                            setSelectedState('');
                                                            setIsCountryOpen(false);
                                                        }}
                                                        className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-orange-50 transition-colors text-left"
                                                    >
                                                        <img src={country.flag} alt={country.name} className="w-5 h-3 object-cover rounded shadow-sm" />
                                                        <span className="text-sm font-medium text-gray-700">{country.name}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* State Selector */}
                            <div className="relative group sm:w-48 px-4">
                                <button
                                    type="button"
                                    disabled={!selectedCountry}
                                    onClick={() => { setIsStateOpen(!isStateOpen); setIsCountryOpen(false); }}
                                    className={`w-full flex items-center justify-between text-left h-full ${!selectedCountry ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className={`text-sm font-medium truncate ${selectedState ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {selectedState || 'State'}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isStateOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isStateOpen && selectedCountry && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsStateOpen(false)}></div>
                                        <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-200">
                                            {loadingStates ? (
                                                <div className="p-4 text-center text-xs text-gray-500 font-medium">Loading states...</div>
                                            ) : states.length > 0 ? (
                                                states.map((state) => (
                                                    <button
                                                        key={state}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedState(state);
                                                            setIsStateOpen(false);
                                                        }}
                                                        className="w-full px-4 py-2.5 hover:bg-orange-50 transition-colors text-left text-sm font-medium text-gray-700"
                                                    >
                                                        {state}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-xs text-gray-500 font-medium">No states found</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Search Button */}
                            <button
                                type="submit"
                                className="px-8 py-4 sm:py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm tracking-wide rounded-xl sm:rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Popular Searches */}
                    <div className="space-y-4 pt-4">
                        <p className="text-white/80 text-sm font-bold tracking-widest uppercase">Popular Searches</p>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                            {popularSearches.map((tag, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery(tag.label);
                                        const params = new URLSearchParams();
                                        params.append('search', tag.label);
                                        router.push(`/clients?${params.toString()}`);
                                    }}
                                    className="group flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-orange-600 backdrop-blur-md rounded-full border border-white/20 hover:border-white transition-all duration-300 cursor-pointer"
                                >
                                    <tag.icon className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                                    <span className="text-xs font-bold tracking-wide">{tag.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
        </section>
    );
};

export default Hero;
