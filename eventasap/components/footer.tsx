'use client';

import React from 'react';
import Link from 'next/link';
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    ChevronDown,
    Apple,
    Play
} from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#1a1a1a] text-white pt-20 pb-10">
            <div className="container mx-auto px-4">
                {/* Top Section: Subscribe */}
                <div className="mb-16 border-b border-white/5 pb-16">
                    <div className="max-w-xl">
                        <h3 className="text-2xl font-bold mb-6">Subscribe</h3>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-gray-500"
                            />
                            <button className="absolute right-2 top-2 bottom-2 px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all active:scale-95">
                                Join Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 border-b border-white/5 pb-20">
                    {/* Left Columns - Navigation */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-lg font-bold">About</h4>
                        <ul className="space-y-4">
                            <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/signup?role=vendor" className="text-gray-400 hover:text-white transition-colors">Become a Seller</Link></li>
                            <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
                            <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <h4 className="text-lg font-bold">Categories</h4>
                        <ul className="space-y-4">
                            <li><Link href="/clients?category=Event Services" className="text-gray-400 hover:text-white transition-colors">Event Services</Link></li>
                            <li><Link href="/clients?category=Speakers" className="text-gray-400 hover:text-white transition-colors">Speakers, MCs and Hosts</Link></li>
                            <li><Link href="/clients?category=Photography" className="text-gray-400 hover:text-white transition-colors">Photography</Link></li>
                            <li><Link href="/clients?category=Entertainment" className="text-gray-400 hover:text-white transition-colors">DJs & Live Entertainment</Link></li>
                            <li><Link href="/clients?category=Staffing" className="text-gray-400 hover:text-white transition-colors">Event Staffing and Security</Link></li>
                            <li><Link href="/clients?category=Rentals" className="text-gray-400 hover:text-white transition-colors">Event Rentals</Link></li>
                            <li><Link href="/clients?category=Wedding" className="text-gray-400 hover:text-white transition-colors">Wedding, Bridal & Fashion Services</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-lg font-bold">Support</h4>
                        <ul className="space-y-4">
                            <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help & Support</Link></li>
                            <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
                            <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Right Column - Brand & Apps */}
                    <div className="lg:col-span-5 space-y-12 lg:pl-12">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-xl italic">ea</div>
                                <span className="text-2xl font-black tracking-tighter uppercase italic">Event ASAP</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">Toll Free Customer Care</p>
                                <p className="text-xl font-bold">+(44) 7909026292</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">Need live support?</p>
                                <p className="text-xl font-bold">hi@eventasap.com</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="font-bold">Apps</p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="#" className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl transition-all group">
                                    <Apple className="w-6 h-6" />
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Download on the</p>
                                        <p className="font-bold text-sm">Apple Store</p>
                                    </div>
                                </Link>
                                <Link href="#" className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl transition-all group">
                                    <Play className="w-6 h-6 fill-current" />
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Get it on</p>
                                        <p className="font-bold text-sm">Google Play</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="font-bold">Follow Us</p>
                            <div className="flex space-x-6">
                                <Link href="#" className="p-2 text-gray-400 hover:text-white transition-colors"><Facebook className="w-6 h-6" /></Link>
                                <Link href="#" className="p-2 text-gray-400 hover:text-white transition-colors"><Twitter className="w-6 h-6" /></Link>
                                <Link href="#" className="p-2 text-gray-400 hover:text-white transition-colors"><Instagram className="w-6 h-6" /></Link>
                                <Link href="#" className="p-2 text-gray-400 hover:text-white transition-colors"><Linkedin className="w-6 h-6" /></Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-gray-500 text-sm font-medium">
                        © Eventasap. 2025. All rights reserved.
                    </p>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
                        <span>English</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
