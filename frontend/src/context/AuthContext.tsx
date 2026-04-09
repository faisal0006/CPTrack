import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (email: any, password: any) => Promise<void>;
    register: (name: any, email: any, password: any) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(null as any);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await api.get('/users/profile');
                    setUser(res.data.user);
                }
            } catch (error) {
                console.error(error);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = async (email: any, password: any) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
    };

    const register = async (name: any, email: any, password: any) => {
        const res = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
