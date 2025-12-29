import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const SchoolContext = createContext();

export const useSchool = () => {
    return useContext(SchoolContext);
};

export const SchoolProvider = ({ children }) => {
    const [schoolProfile, setSchoolProfile] = useState(null);
    const [currency, setCurrency] = useState('USD');
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/school-profile`);
            const data = await res.json();
            setSchoolProfile(data);
            if (data.currency) setCurrency(data.currency);
        } catch (error) {
            console.error("Failed to fetch school profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const formatCurrency = (amount) => {
        const symbol = currency === 'ETB' ? 'ETB ' : '$';
        const num = Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `${symbol}${num}`;
    };

    const currencySymbol = currency === 'ETB' ? 'ETB ' : '$';

    const value = {
        schoolProfile,
        currency,
        currencySymbol,
        formatCurrency,
        refreshProfile: fetchProfile,
        loading
    };

    return (
        <SchoolContext.Provider value={value}>
            {children}
        </SchoolContext.Provider>
    );
};
