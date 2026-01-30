'use client';

import React from 'react';
import {
    Users,
    Briefcase,
    Cake,
    Heart,
    Mic2,
    School,
    ChevronRight,
    Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const eventTypes = [
    {
        name: 'Weddings',
        icon: Heart,
        count: '250+ Vendors',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
    },
    {
        name: 'Corporate Events',
        icon: Briefcase,
        count: '180+ Vendors',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
    },
    {
        name: 'Birthdays',
        icon: Cake,
        count: '320+ Vendors',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
    },
    {
        name: 'Anniversaries',
        icon: Users,
        count: '150+ Vendors',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
    },
    {
        name: 'Concerts & Festivals',
        icon: Mic2,
        count: '200+ Vendors',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
    },
    {
        name: 'Workshops & Seminars',
        icon: School,
        count: '120+ Vendors',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
    }
];

const PopularEvents = () => {
    const router = useRouter();

    const handleEventClick = (eventName: string) => {
        const params = new URLSearchParams();
        params.append('search', eventName);
        router.push(`/clients?${params.toString()}`);
    };

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="max-w-3xl mb-16">
                    <h2 className="text-3xl md:text-5xl font-dm-sans font-bold text-gray-900 mb-6 tracking-tight">
                        Popular <span className="text-orange-600">event types</span> our clients book for
                    </h2>
                    <p className="text-gray-500 text-lg font-medium">
                        Explore vendors specializing in different event categories to find the perfect match for your celebration.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eventTypes.map((event, idx) => {
                        const Icon = event.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleEventClick(event.name)}
                                className="group flex items-center p-6 bg-white border border-gray-100 rounded-3xl hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 text-left cursor-pointer"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${event.bgColor} flex items-center justify-center mr-6 transition-transform group-hover:scale-110`}>
                                    <Icon className={`w-8 h-8 ${event.color}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                                        {event.name}
                                    </h3>
                                    <p className="text-sm text-gray-400 font-bold group-hover:text-gray-500 transition-colors">
                                        {event.count}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-orange-50">
                                    <ChevronRight className="w-5 h-5 text-orange-600" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Custom Event Search CTA */}
                <div className="mt-20 p-8 md:p-12 bg-gray-900 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 opacity-20 blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 opacity-20 blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10 text-center md:text-left space-y-4">
                        <h3 className="text-2xl md:text-3xl font-bold text-white">Planning something unique?</h3>
                        <p className="text-gray-400 max-w-lg font-medium">
                            Search our extensive database of vendors to find exactly what you need for your specific event type.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Type your event..."
                                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEventClick((e.target as HTMLInputElement).value);
                                }}
                            />
                        </div>
                        <button
                            onClick={() => router.push('/clients')}
                            className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-900/20 active:scale-95"
                        >
                            Find Vendors
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PopularEvents;
