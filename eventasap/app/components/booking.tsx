// app/dashboard/bookings/page.tsx
'use client';

import React from 'react';
import DashboardLayout from './dashboard/dashboardLayout';
import { Calendar, Filter, Download, Plus, Search } from 'lucide-react';

export default function BookingsPage() {
    return (

        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
                    <p className="text-gray-600">Manage your event bookings and requests</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        New Booking
                    </button>
                </div>
            </div>

            {/* Bookings content will go here */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                    <p className="text-gray-600 mb-4">Start accepting bookings by promoting your services</p>
                    <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300">
                        Promote Services
                    </button>
                </div>
            </div>
        </div>
    );
}