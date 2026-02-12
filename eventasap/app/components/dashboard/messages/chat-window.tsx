'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Phone, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { fetchWithAuth } from '@/utils/tokenManager';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Message {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    sender: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl?: string;
    };
}

interface ChatWindowProps {
    conversationId?: string;
    currentUserId: string;
    otherParticipant: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl?: string;
    };
    onBack?: () => void; // For mobile view
    onMessageSent?: () => void;
}

export default function ChatWindow({
    conversationId: initialConversationId,
    currentUserId,
    otherParticipant,
    onBack,
    onMessageSent
}: ChatWindowProps) {
    const [conversationId, setConversationId] = useState(initialConversationId);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Update internal ID if prop changes
    useEffect(() => {
        setConversationId(initialConversationId);
    }, [initialConversationId]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversationId) {
                setMessages([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/conversations/${conversationId}/messages`);
                const data = await response.json();

                if (data.success) {
                    setMessages(data.data.messages);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setIsLoading(false);
                scrollToBottom();
            }
        };

        fetchMessages();

        // Optional: Set up polling for new messages
        let interval: NodeJS.Timeout;
        if (conversationId) {
            interval = setInterval(fetchMessages, 10000); // Poll every 10 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        setIsSending(true);
        try {
            const response = await fetchWithAuth(`${NEXT_PUBLIC_API_URL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiverId: otherParticipant.id,
                    content: newMessage
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, data.data.message]);
                setNewMessage('');

                // If this was a new conversation, we might need to refresh the list
                if (!conversationId && onMessageSent) {
                    onMessageSent();
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const groupMessagesByDate = (msgs: Message[]) => {
        const groups: { [key: string]: Message[] } = {};
        msgs.forEach(msg => {
            const date = new Date(msg.createdAt).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full md:hidden"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {otherParticipant.avatarUrl ? (
                            <Image
                                src={otherParticipant.avatarUrl}
                                alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                                width={40}
                                height={40}
                                className="object-cover"
                            />
                        ) : (
                            <span className="text-gray-500 font-medium">
                                {otherParticipant.firstName[0]}{otherParticipant.lastName[0]}
                            </span>
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">
                            {otherParticipant.firstName} {otherParticipant.lastName}
                        </h2>
                        <span className="text-xs text-green-600 font-medium">Online</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                    </div>
                ) : (
                    Object.entries(messageGroups).map(([date, msgs]) => (
                        <div key={date} className="space-y-4">
                            <div className="flex justify-center">
                                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                    {date}
                                </span>
                            </div>
                            {msgs.map((msg) => {
                                const isOwn = msg.senderId === currentUserId;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                                                ? 'bg-orange-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.content}</p>
                                            <div className={`text-[10px] mt-1 text-right ${isOwn ? 'text-orange-100/80' : 'text-gray-400'
                                                }`}>
                                                {formatMessageTime(msg.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-black"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
