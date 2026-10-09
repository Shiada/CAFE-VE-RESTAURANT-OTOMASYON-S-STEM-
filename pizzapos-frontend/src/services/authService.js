// src/services/authService.js

import axios from '../api/axiosInstance'; 

export const login = async (KullaniciAdi, Sifre) => {
    try {
        const response = await axios.post('/Auth/login', {
            KullaniciAdi,
            Sifre
        });
        
        const token = response.data.token;
        localStorage.setItem('authToken', token); 
        
        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.Message || 'Giriş başarısız oldu.');
    }
};

export const logout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login'; 
};