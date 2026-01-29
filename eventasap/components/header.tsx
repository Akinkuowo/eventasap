// components/LandingMenu.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Menu,
    X,
    ChevronDown,
    LayoutDashboard,
    Settings,
    LogOut,
    User,
    Bell
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Header = () => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

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

    // Check for auth status
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsUserMenuOpen(false);
        router.push('/');
    };

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

                        {/* Right Actions */}
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center space-x-3 p-1.5 rounded-full border border-gray-100 bg-white hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
                                            {user.firstName?.[0] || 'U'}
                                        </div>
                                        <div className="hidden lg:block text-left pr-2">
                                            <p className="text-xs font-bold text-gray-900 leading-tight">{user.firstName} {user.lastName?.[0]}.</p>
                                            <p className="text-[10px] text-gray-500 font-medium">{user.role || 'Member'}</p>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* User Dropdown */}
                                    {isUserMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-[55]" onClick={() => setIsUserMenuOpen(false)}></div>
                                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-orange-50 py-2 z-[60] animate-in fade-in zoom-in duration-200">
                                                <div className="px-4 py-3 border-b border-gray-50">
                                                    <p className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>
                                                <div className="p-2 space-y-1">
                                                    <Link
                                                        href="/dashboard"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors group cursor-pointer"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                                                        <span className="text-sm font-medium">Dashboard</span>
                                                    </Link>
                                                    <Link
                                                        href="/settings"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors group cursor-pointer"
                                                    >
                                                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                                                        <span className="text-sm font-medium">Settings</span>
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors group cursor-pointer"
                                                    >
                                                        <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500" />
                                                        <span className="text-sm font-medium">Logout</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center space-x-3">
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-gray-800 hover:text-orange-600 transition-all duration-300 font-medium text-sm tracking-wide cursor-pointer"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold tracking-wide hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg cursor-pointer"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={toggleMenu}
                                className="md:hidden p-2 text-gray-800 hover:text-orange-600 focus:outline-none transition-colors cursor-pointer"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-orange-100 shadow-2xl animate-in slide-in-from-top duration-300">
                        <div className="px-4 py-6 space-y-6">

                            {/* User Section in Mobile */}
                            {user && (
                                <div className="p-4 bg-orange-50 rounded-2xl flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                                        {user.firstName?.[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Link
                                    href="/vendors"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-5 py-3 text-gray-800 hover:text-orange-600 hover:bg-orange-50 rounded-xl font-medium transition-all"
                                >
                                    For Vendors
                                </Link>
                                <Link
                                    href="/clients"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-5 py-3 text-gray-800 hover:text-purple-600 hover:bg-orange-50 rounded-xl font-medium transition-all"
                                >
                                    For Clients
                                </Link>
                                <Link
                                    href="/pricing"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-5 py-3 text-gray-800 hover:text-orange-600 hover:bg-orange-50 rounded-xl font-medium transition-all"
                                >
                                    Pricing
                                </Link>
                                <Link
                                    href="/about"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-5 py-3 text-gray-800 hover:text-purple-600 hover:bg-orange-50 rounded-xl font-medium transition-all"
                                >
                                    About
                                </Link>
                            </div>

                            <div className="pt-4 space-y-3 border-t border-orange-100">
                                {user ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block w-full text-center px-5 py-3 bg-white border border-orange-200 text-gray-800 rounded-xl font-medium"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-center px-5 py-3 bg-red-600 text-white rounded-xl font-bold"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block w-full text-center px-5 py-3 border border-orange-200 text-gray-800 rounded-xl font-medium bg-white"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/signup"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block w-full text-center px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-md"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
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