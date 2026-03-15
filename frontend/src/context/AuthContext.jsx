import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await authApi.getMe();
            if (res.data.success) {
                setUser(res.data.data);
            } else {
                localStorage.removeItem('token');
            }
        } catch (e) {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const res = await authApi.login(email, password);
        if (res.data.success) {
            localStorage.setItem('token', res.data.access_token);
            setUser(res.data.user);
            return { success: true };
        }
        return { success: false, detail: res.data.detail };
    };

    const register = async (data) => {
        const res = await authApi.register(data);
        if (res.data.success) {
            localStorage.setItem('token', res.data.access_token);
            setUser(res.data.user);
            return { success: true };
        }
        return { success: false, detail: res.data.detail };
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refetch: checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
