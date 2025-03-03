// src/hooks/useAuth.js - NEW FILE
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

export const useAuth = () => {
    const { 
        token, 
        user, 
        loading, 
        authError,
        registerUser,
        loginUser,
        logoutUser,
        forgotPassword,
        resetPassword
    } = useContext(ShopContext);

    return {
        isAuthenticated: !!token,
        user,
        token,
        loading,
        authError,
        registerUser,
        loginUser,
        logoutUser,
        forgotPassword,
        resetPassword
    };
};