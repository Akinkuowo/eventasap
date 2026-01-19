// components/LandingMenu.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, Sparkles, Globe, Smartphone, Zap, BarChart, Palette, CreditCard, Users, Calendar, Flame, Rocket } from 'lucide-react';
import Image from 'next/image';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsFeaturesOpen(false);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleFeatures = () => {
        setIsFeaturesOpen(!isFeaturesOpen);
    };

    // Features dropdown items
    const featureItems = [
        {
            icon: <Sparkles className="w-5 h-5 text-orange-500" />,
            title: 'AI Vendor Recommendations',
            description: 'Smart matches based on event type & budget',
            phase: 'Phase 4'
        },
        {
            icon: <Zap className="w-5 h-5 text-orange-400" />,
            title: 'Dynamic Pricing',
            description: 'AI-powered pricing suggestions',
            phase: 'Phase 4'
        },
        {
            icon: <Calendar className="w-5 h-5 text-purple-500" />,
            title: 'Smart Availability',
            description: 'Real-time vendor availability matching',
            phase: 'Phase 3'
        },
        {
            icon: <CreditCard className="w-5 h-5 text-orange-600" />,
            title: 'Automated Contracts',
            description: 'Auto-generated contracts & invoices',
            phase: 'Phase 3'
        },
        {
            icon: <Globe className="w-5 h-5 text-purple-400" />,
            title: 'Multi-Country Payments',
            description: 'Global payment processing',
            phase: 'Phase 5'
        },
        {
            icon: <Smartphone className="w-5 h-5 text-orange-500" />,
            title: 'Mobile App',
            description: 'React Native cross-platform',
            phase: 'Phase 5'
        },
        {
            icon: <Palette className="w-5 h-5 text-purple-500" />,
            title: 'White-label Solutions',
            description: 'Custom branding for corporates',
            phase: 'Phase 5'
        },
        {
            icon: <BarChart className="w-5 h-5 text-orange-400" />,
            title: 'Advanced Analytics',
            description: 'Detailed vendor & platform insights',
            phase: 'Phase 5'
        },
        {
            icon: <Users className="w-5 h-5 text-purple-400" />,
            title: 'Subscription Logic',
            description: 'Flexible vendor subscription plans',
            phase: 'Phase 2'
        }
    ];

    const roadmapItems = [
        { phase: 'Phase 1', title: 'Foundation (MVP Launch)', status: 'current' },
        { phase: 'Phase 2', title: 'Payments & Subscriptions', status: 'upcoming' },
        { phase: 'Phase 3', title: 'Automation', status: 'upcoming' },
        { phase: 'Phase 4', title: 'AI Features', status: 'upcoming' },
        { phase: 'Phase 5', title: 'Mobile & Enterprise', status: 'upcoming' }
    ];

    return (
        <>
            {/* Navbar */}
            <nav className={`font-dm-sans fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-orange-100' : 'bg-white/95 backdrop-blur-sm'}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="flex flex-col">
                                    <Image src="/images/events-asap-logo.png" alt="EventASAP" width={100} height={100} />
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">

                            {/* Features Dropdown */}
                            <div className="relative group">
                                <button
                                    className="flex items-center space-x-1 text-gray-800 hover:text-orange-600 transition-all duration-300 font-medium text-sm tracking-wide"
                                    onClick={toggleFeatures}
                                >
                                    <span className="flex items-center gap-1">
                                        <Zap className="w-4 h-4" />
                                        Features
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isFeaturesOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Features Mega Menu */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-[900px] bg-white rounded-2xl shadow-2xl border border-orange-100/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform-gpu translate-y-2 group-hover:translate-y-0">
                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                <span className="bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                                                    Platform Features
                                                </span>
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Rocket className="w-4 h-4 text-orange-500" />
                                                <span className="text-gray-600">Rolling Release Roadmap</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-8">

                                            {/* Column 1 - Core AI & Automation */}
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100 text-lg">
                                                    <span className="text-orange-600">AI &</span> Automation
                                                </h4>
                                                <div className="space-y-4">
                                                    {featureItems.slice(0, 3).map((feature, index) => (
                                                        <div key={index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 transition-all duration-300 group/feature">
                                                            <div className="flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform">
                                                                {feature.icon}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <h4 className="font-semibold text-gray-900 group-hover/feature:text-orange-700 transition-colors">
                                                                        {feature.title}
                                                                    </h4>
                                                                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-orange-100 to-purple-100 text-gray-700 rounded-full font-medium">
                                                                        {feature.phase}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Column 2 - Business Tools */}
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b border-purple-100 text-lg">
                                                    <span className="text-purple-600">Business</span> Tools
                                                </h4>
                                                <div className="space-y-4">
                                                    {featureItems.slice(3, 6).map((feature, index) => (
                                                        <div key={index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 transition-all duration-300 group/feature">
                                                            <div className="flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform">
                                                                {feature.icon}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <h4 className="font-semibold text-gray-900 group-hover/feature:text-purple-700 transition-colors">
                                                                        {feature.title}
                                                                    </h4>
                                                                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-orange-100 to-purple-100 text-gray-700 rounded-full font-medium">
                                                                        {feature.phase}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Column 3 - Expansion & Analytics */}
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100 text-lg">
                                                    <span className="text-orange-600">Growth</span> & Scale
                                                </h4>
                                                <div className="space-y-4 mb-8">
                                                    {featureItems.slice(6).map((feature, index) => (
                                                        <div key={index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 transition-all duration-300 group/feature">
                                                            <div className="flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform">
                                                                {feature.icon}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <h4 className="font-semibold text-gray-900 group-hover/feature:text-orange-700 transition-colors">
                                                                        {feature.title}
                                                                    </h4>
                                                                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-orange-100 to-purple-100 text-gray-700 rounded-full font-medium">
                                                                        {feature.phase}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Roadmap Preview */}
                                                <div className="pt-4 border-t border-gray-200">
                                                    <h4 className="font-semibold text-gray-900 mb-3">Development Timeline</h4>
                                                    <div className="flex space-x-1">
                                                        {roadmapItems.map((item, index) => (
                                                            <div key={index} className="flex-1 text-center group/phase">
                                                                <div className={`text-xs font-bold px-2 py-1.5 rounded-t-lg transition-all duration-300 ${item.status === 'current'
                                                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                                                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 group-hover/phase:from-orange-50 group-hover/phase:to-purple-50'
                                                                    }`}>
                                                                    {item.phase}
                                                                </div>
                                                                <div className={`text-xs px-2 py-2.5 rounded-b-lg font-medium ${item.status === 'current'
                                                                    ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-md'
                                                                    : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 group-hover/phase:from-white group-hover/phase:to-white group-hover/phase:text-orange-700'
                                                                    }`}>
                                                                    {item.title.split(' ')[0]}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Other Navigation Links */}
                            <Link
                                href="/vendors"
                                className="text-gray-800 hover:text-orange-600 transition-all duration-300 font-medium text-sm tracking-wide hover:scale-105 active:scale-95"
                            >
                                For Vendors
                            </Link>
                            <Link
                                href="/clients"
                                className="text-gray-800 hover:text-purple-600 transition-all duration-300 font-medium text-sm tracking-wide hover:scale-105 active:scale-95"
                            >
                                For Clients
                            </Link>
                            <Link
                                href="/pricing"
                                className="text-gray-800 hover:text-orange-600 transition-all duration-300 font-medium text-sm tracking-wide hover:scale-105 active:scale-95"
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/about"
                                className="text-gray-800 hover:text-purple-600 transition-all duration-300 font-medium text-sm tracking-wide hover:scale-105 active:scale-95"
                            >
                                About
                            </Link>
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="px-4 py-2 text-gray-800 hover:text-orange-600 transition-all duration-300 font-medium text-sm tracking-wide hover:scale-105 active:scale-95"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold tracking-wide hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-200"
                            >
                                Get Started
                                <span className="ml-2 text-xs font-normal opacity-90">→</span>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden text-gray-800 hover:text-orange-600 focus:outline-none transition-colors duration-300"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6 hover:scale-110 transition-transform" />
                            ) : (
                                <Menu className="w-6 h-6 hover:scale-110 transition-transform" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-gradient-to-b from-white to-orange-50/30 border-t border-orange-100 shadow-2xl">
                        <div className="px-4 py-8 space-y-6">

                            {/* Mobile Features Accordion */}
                            <div className="border border-orange-200 rounded-2xl bg-white/80 backdrop-blur-sm">
                                <button
                                    onClick={toggleFeatures}
                                    className="w-full px-5 py-4 flex justify-between items-center text-left font-bold text-gray-900 hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 transition-all duration-300 rounded-2xl"
                                >
                                    <span className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-orange-500" />
                                        Platform Features
                                    </span>
                                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isFeaturesOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isFeaturesOpen && (
                                    <div className="px-4 pb-6 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            {featureItems.map((feature, index) => (
                                                <div key={index} className="bg-gradient-to-r from-white to-orange-50/50 border border-orange-100 rounded-xl p-3 hover:shadow-md transition-all duration-300">
                                                    <div className="flex items-start space-x-2">
                                                        <div className="flex-shrink-0 mt-1">{feature.icon}</div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-semibold text-gray-900 text-xs leading-tight">
                                                                    {feature.title}
                                                                </h4>
                                                            </div>
                                                            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-gradient-to-r from-orange-100 to-purple-100 text-gray-700 rounded-full font-medium">
                                                                {feature.phase}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Mobile Roadmap */}
                                        <div className="mt-4 pt-4 border-t border-orange-100">
                                            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Development Roadmap</h4>
                                            <div className="flex overflow-x-auto pb-2 space-x-2">
                                                {roadmapItems.map((item, index) => (
                                                    <div key={index} className="flex-shrink-0 w-24 text-center">
                                                        <div className={`text-xs font-bold px-2 py-1.5 rounded-t-lg ${item.status === 'current'
                                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600'
                                                            }`}>
                                                            {item.phase}
                                                        </div>
                                                        <div className={`text-xs px-2 py-2 rounded-b-lg font-medium ${item.status === 'current'
                                                            ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white'
                                                            : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700'
                                                            }`}>
                                                            {item.title.split(' ')[0]}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Navigation Links */}
                            <div className="space-y-2">
                                <Link
                                    href="/vendors"
                                    className="block px-5 py-3 text-gray-800 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 rounded-xl font-medium transition-all duration-300 border border-transparent hover:border-orange-200"
                                >
                                    For Vendors
                                </Link>
                                <Link
                                    href="/clients"
                                    className="block px-5 py-3 text-gray-800 hover:text-purple-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 rounded-xl font-medium transition-all duration-300 border border-transparent hover:border-purple-200"
                                >
                                    For Clients
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="block px-5 py-3 text-gray-800 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 rounded-xl font-medium transition-all duration-300 border border-transparent hover:border-orange-200"
                                >
                                    Pricing
                                </Link>
                                <Link
                                    href="/about"
                                    className="block px-5 py-3 text-gray-800 hover:text-purple-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 rounded-xl font-medium transition-all duration-300 border border-transparent hover:border-purple-200"
                                >
                                    About
                                </Link>
                            </div>

                            {/* Mobile CTA Buttons */}
                            <div className="pt-4 space-y-3 border-t border-orange-100">
                                <Link
                                    href="/login"
                                    className="block w-full text-center px-5 py-3 border border-orange-200 text-gray-800 rounded-xl font-medium hover:border-orange-400 hover:text-orange-600 transition-all duration-300 bg-white"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="block w-full text-center px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold tracking-wide hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-md"
                                >
                                    Get Started Free
                                    <span className="ml-2 text-xs font-normal opacity-90">→</span>
                                </Link>
                            </div>

                            {/* Tech Stack Badges */}
                            <div className="pt-4 border-t border-orange-100">
                                <p className="text-xs text-gray-500 mb-2 font-medium">Powered by:</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-full border border-gray-800">Next.js</span>
                                    <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full">PostgreSQL</span>
                                    <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full">Stripe</span>
                                    <span className="px-3 py-1.5 bg-gradient-to-r from-orange-400 to-purple-400 text-white text-xs font-bold rounded-full">Vercel</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Spacer for fixed navbar */}
            <div className="h-16"></div>
        </>
    );
};

export default Header;