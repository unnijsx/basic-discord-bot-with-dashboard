import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Use relative path so it goes through Vercel proxy
        const newSocket = io({
            path: '/socket.io',
            withCredentials: true,
            transports: ['polling']
        });

        // Live Console Listener
        newSocket.on('server_log', (data) => {
            const style = data.type === 'error' ? 'background: #ffcccc; color: red' : 'background: #ccffcc; color: green';
            console.log(`%c[SERVER] ${data.message}`, style);
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
