'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/tokenManager';
import ConversationList from '../../components/dashboard/messages/conversation-list';
import ChatWindow from '../../components/dashboard/messages/chat-window';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Conversation {
    id: string;
    description: string;
    lastMessage?: {
        content: string;
        createdAt: string;
    };
    otherParticipant: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl?: string;
    };
    unreadCount: number;
    lastActivityAt: string;
}

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const vendorIdParam = searchParams.get('vendor');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);
    const [newConversationParticipant, setNewConversationParticipant] = useState<Conversation['otherParticipant'] | null>(null);

    // Initial data fetch
    useEffect(() => {
        const checkAuthAndFetch = async () => {
            try {
                const profileRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`);
                const profileData = await profileRes.json();

                if (profileData.success) {
                    setCurrentUserId(profileData.data.user.id);
                }

                await fetchConversations();

            } catch (error) {
                console.error('Initialization error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthAndFetch();

        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle vendor query param
    useEffect(() => {
        if (!vendorIdParam || isLoading || !currentUserId) return;

        const handleVendorParam = async () => {
            // Check if we already have a conversation with this participant
            const existingConv = conversations.find(c => c.otherParticipant.id === vendorIdParam);

            if (existingConv) {
                setSelectedConversationId(existingConv.id);
            } else {
                // New conversation - fetch user details
                try {
                    // Try to fetch as a vendor profile first (common case from UI links)
                    // If it fails or returns a profile with a userId, use that userId

                    // First try: Fetch vendor profile by User ID (assuming param is User ID)
                    const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors?userId=${vendorIdParam}`);
                    const data = await response.json();

                    let otherParticipant = null;

                    if (data.success && data.data.vendors && data.data.vendors.length > 0) {
                        const vendor = data.data.vendors[0];
                        otherParticipant = {
                            id: vendor.userId,
                            firstName: vendor.user.firstName,
                            lastName: vendor.user.lastName,
                            avatarUrl: vendor.user.avatarUrl
                        };
                    } else {
                        // Fallback: Try fetching based on the ID being a VendorProfile ID
                        const profileRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/${vendorIdParam}`);
                        const profileData = await profileRes.json();

                        if (profileData.success) {
                            const vendor = profileData.data;
                            otherParticipant = {
                                id: vendor.userId,
                                firstName: vendor.user.firstName,
                                lastName: vendor.user.lastName,
                                avatarUrl: vendor.user.avatarUrl
                            };

                            // Check again for existing conversation with the REAL user ID
                            const realConv = conversations.find(c => c.otherParticipant.id === vendor.userId);
                            if (realConv) {
                                setSelectedConversationId(realConv.id);
                                return;
                            }
                        }
                    }

                    if (otherParticipant) {
                        setNewConversationParticipant(otherParticipant);
                        setSelectedConversationId('new');
                    } else {
                        // If all else fails, assume it is a valid User ID and we might want to just show an empty ID? 
                        // But we need a name for the header.
                        console.error('Could not find user details for vendor param:', vendorIdParam);
                    }

                } catch (err) {
                    console.error('Error handling vendor param:', err);
                }
            }
        };

        handleVendorParam();
    }, [vendorIdParam, isLoading, currentUserId, conversations]);

    const fetchConversations = async () => {
        try {
            const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations`);
            const data = await response.json();
            if (data.success) {
                setConversations(data.data.conversations);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            toast.error('Failed to load conversations');
        }
    };

    const handleSelectConversation = (id: string) => {
        setSelectedConversationId(id);
        setNewConversationParticipant(null);
    };

    const handleBackToConversations = () => {
        setSelectedConversationId(null);
        setNewConversationParticipant(null);
    };

    const handleMessageSent = () => {
        fetchConversations();
    };

    // Derived state for current view
    const showList = !isMobileView || !selectedConversationId;
    const showChat = !isMobileView || selectedConversationId;

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    // Determine active chat details
    const activeParticipant = selectedConversation?.otherParticipant || newConversationParticipant;
    const activeConversationId = selectedConversation?.id; // Will be undefined if 'new'

    return (
        <div className="h-[calc(100vh-120px)] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex">
            {/* Conversation List */}
            <div className={`${showList ? 'w-full md:w-80 lg:w-96' : 'hidden md:block md:w-80 lg:w-96'} h-full border-r border-gray-100`}>
                <ConversationList
                    conversations={conversations}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={handleSelectConversation}
                    isLoading={isLoading}
                />
            </div>

            {/* Chat Window */}
            <div className={`${showChat ? 'w-full' : 'hidden'} md:block flex-1 h-full bg-gray-50`}>
                {activeParticipant && currentUserId ? (
                    <ChatWindow
                        conversationId={activeConversationId}
                        currentUserId={currentUserId}
                        otherParticipant={activeParticipant}
                        onBack={handleBackToConversations}
                        onMessageSent={handleMessageSent}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50/50">
                        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Select a conversation
                        </h3>
                        <p className="text-gray-500 max-w-xs">
                            Choose a conversation from the list to start chatting with vendors or clients.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
