import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('ss_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Validate token on mount
        const checkAuth = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
            } catch (err) {
                setToken(null);
                localStorage.removeItem('ss_token');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
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
