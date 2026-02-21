'use client';

import React, { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, MessageSquare, HeadphonesIcon, HelpCircle, Mail } from 'lucide-react';
import Link from 'next/link';

const faqs = [
    {
        category: "General",
        id: "general",
        questions: [
            {
                q: "What is EventASAP?",
                a: "EventASAP is a premier marketplace connecting clients with top-tier event vendors, organizers, and professionals. Whether you're planning a wedding, corporate event, or a birthday party, you can find everything you need in one place."
            },
            {
                q: "How does the platform work?",
                a: "Clients can browse or search for vendors by category, location, and date. Vendors create profiles, list their service packages, and manage bookings and payments directly through our secure platform."
            },
            {
                q: "Is it free to create an account?",
                a: "Yes! Creating an account as a client to browse and book vendors is completely free. We also offer free basic profiles for vendors to list their services."
            }
        ]
    },
    {
        category: "Clients",
        id: "clients",
        questions: [
            {
                q: "How do I book a vendor?",
                a: "Find a vendor you like, view their service packages, and select the dates you need. You can send a booking request, which the vendor will review and approve. After approval, you can make a secure payment."
            },
            {
                q: "Are my payments secure?",
                a: "Absolutely. We use Stripe, a bank-level secure payment processor, to handle all transactions. Your payment information is never stored directly on our servers."
            },
            {
                q: "Can I cancel a booking?",
                a: "Cancellation policies vary by vendor. Please check the vendor's profile or specific package details for their cancellation and refund policy before booking."
            },
            {
                q: "What if I have an issue with a vendor?",
                a: "We encourage resolving issues directly with the vendor first. If you need further assistance, our dedicated support team is available 24/7 to help mediate and resolve any conflicts."
            }
        ]
    },
    {
        category: "Vendors",
        id: "vendors",
        questions: [
            {
                q: "How do I get paid?",
                a: "Once a booking is completed and the service is delivered, the funds are transferred securely to your linked bank account via Stripe. Payouts are typically processed automatically."
            },
            {
                q: "Can I list multiple service packages?",
                a: "Yes, you can create and manage multiple service packages with different price points, descriptions, and deliverables to cater to various client needs."
            },
            {
                q: "How do I verify my business?",
                a: "To build trust with clients, we require vendors to upload a proof of business document (like a license or registration). This can be easily done from your vendor dashboard."
            },
            {
                q: "Is there a fee to sell on EventASAP?",
                a: "EventASAP charges a transparent platform fee on successful bookings to cover payment processing, marketing, and platform maintenance. You only pay when you get booked."
            }
        ]
    }
];

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('general');
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const toggleQuestion = (id: string) => {
        setOpenIndex(openIndex === id ? null : id);
    };

    // Filter FAQs based on search
    const filteredFaqs = faqs.map(category => ({
        ...category,
        questions: category.questions.filter(faq =>
            faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    const activeQuestions = searchQuery
        ? filteredFaqs.flatMap(c => c.questions)
        : faqs.find(c => c.id === activeCategory)?.questions || [];

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-orange-600 to-purple-700 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6"
                        >
                            <HelpCircle className="w-8 h-8 text-white" />
                        </motion.div>
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
                            Search our knowledge base or browse categories below to find answers to common questions.
                        </motion.p>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative max-w-2xl mx-auto mt-8"
                        >
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for questions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500/30 text-lg shadow-xl"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 container mx-auto px-4 py-16 -mt-10 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">

                    {/* Sidebar Categories (Hide when searching) */}
                    {!searchQuery && (
                        <div className="lg:w-1/4">
                            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 sticky top-24">
                                <h3 className="font-bold text-gray-900 px-4 pt-2 pb-4 uppercase tracking-wider text-sm">Categories</h3>
                                <nav className="space-y-2">
                                    {faqs.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setActiveCategory(category.id)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all cursor-pointer font-medium ${activeCategory === category.id
                                                    ? 'bg-orange-50 text-orange-600'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            {category.category}
                                            {activeCategory === category.id && (
                                                <ChevronDown className="w-4 h-4 -rotate-90" />
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    )}

                    {/* FAQ List */}
                    <div className={`flex-1 ${searchQuery ? 'max-w-3xl mx-auto w-full' : ''}`}>
                        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">

                            {searchQuery && (
                                <div className="mb-8 pb-4 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Search results for "{searchQuery}"
                                    </h2>
                                    <p className="text-gray-500">
                                        Found {activeQuestions.length} matching questions
                                    </p>
                                </div>
                            )}

                            {!searchQuery && (
                                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                                    {faqs.find(c => c.id === activeCategory)?.category} FAQs
                                </h2>
                            )}

                            <div className="space-y-4">
                                <AnimatePresence>
                                    {activeQuestions.length > 0 ? (
                                        activeQuestions.map((faq, index) => {
                                            const id = `${faq.q}-${index}`;
                                            const isOpen = openIndex === id;
                                            return (
                                                <motion.div
                                                    key={id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-orange-200 bg-orange-50/30 shadow-md' : 'border-gray-100 bg-white hover:border-orange-200'
                                                        }`}
                                                >
                                                    <button
                                                        onClick={() => toggleQuestion(id)}
                                                        className="w-full flex items-center justify-between p-5 text-left cursor-pointer focus:outline-none"
                                                    >
                                                        <span className={`font-semibold pr-8 text-lg ${isOpen ? 'text-orange-700' : 'text-gray-900'}`}>
                                                            {faq.q}
                                                        </span>
                                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'bg-orange-100 -rotate-180' : 'bg-gray-50'}`}>
                                                            <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-orange-600' : 'text-gray-400'}`} />
                                                        </div>
                                                    </button>

                                                    <AnimatePresence>
                                                        {isOpen && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                            >
                                                                <div className="px-5 pb-5 text-gray-600 leading-relaxed">
                                                                    {faq.a}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">No results found</h3>
                                            <p className="text-gray-500">We couldn't find any FAQs matching your search.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Still need help CTA */}
                        <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-center text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-left">
                                    <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
                                    <p className="text-gray-400 font-medium">Can't find the answer you're looking for? Our team is here to help.</p>
                                </div>
                                <div className="flex gap-4 shrink-0">
                                    <Link href="/contact" className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-orange-50 transition-colors flex items-center gap-2">
                                        <Mail className="w-5 h-5" />
                                        Contact Us
                                    </Link>
                                    <Link href="/help" className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2">
                                        <HeadphonesIcon className="w-5 h-5" />
                                        Support Check
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
