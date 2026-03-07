import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.replace('/api', '')
            : '/';

        const newSocket = io(socketUrl);
        setSocket(newSocket);

        if (user?.id) {
            // If already connected or connects later, this ensures registration is queued/sent
            newSocket.emit('register', user.id);
        }

        newSocket.on('connect', () => {
            if (user?.id) {
                newSocket.emit('register', user.id);
            }
        });

        newSocket.on('processing_complete', (payload) => {
            if (payload.status === 'completed') {
                toast.success(`File "${payload.fileName}" finished processing!`);
                setNotifications(prev => [{ id: Date.now(), text: `File "${payload.fileName}" completed`, type: 'success' }, ...prev]);
            } else {
                toast.error(`File "${payload.fileName}" failed to process: ${payload.error}`);
                setNotifications(prev => [{ id: Date.now(), text: `File "${payload.fileName}" failed`, type: 'error' }, ...prev]);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const clearNotifications = () => setNotifications([]);

    return (
        <NotificationContext.Provider value={{ notifications, clearNotifications, socket }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
