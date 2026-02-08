'use client';

import React, { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
    Check,
    Rocket,
    ArrowRight,
    Star,
    Quote,
    Zap,
    Users,
    CheckCircle2,
    BarChart3,
    HeartHandshake,
    ChevronDown
} from 'lucide-react';

const stats = [
    { label: 'Total Freelancers', value: '890M' },
    { label: 'Positive Reviews', value: '750M' },
    { label: 'Orders Received', value: '98M' },
    { label: 'Projects Completed', value: '336M' }
];

const testimonials = [
    {
        quote: "EventASAP completely transformed my business! As a photographer, I used to struggle with getting clients, but after listing my services on EventASAP, my bookings have doubled! The secure payment system also gives me peace of mind. Highly recommended!",
        name: "David O.",
        role: "Professional Photographer",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    },
    {
        quote: "The platform's AI-driven matching saved me weeks of planning. I found the perfect caterer and DJ for our corporate gala in just under an hour. The transparency and ease of use are unmatched in the industry.",
        name: "Sarah J.",
        role: "Event Coordinator",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    },
    {
        quote: "As a vendor, the business growth support and marketing insights provided by EventASAP have been invaluable. It's not just a marketplace; it's a partner in my success. My revenue has increased by 40% year-over-year.",
        name: "Marcus T.",
        role: "Catering Specialist",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
    },
    {
        quote: "Booking our wedding services was stress-free thanks to EventASAP. We could compare packages, read verified reviews, and secure everything with a safe payment plan. It made our special day truly perfect.",
        name: "Elena R.",
        role: "Happy Client",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    },
    {
        quote: "I love the direct communication and escrow-like payment protection. It ensures both parties are accountable. The support team is also incredibly responsive and helpful whenever I have questions.",
        name: "James L.",
        role: "Independent DJ",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
    }
];

