'use client';

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    BookOpen,
    Mail,
    Phone,
    FileText,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function HelpSupportPage() {
    const supportOptions = [
        {
            icon: BookOpen,
            title: "Knowledge Base",
            description: "Browse our comprehensive FAQs and guides to find answers instantly.",
            link: "/faq",
            linkText: "Browse Articles",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            hoverBorder: "hover:border-blue-200"
        },
        {
            icon: MessageSquare,
            title: "Live Chat",
            description: "Chat with our support team in real-time. Available 24/7 for urgent issues.",
            link: "#",
            linkText: "Start Chat",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            hoverBorder: "hover:border-orange-200"
        },
        {
            icon: Mail,
            title: "Email Support",
            description: "Send us a detailed message. We typically respond within 12-24 hours.",
            link: "mailto:support@eventasap.com",
            linkText: "Send Email",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            hoverBorder: "hover:border-purple-200"
        },
        {
            icon: Phone,
            title: "Phone Support",
            description: "Speak directly with a customer success manager for complex vendor inquiries.",
            link: "tel:+447909026292",
            linkText: "Call Us",
            color: "text-green-600",
            bgColor: "bg-green-50",
            hoverBorder: "hover:border-green-200"
        }
    ];

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-extrabold tracking-tight"
                        >
                            How can we help you?
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-orange-100 font-medium"
                        >
                            Whether you're a client planning an event or a vendor managing bookings, our support team is here for you.
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* Support Options Grid */}
            <div className="flex-1 container mx-auto px-4 py-16 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {supportOptions.map((option, index) => {
                        const Icon = option.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition-all duration-300 ${option.hoverBorder} group flex flex-col h-full`}
                            >
                                <div className={`w-14 h-14 rounded-2xl ${option.bgColor} flex items-center justify-center mb-6`}>
                                    <Icon className={`w-7 h-7 ${option.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{option.title}</h3>
                                <p className="text-gray-500 mb-8 flex-1">{option.description}</p>

                                <Link
                                    href={option.link}
                                    className={`inline-flex items-center font-bold ${option.color} group-hover:underline`}
                                >
                                    {option.linkText}
                                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Additional Resources */}
                <div className="max-w-5xl mx-auto mt-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Additional Resources</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/terms" className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            Terms of Service
                        </Link>
                        <Link href="/privacy" className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
