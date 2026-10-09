// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import storeConfig from '../storeConfig';

const LoginPage = () => {
    const [kullaniciAdi, setKullaniciAdi] = useState('');
    const [sifre, setSifre] = useState('');
    const [hataMesaji, setHataMesaji] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setHataMesaji('');
        setIsLoading(true);

        try {
            await login(kullaniciAdi, sifre);
            navigate('/');
        } catch (error) {
            setHataMesaji(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            {/* Arka plan süslemesi */}
            <div style={styles.blob1}></div>
            <div style={styles.blob2}></div>

            <div className="glass-card" style={styles.loginCard}>
                <div style={styles.logoSection}>
                    <h1 style={styles.logo}>{storeConfig.logoText} <span style={{color: 'var(--primary-color)'}}>POS</span></h1>
                    <p style={styles.tagline}>Geleceğin Restoran Otomasyonu</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <h2 style={styles.welcome}>Hoş Geldiniz</h2>
                    <p style={styles.instruction}>Hesabınıza giriş yapın</p>

                    {hataMesaji && <div style={styles.error}>{hataMesaji}</div>}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Kullanıcı Adı</label>
                        <input
                            type="text"
                            placeholder="admin / kasiyer"
                            value={kullaniciAdi}
                            onChange={(e) => setKullaniciAdi(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Şifre</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={sifre}
                            onChange={(e) => setSifre(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        style={styles.loginBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Giriş Yapılıyor...' : 'Sisteme Bağlan'}
                    </button>
                    
                    <div style={styles.footer}>
                        © 2026 {storeConfig.name} v2.0
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    page: {
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0c1117',
        overflow: 'hidden',
        position: 'relative'
    },
    blob1: {
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'rgba(255, 71, 87, 0.15)',
        borderRadius: '50%',
        top: '-100px',
        left: '-100px',
        filter: 'blur(80px)'
    },
    blob2: {
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(52, 152, 219, 0.1)',
        borderRadius: '50%',
        bottom: '-50px',
        right: '-50px',
        filter: 'blur(60px)'
    },
    loginCard: {
        width: 'auto',
        minWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        overflow: 'hidden',
        animation: 'fadeIn 0.8s ease-out'
    },
    logoSection: {
        padding: '30px',
        background: 'rgba(255,255,255,0.03)',
        textAlign: 'center',
        borderBottom: '1px solid var(--glass-border)'
    },
    logo: { fontSize: '2rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '5px' },
    tagline: { fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' },
    form: { padding: '40px' },
    welcome: { fontSize: '1.8rem', fontWeight: '700', marginBottom: '5px' },
    instruction: { color: 'var(--text-secondary)', marginBottom: '30px' },
    error: { background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(231, 76, 60, 0.2)' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' },
    input: { width: '100%', padding: '12px 15px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'all 0.3s' },
    loginBtn: { width: '100%', marginTop: '10px', padding: '14px' },
    footer: { marginTop: '30px', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }
};

export default LoginPage;