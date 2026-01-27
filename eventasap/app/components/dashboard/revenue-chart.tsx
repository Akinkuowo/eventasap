'use client';

import React from 'react';

const RevenueChart: React.FC = () => {
    // Dummy data for the last 6 months
    const data = [
        { month: 'Aug', revenue: 4200 },
        { month: 'Sep', revenue: 5800 },
        { month: 'Oct', revenue: 7100 },
        { month: 'Nov', revenue: 6400 },
        { month: 'Dec', revenue: 9200 },
        { month: 'Jan', revenue: 12450 },
    ];

    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const chartHeight = 200;
    const chartWidth = 600;
    const padding = 40;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (chartWidth - padding * 2) + padding;
        const y = chartHeight - (d.revenue / maxRevenue) * (chartHeight - padding * 2) - padding;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-gray-900">Revenue Trends</h3>
                    <p className="text-sm text-gray-500 font-medium">Monthly revenue growth overview</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        +24% vs last year
                    </span>
                    <select className="text-xs font-bold bg-gray-50 border-none rounded-lg focus:ring-0 cursor-pointer">
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                    </select>
                </div>
            </div>

            <div className="relative h-[250px] w-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                        <line
                            key={i}
                            x1={padding}
                            y1={chartHeight - p * (chartHeight - padding * 2) - padding}
                            x2={chartWidth - padding}
                            y2={chartHeight - p * (chartHeight - padding * 2) - padding}
                            stroke="#f3f4f6"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Gradient Area */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d={`M${padding},${chartHeight - padding} ${points} L${chartWidth - padding},${chartHeight - padding} Z`}
                        fill="url(#chartGradient)"
                    />

                    {/* Main Line */}
                    <polyline
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        className="drop-shadow-lg"
                    />

                    {/* Data Points */}
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * (chartWidth - padding * 2) + padding;
                        const y = chartHeight - (d.revenue / maxRevenue) * (chartHeight - padding * 2) - padding;
                        return (
                            <g key={i} className="group cursor-pointer">
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="6"
                                    fill="#f97316"
                                    stroke="white"
                                    strokeWidth="2"
                                    className="hover:r-8 transition-all"
                                />
                                <text
                                    x={x}
                                    y={chartHeight - 10}
                                    textAnchor="middle"
                                    className="text-[10px] fill-gray-400 font-bold"
                                >
                                    {d.month}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center space-x-6">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-xs font-bold text-gray-500">Revenue (GBP)</span>
                </div>
            </div>
        </div>
    );
};

export default RevenueChart;
