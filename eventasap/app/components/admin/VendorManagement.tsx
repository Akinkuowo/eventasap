'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Eye,
    MoreHorizontal,
    FileText,
    Mail,
    Phone,
    MapPin,
    AlertCircle,
    Shield,
    Calendar,
    ArrowUpRight,
    Loader2,
    User,
    Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Vendor {
    id: string;
    businessName: string;
    businessEmail: string;
    businessPhone: string;
    city: string;
    category: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    isVerified: boolean;
    businessProofUrl: string | null;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        createdAt: string;
    };
    updatedAt: string;
}

const VendorManagement = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL'>('PENDING');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Unified Action Modal State
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionInput, setActionInput] = useState('');
    const [activeAction, setActiveAction] = useState<'REJECT' | 'SUSPEND' | 'UNSUSPEND' | 'APPROVE' | null>(null);
    const [targetVendorId, setTargetVendorId] = useState<string | null>(null);

    useEffect(() => {
        fetchVendors();
    }, [activeTab]);

    const fetchVendors = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const endpoint = activeTab === 'PENDING'
                ? `${NEXT_PUBLIC_API_URL}/api/admin/vendors/pending`
                : `${NEXT_PUBLIC_API_URL}/api/admin/vendors/all`;

            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch vendors');
            const data = await response.json();
            setVendors(data.data.vendors);
        } catch (error) {
            toast.error('Error loading vendors');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = (vendorId: string) => {
        setTargetVendorId(vendorId);
        setActiveAction('APPROVE');
        setActionInput('');
        setIsActionModalOpen(true);
    };

    const handleReject = (vendorId: string) => {
        setTargetVendorId(vendorId);
        setActiveAction('REJECT');
        setActionInput('');
        setIsActionModalOpen(true);
    };

    const handleSuspend = (vendorId: string) => {
        setTargetVendorId(vendorId);
        setActiveAction('SUSPEND');
        setActionInput('');
        setIsActionModalOpen(true);
    };

    const handleUnsuspend = (vendorId: string) => {
        setTargetVendorId(vendorId);
        setActiveAction('UNSUSPEND');
        setActionInput('');
        setIsActionModalOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!targetVendorId || !activeAction) return;

        // Validation for actions requiring reasons
        if ((activeAction === 'REJECT' || activeAction === 'SUSPEND') && !actionInput.trim()) {
            toast.error('Please provide a reason');
            return;
        }

        setIsActionLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            let endpoint = '';
            let body = {};

            switch (activeAction) {
                case 'APPROVE':
                    endpoint = `${NEXT_PUBLIC_API_URL}/api/admin/vendors/${targetVendorId}/approve`;
                    body = { notes: 'Profile looks good and business proof verified.' };
                    break;
                case 'REJECT':
                    endpoint = `${NEXT_PUBLIC_API_URL}/api/admin/vendors/${targetVendorId}/reject`;
                    body = { reason: actionInput };
                    break;
                case 'SUSPEND':
                    endpoint = `${NEXT_PUBLIC_API_URL}/api/admin/vendors/${targetVendorId}/suspend`;
                    body = { reason: actionInput };
                    break;
                case 'UNSUSPEND':
                    endpoint = `${NEXT_PUBLIC_API_URL}/api/admin/vendors/${targetVendorId}/unsuspend`;
                    break;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error(`${activeAction} action failed`);

            const successMessages = {
                'APPROVE': 'Vendor approved successfully',
                'REJECT': 'Vendor profile rejected',
                'SUSPEND': 'Vendor account suspended',
                'UNSUSPEND': 'Vendor account reinstated'
            };

            toast.success(successMessages[activeAction]);
            fetchVendors();
            setIsActionModalOpen(false);
            setSelectedVendor(null);
        } catch (error) {
            toast.error(`Could not complete ${activeAction.toLowerCase()} action`);
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <div className="space-y-6">
            {/* Tabs & Search */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('PENDING')}
                        className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'PENDING' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pending Review
                    </button>
                    <button
                        onClick={() => setActiveTab('ALL')}
                        className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'ALL' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        All Vendors
                    </button>
                </div>

                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by business name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    />
                </div>
            </div>

            {/* Vendor List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Scanning vendor directory...</p>
                </div>
            ) : filteredVendors.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">No Vendors Found</p>
                    <p className="text-gray-400 text-sm mt-1">There are no vendors matching your current criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map((vendor) => (
                        <div
                            key={vendor.id}
                            className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-orange-50 transition-colors">
                                        <Briefcase className="w-6 h-6 text-slate-400 group-hover:text-orange-500" />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${vendor.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                        vendor.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                            vendor.status === 'SUSPENDED' ? 'bg-red-100 text-red-700 font-black italic' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {vendor.status}
                                    </span>
                                </div>

                                <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors uppercase truncate">
                                    {vendor.businessName}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium mb-4 flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {vendor.city}, UK
                                </p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-xs text-gray-600 font-medium">
                                        <User className="w-3 h-3 mr-2 text-gray-400" />
                                        {vendor.user.firstName} {vendor.user.lastName}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600 font-medium truncate">
                                        <Mail className="w-3 h-3 mr-2 text-gray-400" />
                                        {vendor.user.email}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedVendor(vendor)}
                                        className="flex-1 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all text-xs flex items-center justify-center"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Review Details
                                    </button>
                                    {vendor.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleApprove(vendor.id)}
                                            className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-100"
                                            title="Approve Vendor"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                    {vendor.status === 'SUSPENDED' && (
                                        <button
                                            onClick={() => handleUnsuspend(vendor.id)}
                                            className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
                                            title="Unsuspend Vendor"
                                        >
                                            <Shield className="w-4 h-4" />
                                        </button>
                                    )}
                                    {vendor.status === 'APPROVED' && (
                                        <button
                                            onClick={() => handleSuspend(vendor.id)}
                                            className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                                            title="Suspend Vendor"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Vendor Detail Modal */}
            {selectedVendor && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                        <button
                            onClick={() => setSelectedVendor(null)}
                            className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <XCircle className="w-6 h-6 text-gray-400" />
                        </button>

                        <div className="p-8">
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="p-4 bg-orange-100 rounded-[24px]">
                                    <Shield className="w-8 h-8 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase">{selectedVendor.businessName}</h2>
                                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Vendor Audit</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">Primary Contact</h4>
                                        <div className="p-6 bg-slate-50 rounded-[32px] space-y-3">
                                            <p className="text-sm font-black text-gray-900 uppercase">{selectedVendor.user.firstName} {selectedVendor.user.lastName}</p>
                                            <p className="text-xs text-gray-600 flex items-center">
                                                <Mail className="w-3 h-3 mr-2" /> {selectedVendor.user.email}
                                            </p>
                                            <p className="text-xs text-gray-600 flex items-center">
                                                <Phone className="w-3 h-3 mr-2" /> {selectedVendor.user.phoneNumber}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">Service Details</h4>
                                        <div className="p-6 bg-slate-50 rounded-[32px] space-y-3">
                                            <p className="text-xs font-bold text-gray-900 uppercase flex items-center justify-between">
                                                Category: <span className="bg-white px-3 py-1 rounded-full text-orange-600">{selectedVendor.category}</span>
                                            </p>
                                            <p className="text-xs font-bold text-gray-900 uppercase flex items-center justify-between">
                                                Location: <span className="text-gray-600">{selectedVendor.city}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">Business Proof</h4>
                                        <div className="p-6 bg-orange-50 border-2 border-orange-100 rounded-[32px] flex flex-col items-center justify-center text-center">
                                            {selectedVendor.businessProofUrl ? (
                                                <>
                                                    <FileText className="w-12 h-12 text-orange-600 mb-3" />
                                                    <p className="text-xs font-black text-gray-900 mb-4">LEGAL_PROOF_DOC.PDF</p>
                                                    <a
                                                        href={`${NEXT_PUBLIC_API_URL}${selectedVendor.businessProofUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-6 py-2 bg-white text-orange-600 font-black rounded-xl text-[10px] border border-orange-200 hover:shadow-lg transition-all"
                                                    >
                                                        VIEW DOCUMENT
                                                    </a>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No Document Provided</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">Admin Notes</h4>
                                        <textarea
                                            placeholder="Add private review notes..."
                                            className="w-full p-4 bg-slate-50 border-none rounded-[24px] text-xs h-24 focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {selectedVendor.status === 'PENDING' ? (
                                <div className="flex gap-4 border-t border-gray-100 pt-8">
                                    <button
                                        disabled={isActionLoading}
                                        onClick={() => handleReject(selectedVendor.id)}
                                        className="flex-1 py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all uppercase tracking-widest text-xs flex items-center justify-center"
                                    >
                                        {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                                        Reject Application
                                    </button>
                                    <button
                                        disabled={isActionLoading}
                                        onClick={() => handleApprove(selectedVendor.id)}
                                        className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl hover:shadow-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center"
                                    >
                                        {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                        Approve Vendor
                                    </button>
                                </div>
                            ) : selectedVendor.status === 'SUSPENDED' ? (
                                <div className="flex gap-4 border-t border-gray-100 pt-8">
                                    <button
                                        disabled={isActionLoading}
                                        onClick={() => handleUnsuspend(selectedVendor.id)}
                                        className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:shadow-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center"
                                    >
                                        {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                                        Lift Suspension
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-4 border-t border-gray-100 pt-8">
                                    <button
                                        disabled={isActionLoading}
                                        onClick={() => handleSuspend(selectedVendor.id)}
                                        className="flex-1 py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all uppercase tracking-widest text-xs flex items-center justify-center"
                                    >
                                        {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                                        Suspend Account
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Unified Action Modal */}
            <AnimatePresence>
                {isActionModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsActionModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-md relative shadow-2xl overflow-hidden"
                        >
                            <div className={`h-2 w-full ${activeAction === 'REJECT' || activeAction === 'SUSPEND' ? 'bg-red-500' :
                                activeAction === 'UNSUSPEND' ? 'bg-blue-600' : 'bg-green-500'
                                }`} />

                            <div className="p-10 text-center">
                                <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center ${activeAction === 'REJECT' || activeAction === 'SUSPEND' ? 'bg-red-50 text-red-500' :
                                    activeAction === 'UNSUSPEND' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-500'
                                    }`}>
                                    {activeAction === 'UNSUSPEND' ? (
                                        <Shield className="w-10 h-10" />
                                    ) : activeAction === 'APPROVE' ? (
                                        <CheckCircle className="w-10 h-10" />
                                    ) : (
                                        <AlertCircle className="w-10 h-10" />
                                    )}
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 uppercase mb-2 tracking-tight">
                                    {activeAction === 'REJECT' ? 'Reject Application' :
                                        activeAction === 'SUSPEND' ? 'Suspend Account' :
                                            activeAction === 'UNSUSPEND' ? 'Reinstate Account' : 'Approve Vendor'}
                                </h3>
                                <p className="text-slate-500 font-medium text-sm mb-8">
                                    {activeAction === 'REJECT' || activeAction === 'SUSPEND'
                                        ? 'Please provide a detailed reason for this action. The vendor will be notified.'
                                        : `Confirm that you want to ${activeAction === 'UNSUSPEND' ? 'reinstate' : 'approve'} this vendor profile.`}
                                </p>

                                {(activeAction === 'REJECT' || activeAction === 'SUSPEND') && (
                                    <div className="relative mb-8">
                                        <textarea
                                            autoFocus
                                            value={actionInput}
                                            onChange={(e) => setActionInput(e.target.value)}
                                            placeholder="Type reason here..."
                                            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-sm h-32 focus:ring-4 focus:ring-slate-100 focus:border-slate-200 transition-all resize-none font-medium placeholder:text-slate-300"
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <button
                                        disabled={isActionLoading || ((activeAction === 'REJECT' || activeAction === 'SUSPEND') && !actionInput.trim())}
                                        onClick={handleConfirmAction}
                                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center justify-center ${activeAction === 'REJECT' || activeAction === 'SUSPEND' ? 'bg-red-500 text-white shadow-red-200 hover:bg-red-600' :
                                            activeAction === 'UNSUSPEND' ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' :
                                                'bg-green-500 text-white shadow-green-200 hover:bg-green-600'
                                            } disabled:opacity-50 disabled:shadow-none`}
                                    >
                                        {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Action'}
                                    </button>
                                    <button
                                        onClick={() => setIsActionModalOpen(false)}
                                        className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VendorManagement;
