import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
    const [branding, setBranding] = useState({
        appName: 'Rheox',
        appLogo: '/rheox_logo.png',
        themeColor: '#5865F2'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const { data } = await api.get('/config/branding');
                // Merge fetched data with initial branding, prioritizing fetched data
                setBranding(prevBranding => ({
                    ...prevBranding,
                    ...data
                }));

                // Update CSS variables for global usage if needed
                document.documentElement.style.setProperty('--primary-color', data.themeColor);
            } catch (error) {
                console.error('Failed to load branding:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBranding();
    }, []);

    return (
        <BrandingContext.Provider value={{ ...branding, loading }}>
            {children}
        </BrandingContext.Provider>
    );
};

export const useBranding = () => useContext(BrandingContext);
