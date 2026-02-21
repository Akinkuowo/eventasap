'use client';

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { motion } from 'framer-motion';

export default function TermsOfServicePage() {
    const lastUpdated = "August 15, 2026";

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            {/* Header Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
                    >
                        Terms of Service
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 font-medium"
                    >
                        Last updated: {lastUpdated}
                    </motion.p>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg prose-orange max-w-none"
                >
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to EventASAP. These Terms of Service ("Terms") govern your access to and use of the EventASAP website, services, and applications (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
                    </p>

                    <h2>2. User Accounts</h2>
                    <p>
                        You must be at least 18 years old to create an account. You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                    </p>

                    <h2>3. Vendor Responsibilities</h2>
                    <p>
                        Vendors must provide accurate information regarding their services, pricing, and availability. Vendors are solely responsible for fulfilling the services as described in their packages and delivering a professional experience to the Clients. EventASAP reserves the right to suspend or terminate Vendor accounts that repeatedly fail to meet client expectations or violate these Terms.
                    </p>

                    <h2>4. Client Responsibilities</h2>
                    <p>
                        Clients agree to pay for services booked through the EventASAP platform. Cancellations and refunds are subject to the specific policy set by the individual Vendor at the time of booking. Clients must provide accurate event details to ensure Vendors can deliver their services effectively.
                    </p>

                    <h2>5. Payments and Fees</h2>
                    <p>
                        EventASAP uses Stripe for secure payment processing. A platform fee is applied to successful bookings. We reserve the right to change our fee structure at any time, with prior notice provided to users.
                    </p>

                    <h2>6. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are owned by EventASAP and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                    </p>

                    <h2>7. Limitation of Liability</h2>
                    <p>
                        EventASAP acts as a marketplace connecting Clients and Vendors. We are not a party to the agreements between Clients and Vendors. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service or any interactions between users.
                    </p>

                    <h2>8. Changes to Terms</h2>
                    <p>
                        We may modify these Terms at any time. If we make material changes, we will notify you via email or through the Service. Your continued use of the Service after changes become effective constitutes your acceptance of the revised Terms.
                    </p>

                    <h2>9. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at <a href="mailto:legal@eventasap.com" className="text-orange-600 hover:underline">legal@eventasap.com</a>.
                    </p>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
