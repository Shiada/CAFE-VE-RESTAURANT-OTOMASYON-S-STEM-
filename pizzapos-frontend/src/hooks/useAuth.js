// src/hooks/useAuth.js (GÜNCEL VE GÜVENİLİR HALE GETİRİLDİ)

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const CLAIM_ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const CLAIM_NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

const useAuth = () => {
    const [authData, setAuthData] = useState({ 
        role: null, 
        isAuthenticated: !!localStorage.getItem('authToken'),
        username: null,
        userId: null
    });

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                
                // Roller bazen array bazen string gelir
                const rawRole = decoded[CLAIM_ROLE] || decoded.role;
                const userRole = Array.isArray(rawRole) ? rawRole[0] : rawRole;
                
                const userName = decoded[CLAIM_NAME] || decoded.name || decoded.unique_name;
                const isExpired = decoded.exp * 1000 < Date.now();
                
                if (!isExpired) {
                    setAuthData({
                        role: userRole,
                        isAuthenticated: true,
                        username: userName,
                        userId: decoded.nameid || decoded.sub 
                    });
                } else {
                    localStorage.removeItem('authToken');
                    setAuthData({ role: null, isAuthenticated: false, username: null, userId: null });
                }
            } catch (error) {
                localStorage.removeItem('authToken');
                setAuthData({ role: null, isAuthenticated: false, username: null, userId: null });
            }
        }
    }, []); 

    return authData;
};

export default useAuth;