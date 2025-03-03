// src/services/authService.js - NEW FILE
import axios from 'axios';

// Get backend URL from environment variables
const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to handle API errors
const handleApiError = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
            success: false,
            message: error.response.data.message || 'An error occurred',
            code: error.response.data.code || 'API_ERROR',
            status: error.response.status
        };
    } else if (error.request) {
        // The request was made but no response was received
        return {
            success: false,
            message: 'No response from server',
            code: 'NETWORK_ERROR'
        };
    } else {
        // Something happened in setting up the request that triggered an Error
        return {
            success: false,
            message: error.message,
            code: 'REQUEST_ERROR'
        };
    }
};

// Authentication service
const authService = {
    // Register a new user
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/api/user/register`, userData, {
                headers: {
                    'x-csrf-token': localStorage.getItem('csrfToken'),
                    'csrf-token': localStorage.getItem('csrfToken')
                }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Login a user
    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/api/user/login`, credentials, {
                headers: {
                    'x-csrf-token': localStorage.getItem('csrfToken'),
                    'csrf-token': localStorage.getItem('csrfToken')
                }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Refresh access token
    refreshToken: async (refreshToken) => {
        try {
            const response = await axios.post(`${API_URL}/api/user/refresh-token`, { refreshToken }, {
                headers: {
                    'x-csrf-token': localStorage.getItem('csrfToken'),
                    'csrf-token': localStorage.getItem('csrfToken')
                }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Logout a user
    logout: async (token) => {
        try {
            const response = await axios.post(`${API_URL}/api/user/logout`, {}, {
                headers: {
                    token,
                    'x-csrf-token': localStorage.getItem('csrfToken'),
                    'csrf-token': localStorage.getItem('csrfToken')
                }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Request password reset
    forgotPassword: async (email) => {
        try {
            const response = await axios.post(`${API_URL}/api/user/forgot-password`, { email }, {
                headers: {
                    'x-csrf-token': localStorage.getItem('csrfToken'),
                    'csrf-token': localStorage.getItem('csrfToken')
                }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Reset password
    resetPassword: async (token, password) => {
        try {
            const response = await axios.post(`${API_URL}/api/user/reset-password`, { token, password }, {
                headers: {
                    'x-csrf-token': localStorage.getItem('csrfToken'),
                    'csrf-token': localStorage.getItem('csrfToken')
                }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Generate CSRF token
    generateCsrfToken: () => {
        const token = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
        localStorage.setItem('csrfToken', token);
        return token;
    }
};

export default authService;