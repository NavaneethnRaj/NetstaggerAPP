import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('ss_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const checkAuth = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get('/auth/me', { signal: controller.signal });
                setUser(data);
            } catch (err) {
                // Only clear the token on a genuine auth rejection (401 / 403).
                // Network errors, timeouts, or aborts should NOT log the user out.
                const status = err?.response?.status;
                if (status === 401 || status === 403) {
                    setToken(null);
                    localStorage.removeItem('ss_token');
                }
                // If it's an AbortError (timeout) or network error, keep the token
                // and let the user stay on the page — they can retry manually.
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        };
        checkAuth();

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [token]);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('ss_token', data.token);
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('ss_token', data.token);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) { } // Ignore errors from backend on logout
        setToken(null);
        setUser(null);
        localStorage.removeItem('ss_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
