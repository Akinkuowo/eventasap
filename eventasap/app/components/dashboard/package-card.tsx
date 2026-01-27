'use client';

import React from 'react';
import {
    Package,
    Clock,
    CheckCircle,
    Edit,
    Trash2,
    ToggleLeft,
    ToggleRight,
    BritishPound
} from 'lucide-react';

interface ServicePackage {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    duration: number;
    inclusions: string[];
    isActive: boolean;
    minBooking?: number;
    maxBooking?: number;
    preparationTime?: number;
}

interface PackageCardProps {
    pkg: ServicePackage;
    onEdit: (pkg: ServicePackage) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (pkg: ServicePackage) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onEdit, onDelete, onToggleStatus }) => {
    return (
        <div className={`bg-white rounded-xl border transition-all duration-200 ${pkg.isActive ? 'border-gray-200 hover:border-orange-300' : 'border-gray-100 opacity-75'}`}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${pkg.isActive ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{pkg.title}</h3>
                            <div className="flex items-center space-x-2 mt-0.5">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {pkg.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {pkg.duration} mins
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 flex items-center justify-end">
                            <BritishPound className="w-4 h-4 mr-0.5" />
                            {pkg.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{pkg.currency}</p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                    {pkg.description}
                </p>

                <div className="space-y-2 mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Inclusions</p>
                    <div className="grid grid-cols-1 gap-2">
                        {pkg.inclusions.slice(0, 3).map((inclusion, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                <span className="truncate">{inclusion}</span>
                            </div>
                        ))}
                        {pkg.inclusions.length > 3 && (
                            <p className="text-xs text-orange-600 font-medium pl-6">
                                + {pkg.inclusions.length - 3} more items
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onEdit(pkg)}
                            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit Package"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(pkg.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Package"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => onToggleStatus(pkg)}
                        className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pkg.isActive
                                ? 'text-gray-600 hover:bg-gray-100'
                                : 'text-orange-600 hover:bg-orange-50'
                            }`}
                    >
                        {pkg.isActive ? (
                            <>
                                <ToggleRight className="w-5 h-5 mr-2 text-green-500" />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <ToggleLeft className="w-5 h-5 mr-2" />
                                Activate
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PackageCard;
