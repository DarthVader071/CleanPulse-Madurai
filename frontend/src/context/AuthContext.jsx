import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // You can also use authAPI.getProfile() if the backend supports it
                    // For now, we'll assume the token has role info and we get user profile
                    const res = await authAPI.getProfile();
                    setUser(res.data);
                } catch (error) {
                    console.error("Token invalid or expired", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (credentials) => {
        const res = await authAPI.login(credentials);
        localStorage.setItem('token', res.data.token);
        // Use user object from response, fallback to profile fetch
        if (res.data.user) {
            setUser(res.data.user);
        } else {
            const profileRes = await authAPI.getProfile();
            setUser(profileRes.data);
        }
    };

    const register = async (data) => {
        const res = await authAPI.register(data);
        localStorage.setItem('token', res.data.token);
        // Use user object from response, fallback to profile fetch
        if (res.data.user) {
            setUser(res.data.user);
        } else {
            const profileRes = await authAPI.getProfile();
            setUser(profileRes.data);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
