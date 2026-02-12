'use client';

import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/utils/tokenManager';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface MessageVendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    vendorName: string;
    bookingId?: string;
    initialMessage?: string;
    onSuccess?: () => void;
}

export default function MessageVendorModal({
    isOpen,
    onClose,
    vendorId,
    vendorName,
    bookingId,
    initialMessage = '',
    onSuccess
}: MessageVendorModalProps) {
    const [message, setMessage] = useState(initialMessage);
    const [isSending, setIsSending] = useState(false);

    if (!isOpen) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setIsSending(true);

        try {
            const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiverId: vendorId,
                    content: message,
                    bookingId
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Message sent successfully!');
                setMessage('');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast.error(data.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Send message error:', error);
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                        Message {vendorName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSend} className="p-4">
                    <div className="mb-4">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Type your message to ${vendorName}...`}
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none text-gray-900 placeholder:text-gray-400"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSending || !message.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Message
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
