'use client';

import React from 'react';
import {
    Camera,
    Utensils,
    MapPin,
    Music,
    Zap,
    Sparkles,
    Heart,
    Palette,
    Mic2,
    Car,
    Briefcase,
    PartyPopper,
    ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = [
    {
        id: 'photography',
        name: 'Photography & Videography',
        icon: Camera,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'hover:border-blue-200',
        shadowColor: 'hover:shadow-blue-500/10',
        description: 'Capture every moment with professional lenses.'
    },
    {
        id: 'catering',
        name: 'Catering & Food Services',
        icon: Utensils,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'hover:border-orange-200',
        shadowColor: 'hover:shadow-orange-500/10',
        description: 'Delicious menus for every taste and budget.'
    },
    {
        id: 'venue',
        name: 'Venue & Location',
        icon: MapPin,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'hover:border-emerald-200',
        shadowColor: 'hover:shadow-emerald-500/10',
        description: 'Find the perfect space for your celebration.'
    },
    {
        id: 'entertainment',
        name: 'Entertainment & Music',
        icon: Music,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'hover:border-purple-200',
        shadowColor: 'hover:shadow-purple-500/10',
        description: 'Live bands, DJs, and unique performances.'
    },
    {
        id: 'decoration',
        name: 'Decoration & Florist',
        icon: Zap,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        borderColor: 'hover:border-pink-200',
        shadowColor: 'hover:shadow-pink-500/10',
        description: 'Transform your space with stunning decor.'
    },
    {
        id: 'makeup',
        name: 'Makeup & Hairstyling',
        icon: Sparkles,
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        borderColor: 'hover:border-rose-200',
        shadowColor: 'hover:shadow-rose-500/10',
        description: 'Professional beauty services for your big day.'
    },
    {
        id: 'planning',
        name: 'Event Planning',
        icon: Heart,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'hover:border-indigo-200',
        shadowColor: 'hover:shadow-indigo-500/10',
        description: 'Expert coordination for stress-free events.'
    },
    {
        id: 'av',
        name: 'Audio-Visual & Lighting',
        icon: Mic2,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50',
        borderColor: 'hover:border-cyan-200',
        shadowColor: 'hover:shadow-cyan-500/10',
        description: 'Professional sound and light engineering.'
    },
    {
        id: 'transport',
        name: 'Transportation',
        icon: Car,
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        borderColor: 'hover:border-slate-200',
        shadowColor: 'hover:shadow-slate-500/10',
        description: 'Luxury shuttles, limos, and event transport.'
    },
    {
        id: 'corporate',
        name: 'Corporate Events',
        icon: Briefcase,
        color: 'text-blue-800',
        bgColor: 'bg-blue-100/50',
        borderColor: 'hover:border-blue-300',
        shadowColor: 'hover:shadow-blue-600/10',
        description: 'Tailored solutions for business gatherings.'
    },
    {
        id: 'wedding',
        name: 'Wedding Services',
        icon: PartyPopper,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'hover:border-red-200',
        shadowColor: 'hover:shadow-red-500/10',
        description: 'Everything you need for your dream wedding.'
    },
    {
        id: 'other',
        name: 'Other Services',
        icon: Palette,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'hover:border-gray-200',
        shadowColor: 'hover:shadow-gray-500/10',
        description: 'Unique services tailored to your needs.'
    }
];

const CategorySection = () => {
    const router = useRouter();

    const handleCategoryClick = (categoryName: string) => {
        const params = new URLSearchParams();
        params.append('category', categoryName);
        router.push(`/clients?${params.toString()}`);
    };

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-50/50 rounded-full blur-3xl opacity-50"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-dm-sans font-bold text-gray-900 tracking-tight">
                        Browse event services by <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">category</span>
                    </h2>
                    <p className="text-gray-500 text-lg font-medium">
                        Discover top-rated professionals across all event service categories.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.name)}
                                className={`group relative p-8 bg-white border border-gray-100 rounded-[2rem] text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer ${category.borderColor} ${category.shadowColor}`}
                            >
                                <div className="space-y-6">
                                    {/* Icon Box */}
                                    <div className={`w-14 h-14 rounded-2xl ${category.bgColor} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                        <Icon className={`w-7 h-7 ${category.color}`} />
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                            {category.description}
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center text-xs font-bold text-gray-400 group-hover:text-orange-500 uppercase tracking-widest transition-colors">
                                        <span>Explore All</span>
                                        <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
                                </div>

                                {/* Subtle Background Pattern */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                                    <Icon className="w-24 h-24" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* All Categories Link */}
                <div className="mt-16 text-center">
                    <button
                        onClick={() => router.push('/clients')}
                        className="inline-flex items-center space-x-3 px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-gray-200 hover:shadow-orange-500/20 group"
                    >
                        <span>View All Service Providers</span>
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
