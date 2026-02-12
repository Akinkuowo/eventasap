'use client';

import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import Image from 'next/image';

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

interface ConversationListProps {
    conversations: Conversation[];
    selectedConversationId: string | null;
    onSelectConversation: (conversationId: string) => void;
    isLoading: boolean;
}

export default function ConversationList({
    conversations,
    selectedConversationId,
    onSelectConversation,
    isLoading
}: ConversationListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = conversations.filter(conv => {
        const name = `${conv.otherParticipant.firstName} ${conv.otherParticipant.lastName}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-100">
            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        {searchTerm ? 'No conversations found' : 'No messages yet'}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredConversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => onSelectConversation(conv.id)}
                                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${selectedConversationId === conv.id ? 'bg-orange-50 hover:bg-orange-50' : ''
                                    }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                        {conv.otherParticipant.avatarUrl ? (
                                            <Image
                                                src={conv.otherParticipant.avatarUrl}
                                                alt={`${conv.otherParticipant.firstName} ${conv.otherParticipant.lastName}`}
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-gray-500 font-medium text-sm">
                                                {conv.otherParticipant.firstName[0]}{conv.otherParticipant.lastName[0]}
                                            </span>
                                        )}
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 rounded-full border-2 border-white flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-white">
                                                {conv.unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`text-sm font-semibold truncate ${selectedConversationId === conv.id ? 'text-orange-900' : 'text-gray-900'
                                            }`}>
                                            {conv.otherParticipant.firstName} {conv.otherParticipant.lastName}
                                        </h3>
                                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                            {formatTime(conv.lastActivityAt)}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'
                                        }`}>
                                        {conv.lastMessage?.content || 'No messages yet'}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
