// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import storeConfig from '../storeConfig';

const Sidebar = () => {
    return (
        <div style={styles.sidebar}>
            <div style={styles.logoContainer}>
                <h2 style={styles.logo}>{storeConfig.logoText} <span style={{color: 'var(--primary-color)'}}>POS</span></h2>
                <div style={styles.badge}>{storeConfig.currentNiche} Edition</div>
            </div>

            <nav style={styles.nav}>
                <NavItem to="/" icon="📊" label="Dashboard" />
                <NavItem to="/pos" icon="🍕" label="Satış Noktası (POS)" />
                <NavItem to="/masalar" icon="🪑" label="Masalar & Salon" />
                <NavItem to="/mutfak" icon="👨‍🍳" label="Mutfak Ekranı" />
                <NavItem to="/crm" icon="👤" label="Müşteri & CRM" />
                <NavItem to="/recete" icon="🥣" label="Üretim & Reçete" />
                <NavItem to="/urunler" icon="📦" label="Ürün Yönetimi" />
                <NavItem to="/stok" icon="📉" label="Stok Takibi" />
                <NavItem to="/rapor" icon="📈" label="Raporlama" />
                <NavItem to="/ayarlar" icon="⚙️" label="Ayarlar" />
            </nav>

            <div style={styles.footer}>
                <p style={styles.version}>v2.0 Premium</p>
                <button 
                    onClick={() => {
                        localStorage.removeItem('authToken');
                        window.location.href='/login';
                    }}
                    style={styles.logoutBtn}
                >
                    Güvenli Çıkış
                </button>
            </div>
        </div>
    );
};

const NavItem = ({ to, icon, label }) => (
    <NavLink 
        to={to} 
        style={({ isActive }) => ({
            ...styles.navItem,
            backgroundColor: isActive ? 'var(--glass-bg)' : 'transparent',
            borderLeft: isActive ? '4px solid var(--primary-color)' : '4px solid transparent',
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        })}
    >
        <span style={styles.icon}>{icon}</span>
        {label}
    </NavLink>
);

const styles = {
    sidebar: {
        width: 'var(--sidebar-width)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'rgba(20, 26, 33, 0.95)',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
    },
    logoContainer: { padding: '30px 20px', textAlign: 'center' },
    logo: { fontSize: '24px', fontWeight: '700', letterSpacing: '1px' },
    badge: { fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginTop: '5px', color: 'var(--text-secondary)' },
    nav: { flex: 1, marginTop: '20px', overflowY: 'auto' },
    navItem: { display: 'flex', alignItems: 'center', padding: '15px 25px', textDecoration: 'none', transition: 'all 0.3s ease', fontSize: '15px', fontWeight: '500' },
    icon: { marginRight: '15px', fontSize: '18px' },
    footer: { padding: '25px', borderTop: '1px solid var(--glass-border)' },
    version: { fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' },
    logoutBtn: { width: '100%', padding: '10px', backgroundColor: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.2)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }
};

export default Sidebar;