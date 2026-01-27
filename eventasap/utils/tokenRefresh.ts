// utils/tokenRefresh.ts
const NEXT_AUTH_PATH = process.env.NEXT_PUBLIC_API_URL

export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(`${NEXT_AUTH_PATH}/api/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            return data.accessToken;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear tokens and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return null;
    }
};