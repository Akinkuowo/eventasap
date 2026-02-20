// utils/tokenManager.ts
export const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (error) {
        return true;
    }
};

export const getTokenExpiration = (token: string | null): Date | null => {
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return new Date(payload.exp * 1000);
    } catch (error) {
        return null;
    }
};

export const refreshAuthToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            return data.data.accessToken;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to refresh token');
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear tokens and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return null;
    }
};

// Define types for fetch options
interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const fetchWithAuth = async (
    url: string | URL | Request,
    options: FetchOptions = {}
): Promise<Response> => {
    let token = localStorage.getItem('accessToken');

    // Check if token is expired
    if (isTokenExpired(token)) {
        token = await refreshAuthToken();
        if (!token) {
            throw new Error('Failed to refresh token');
        }
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    // If token expired during request, refresh and retry once
    if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.error === 'Token expired') {
            const newToken = await refreshAuthToken();
            if (newToken) {
                headers['Authorization'] = `Bearer ${newToken}`;
                return await fetch(url, { ...options, headers });
            }
        }
        throw new Error('Authentication failed');
    }

    return response;
};

// Optional: Create a typed API client
export class AuthApiClient {
    private static instance: AuthApiClient;
    private baseURL: string;

    private constructor(baseURL: string = 'http://localhost:5000') {
        this.baseURL = baseURL;
    }

    static getInstance(): AuthApiClient {
        if (!AuthApiClient.instance) {
            AuthApiClient.instance = new AuthApiClient();
        }
        return AuthApiClient.instance;
    }

    async request<T = any>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const response = await fetchWithAuth(url, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async get<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    async post<T = any>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T = any>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

// Check if user should be auto-logged in (Remember Me active and not expired)
export const isRememberMeActive = (): boolean => {
    if (typeof window === 'undefined') return false;
    const rememberMe = localStorage.getItem('rememberMe');
    const expiryStr = localStorage.getItem('rememberMeExpiry');
    if (!rememberMe || !expiryStr) return false;
    return new Date(expiryStr) > new Date();
};

// Attempt silent re-login using stored refresh token.
// Returns true if user is now authenticated.
export const checkAndAutoLogin = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    // Already have a valid access token - no action needed
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !isTokenExpired(accessToken)) return true;

    // No remember me set - don't auto-login
    if (!isRememberMeActive()) return false;

    // Refresh token exists - try to get a new access token silently
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
        const newToken = await refreshAuthToken();
        return !!newToken;
    } catch {
        return false;
    }
};

// Clear all auth data including remember me
export const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberMeExpiry');
};