const AboutPage = () => {
    const [activeTestimonial, setActiveTestimonial] = useState(2); // David O. is middle in reference

    return (
        <main className="min-h-screen bg-white font-dm-sans">
            <Header />

            {/* Hero / About Introduction Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#00BFFF] mb-8">About</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                At <strong>EventASAP (Event As Soon As Possible)</strong>, we believe booking event services should be <span className="font-bold">fast, easy, and stress-free</span>. Pick a service, check packages, pay and inform the service provider the event date, time and place. That's why we've built a <span className="font-bold text-gray-900">smart digital marketplace</span> that connects event service providers with clients in just a few clicks. Whether you're an <span className="font-bold">event professional</span> looking to grow your business or an <span className="font-bold">event organizer</span> searching for reliable services, EventASAP makes the process seamless.
                            </p>
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                <strong>EventASAP</strong> is a <span className="font-bold">digital marketplace and community</span> designed to <span className="font-bold">connect event service providers with clients quickly and seamlessly</span>. Whether you're a <span className="font-bold text-gray-900">photographer, caterer, DJ, decorator, or any event professional</span>, EventASAP helps you gain <span className="font-bold">visibility, secure bookings, and grow your business effortlessly.</span>
                            </p>
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                For <span className="font-bold text-gray-900">event organizers and individuals</span>, EventASAP simplifies the process of <span className="font-bold text-gray-900">finding and booking trusted event services</span>—whether you're planning a <span className="font-bold">wedding, birthday, corporate event, or any special occasion.</span>
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl h-64">
                                <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop" alt="Camera" className="w-full h-full object-cover" />
                            </div>
                            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl h-80 -mt-16">
                                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&h=600&fit=crop" alt="Event" className="w-full h-full object-cover" />
                            </div>
                            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl h-64 -mt-16">
                                <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=500&fit=crop" alt="Food" className="w-full h-full object-cover" />
                            </div>
                            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl h-64 -mt-4">
                                <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop" alt="DJ" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Revolutionizing Section */}
            <section className="py-24 bg-[#F8F9F8]">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold text-[#00BFFF] leading-tight">
                                Revolutionizing Event Planning with AI and a Premier Service Marketplace
                            </h2>
                            <div className="space-y-6">
                                <p className="text-gray-700 leading-relaxed">
                                    We are on a mission to <span className="font-bold text-gray-900">revolutionize the event industry</span> by bridging the gap between talented event service providers and individuals or businesses planning events. Our platform is designed to <span className="font-bold text-gray-900">boost visibility, streamline bookings, and ensure secure payments</span> for both parties.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <span className="text-xl">🖌️</span>
                                        <p className="text-gray-700"><span className="font-bold">Event Service Providers</span> — DJs, caterers, planners, photographers, decorators, etc.</p>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <span className="text-xl">🎉</span>
                                        <p className="text-gray-700"><span className="font-bold">Event Organizers & Individuals</span> — Anyone planning an event looking for seamless booking and reliable services.</p>
                                    </div>
                                </div>
                                <p className="text-gray-700">
                                    EventASAP is <span className="font-bold">revolutionizing the event industry</span>—making it faster, easier, and more profitable for everyone involved. 🚀
                                </p>
                                <div className="space-y-4 pt-4">
                                    {[
                                        { title: 'Marketplace for Event Services', text: 'List and book services easily' },
                                        { title: 'Smart Payment System', text: 'Secure 100% payment upfront, with a structured release system (70% upfront, 30% on completion)' },
                                        { title: 'Free & Paid Listings', text: 'Get featured on the homepage and boost visibility' },
                                        { title: 'RSVP & Online Ticketing', text: 'Simplify guest management' },
                                        { title: 'Business Growth Support', text: 'Marketing, promotions, and insights to help service providers scale' }
                                    ].map((item, id) => (
                                        <div key={id} className="flex items-start space-x-3">
                                            <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                            <p className="text-sm font-medium text-gray-700">
                                                <span className="font-bold text-gray-900">{item.title}</span> – {item.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <button className="mt-8 px-10 py-4 bg-white border-2 border-[#00DE9C] text-[#00DE9C] rounded-2xl font-bold hover:bg-[#00DE9C] hover:text-white transition-all inline-flex items-center space-x-2 group">
                                    <span>Get Started</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="rounded-[3rem] overflow-hidden shadow-2xl aspect-[4/5] relative z-10">
                                <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=1000&fit=crop" alt="Planning" className="w-full h-full object-cover" />
                            </div>
                            {/* Decorative bubbles as seen in screenshot */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00BFFF]/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#F8F9F8] rounded-full border border-gray-100 flex items-center justify-center p-6 shadow-xl z-20">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 leading-tight">Pick & Pay</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Simple Booking</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-t border-gray-100">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, id) => (
                            <div key={id} className="text-center space-y-2">
                                <div className="text-4xl md:text-5xl font-black text-gray-900">{stat.value}</div>
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto max-w-4xl px-4 text-center">
                    <h2 className="text-[#00BFFF] text-4xl md:text-5xl font-bold mb-4">Testimonials</h2>
                    <p className="text-gray-500 font-medium mb-16 uppercase tracking-wider text-sm">Get to know why this is the best platform.</p>

                    <div className="relative mb-20 px-8">
                        <Quote className="w-16 h-16 text-[#00DE9C]/10 absolute -top-8 -left-2 rotate-180" />
                        <div className="relative z-10 transition-all duration-500">
                            <p className="text-xl md:text-3xl font-bold text-gray-800 italic leading-relaxed">
                                "{testimonials[activeTestimonial].quote}"
                            </p>
                            <div className="mt-10">
                                <p className="text-lg font-bold text-gray-900">{testimonials[activeTestimonial].name}</p>
                                <p className="text-sm font-medium text-gray-400">{testimonials[activeTestimonial].role}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center items-center space-x-6 md:space-x-8">
                        {testimonials.map((t, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTestimonial(idx)}
                                className={`relative transition-all duration-300 focus:outline-none ${activeTestimonial === idx
                                    ? 'w-16 h-16 ring-4 ring-[#00DE9C] rounded-full p-1'
                                    : 'w-10 h-10 grayscale hover:grayscale-0 opacity-50 hover:opacity-100'
                                    }`}
                            >
                                <img
                                    src={t.image}
                                    alt={t.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Floating scroll bottom button indicator */}
                <div className="absolute bottom-10 right-10">
                    <button className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-[#00BFFF] transition-colors">
                        <ChevronDown className="w-5 h-5 rotate-180" />
                    </button>
                </div>
            </section>

            <Footer />
        </main>
    );
}

export default AboutPage;
