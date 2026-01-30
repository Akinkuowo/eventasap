'use client';

import React from 'react';
import { motion } from 'framer-motion';

const brands = [
    { name: 'TechEvents', id: 1 },
    { name: 'GlobalGather', id: 2 },
    { name: 'CelebSync', id: 3 },
    { name: 'BrandBlast', id: 4 },
    { name: 'EliteVenue', id: 5 },
    { name: 'VibeMasters', id: 6 },
];

const TrustedBrands = () => {
    return (
        <section className="py-20 bg-gray-50/50 overflow-hidden border-t border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Trusted by leading companies</p>
                    <h2 className="text-2xl font-bold text-gray-900">Partnering with the world's best brands</h2>
                </div>

                <div className="relative">
                    {/* Gradient Fade Edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50/50 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50/50 to-transparent z-10 pointer-events-none"></div>

                    <div className="flex space-x-12 md:space-x-24 animate-marquee whitespace-nowrap items-center">
                        {[...brands, ...brands].map((brand, idx) => (
                            <div
                                key={`${brand.id}-${idx}`}
                                className="text-3xl md:text-4xl font-dm-sans font-black text-gray-300 hover:text-orange-500 transition-colors cursor-default select-none transition-all duration-300 hover:scale-110"
                            >
                                {brand.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: inline-flex;
                    animation: marquee 30s linear infinite;
                    width: max-content;
                }
                .relative:hover .animate-marquee {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
};

export default TrustedBrands;
