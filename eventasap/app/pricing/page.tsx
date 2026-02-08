'use client';

import React, { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
    Check,
    ArrowRight,
    Zap,
    Rocket,
    Building2,
    Plus,
    Minus,
    HelpCircle
} from 'lucide-react';
import Link from 'next/link';

const tiers = [
    {
        name: 'Basic',
        price: '0',
        description: 'Perfect for individuals and new vendors starting their journey.',
        features: [
            '3 Service Listings',
            'Standard Vendor Profile',
            'Community Support',
            'Basic Analytics',
            'Project Management Tools'
        ],
        cta: 'Get Started Free',
        link: '/signup?role=vendor',
        highlight: false
    },
    {
        name: 'Pro',
        price: '29',
        description: 'Best for growing professionals who want maximum visibility.',
        features: [
            'Unlimited Service Listings',
            'Featured on Home Page',
            'Advanced Analytics & Insights',
            'Priority Email Support',
            'Verified Badge',
            'Custom Profile URL'
        ],
        cta: 'Start 14-Day Trial',
        link: '/signup?role=vendor&plan=pro',
        highlight: true
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Tailored solutions for large event agencies and franchises.',
        features: [
            'Dedicated Account Manager',
            'White-label Service Pages',
            'Internal Team Collaboration',
            'API Access & Integrations',
            'SSO & Advanced Security',
            'Custom Contract Terms'
        ],
        cta: 'Contact Sales',
        link: '/contact',
        highlight: false
    }
];

const faqs = [
    {
        question: "How does the payment system work?",
        answer: "We use a secure escrow-like system. When a client books a service, they pay 100% upfront. We release 70% to the vendor once the booking is confirmed, and the remaining 30% upon successful completion of the event."
    },
    {
        question: "Can I upgrade or downgrade my plan later?",
        answer: "Yes, you can change your plan at any time from your dashboard settings. Upgrades take effect immediately, while downgrades are applied at the end of your current billing cycle."
    },
    {
        question: "Is there a transaction fee on free plans?",
        answer: "We charge a small platform fee on every successful booking to maintain the marketplace and ensure secure payments for all users, regardless of their subscription tier."
    },
    {
        question: "How do I get the 'Verified' badge?",
        answer: "The 'Verified' badge is available to Pro and Enterprise subscribers after completing our identity and quality verification process, which includes background checks and work sample reviews."
    }
];

const PricingPage = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        <main className="min-h-screen bg-white font-dm-sans">
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 text-center">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                        Simple, <span className="text-orange-600">transparent</span> pricing for every vendor
                    </h1>
                    <p className="text-lg text-gray-500 font-medium mb-12">
                        Choose the plan that fits your business needs. No hidden fees, just growth.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center space-x-4 mb-16">
                        <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-14 h-8 bg-gray-100 rounded-full p-1 relative transition-colors hover:bg-gray-200"
                        >
                            <div className={`w-6 h-6 bg-orange-600 rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                        <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>
                            Yearly <span className="text-green-500 font-black ml-1">(-20%)</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* Tiers Grid */}
            <section className="pb-32 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tiers.map((tier, idx) => (
                            <div
                                key={idx}
                                className={`relative p-8 md:p-10 rounded-[2.5rem] border transition-all duration-500 ${tier.highlight
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-2xl scale-105 z-10'
                                        : 'bg-white text-gray-900 border-gray-100 hover:border-orange-200 hover:shadow-xl'
                                    }`}
                            >
                                {tier.highlight && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className={`text-xl font-bold mb-4 ${tier.highlight ? 'text-orange-500' : 'text-gray-900'}`}>
                                        {tier.name}
                                    </h3>
                                    <div className="flex items-baseline space-x-1">
                                        <span className="text-4xl md:text-5xl font-black">
                                            {tier.price === 'Custom' ? '' : '$'}{tier.price}
                                        </span>
                                        {tier.price !== 'Custom' && (
                                            <span className={`text-sm font-bold ${tier.highlight ? 'text-gray-400' : 'text-gray-400'}`}>
                                                /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                                            </span>
                                        )}
                                        {tier.price === 'Custom' && <span className="text-4xl md:text-5xl font-black">Custom</span>}
                                    </div>
                                    <p className={`mt-4 text-sm font-medium ${tier.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {tier.description}
                                    </p>
                                </div>

                                <Link
                                    href={tier.link}
                                    className={`w-full py-4 mb-10 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all active:scale-95 ${tier.highlight
                                            ? 'bg-orange-600 text-white hover:bg-orange-700'
                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                        }`}
                                >
                                    <span>{tier.cta}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>

                                <div className="space-y-4">
                                    {tier.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-center space-x-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${tier.highlight ? 'bg-orange-500/20 text-orange-500' : 'bg-green-50 text-green-600'}`}>
                                                <Check className="w-3 h-3 font-bold" />
                                            </div>
                                            <span className={`text-sm font-medium ${tier.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 bg-gray-50/50">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-full text-orange-600 text-sm font-bold mb-6">
                            <HelpCircle className="w-4 h-4" />
                            <span>Troubleshooting</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">Frequently asked questions</h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:border-orange-200 transition-colors"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left"
                                >
                                    <span className="text-lg font-bold text-gray-900">{faq.question}</span>
                                    {openFaq === idx ? <Minus className="w-5 h-5 text-orange-600" /> : <Plus className="w-5 h-5 text-gray-400" />}
                                </button>
                                {openFaq === idx && (
                                    <div className="px-8 pb-8 text-gray-500 font-medium leading-relaxed">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="p-12 md:p-20 bg-gray-900 rounded-[3.5rem] relative overflow-hidden text-center">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600 opacity-20 blur-[120px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 opacity-20 blur-[120px] pointer-events-none"></div>

                        <div className="relative z-10 space-y-8">
                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                                Ready to scale your <span className="text-orange-600">event business?</span>
                            </h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-medium">
                                Join thousands of vendors already winning bookings on EventASAP. No credit card required to get started.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/signup?role=vendor" className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/40">
                                    Start Listing Now
                                </Link>
                                <Link href="/contact" className="px-10 py-5 bg-white/10 text-white border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all">
                                    Talk to Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
};

export default PricingPage;
