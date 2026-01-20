import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
    const [branding, setBranding] = useState({
        appName: 'Rheox',
        appLogo: '/rheox_logo.png',
        primaryColor: '#ffb7c5',
        secondaryColor: '#ff9eb5',
        backgroundType: 'sakura',
        backgroundValue: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const { data } = await api.get('/config/branding'); // Fetch public branding
                setBranding(prev => ({
                    ...prev,
                    ...data
                }));
                // Update CSS variables
                if (data.primaryColor) {
                    document.documentElement.style.setProperty('--primary-color', data.primaryColor);
                }
                if (data.secondaryColor) {
                    document.documentElement.style.setProperty('--secondary-color', data.secondaryColor);
                }
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
