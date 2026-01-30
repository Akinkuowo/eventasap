'use client';

import React from 'react';
import {
    ShieldCheck,
    CreditCard,
    Headphones,
    Tag,
    MessageSquare,
    PackageCheck,
    ArrowRight
} from 'lucide-react';

const features = [
    {
        title: 'Verified Vendors',
        description: 'Every professional on our platform undergoes a rigorous verification process to ensure quality and reliability.',
        icon: ShieldCheck,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
    },
    {
        title: 'Secure Payments',
        description: 'Our encrypted payment system ensures your transactions are safe, with clear tracking of every deposit and balance.',
        icon: CreditCard,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
    },
    {
        title: '24/7 Support',
        description: 'Our dedicated support team is always available to assist you with any questions or concerns regarding your bookings.',
        icon: Headphones,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
    },
    {
        title: 'Transparent Pricing',
        description: 'Say goodbye to hidden fees. View detailed pricing and service inclusions upfront before you make any commitment.',
        icon: Tag,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
    },
    {
        title: 'Direct Communication',
        description: 'Chat directly with vendors to discuss your specific requirements and get instant updates on your booking status.',
        icon: MessageSquare,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
    },
    {
        title: 'Tailored Packages',
        description: 'Get custom service packages designed specifically for your event type, size, and unique style preferences.',
        icon: PackageCheck,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
    }
];

const UniqueServices = () => {
    return (
        <section className="py-24 bg-gray-50/50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-dm-sans font-bold text-gray-900 mb-6 leading-tight">
                            Experience the <span className="text-orange-600">unique benefits</span> of booking with EventASAP
                        </h2>
                        <p className="text-gray-600 text-lg font-medium">
                            We provide a seamless and secure environment for clients to connect with top-tier event service providers.
                        </p>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={idx}
                                className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-500 hover:-translate-y-1 cursor-default"
                            >
                                <div className="space-y-6">
                                    <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                        <Icon className={`w-7 h-7 ${feature.color}`} />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed font-medium">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default UniqueServices;
