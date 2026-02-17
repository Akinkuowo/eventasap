'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Message Thread Redirect Page
 * Fixes 404 error and redirects to the main messages page with the vendor/participant selected.
 */
export default function MessageThreadRedirect() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    useEffect(() => {
        if (id) {
            // Check if we need to pass additional context or if the main messages page
            // can handle finding the conversation based on this ID.
            // The current MessagesPage expects a 'vendor' query param to initiate or select a chat.
            router.replace(`/dashboard/messages?vendor=${id}`);
        }
    }, [id, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-bold">Opening your conversation...</p>
        </div>
    );
}
