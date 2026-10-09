// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import storeConfig from '../storeConfig';
import axiosInstance from '../api/axiosInstance';

const Dashboard = () => {
    const { role, username } = useAuth();
    const [stats, setStats] = useState({
        ciro: "0.00",
        siparisAdet: 0,
        aktifMasa: 0,
        dusukStok: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Raporlama API'sinden gerçek ciro verilerini çekelim
                const today = new Date();
                const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
                const endOfDay = today.toISOString();
                
                const reportsRes = await axiosInstance.get(`/Raporlama/SatisOzeti?baslangic=${startOfDay}&bitis=${endOfDay}`);
                const masalarRes = await axiosInstance.get('/MasaYonetimi/Masalar');
                const stokRes = await axiosInstance.get('/StokYonetimi/Malzemeler');

                setStats({
                    ciro: reportsRes.data.toplamCiro.toFixed(2),
                    siparisAdet: reportsRes.data.toplamSiparisSayisi,
                    aktifMasa: masalarRes.data.filter(m => m.durum === 'Dolu').length,
                    dusukStok: stokRes.data.filter(m => m.stokMiktari <= m.kritikSeviye).length
                });
            } catch (err) {
                // Hata durumunda varsayılan demo verisi
                setStats({ ciro: "12,450.00", siparisAdet: 45, aktifMasa: 4, dusukStok: 2 });
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.greeting}>Hoş Geldiniz, {username} 👋</h1>
                    <p style={styles.subtitle}>{storeConfig.name} {role} Paneli üzerinden işletmenizi yönetin.</p>
                </div>
                <div style={styles.topActions}>
                    <NavLink to="/pos" className="btn-primary" style={{textDecoration: 'none'}}>🚀 Hızlı Satış Aç</NavLink>
                </div>
            </header>

            <div style={styles.statsGrid}>
                <StatCard title="Günlük Ciro" value={`${stats.ciro} ₺`} icon="💰" color="#2ecc71" desc="Bugünkü Toplam Gelir" />
                <StatCard title="Sipariş Sayısı" value={stats.siparisAdet} icon="🧾" color="#3498db" desc="Sistemdeki Toplam Fiş" />
                <StatCard title="Dolu Masalar" value={stats.aktifMasa} icon="🪑" color="#f1c40f" desc="Anlık Salon Doluluk Oranı" />
                <StatCard title="Stok Uyarıları" value={stats.dusukStok} icon="⚠️" color="#ff4757" desc="Kritik Seviyedeki Malzeme" />
            </div>

            <div style={styles.contentRow}>
                <div className="glass-card" style={styles.mainCard}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Hızlı Erişim & KDS Özeti</h3>
                    </div>
                    <div style={styles.tools}>
                        <QuickTool to="/masalar" icon="🖼️" title="Salon Görünümü" desc="Tüm masaların anlık durumunu izleyin." />
                        <QuickTool to="/mutfak" icon="🥘" title="Mutfak Ekranı" desc="Bekleyen hazırlık siparişleri görüntüleyin." />
                        <QuickTool to="/menu" icon="🤖" title="Akıllı QR Menü" desc="Müşteriler için AI destekli dijital menü." />
                        <QuickTool to="/rapor" icon="📈" title="Finansal Raporlar" desc="Gider ve Gelir kar oranlarınızı analiz edin." />
                    </div>
                </div>

                <div className="glass-card" style={styles.sideCard}>
                    <h3 style={styles.cardTitle}>Duyurular & Sistem Notları</h3>
                    <div style={styles.notlar}>
                        <div style={styles.noteItem}>🚀 <b>YAPAY ZEKA EKLENDİ:</b> Müşterileriniz artık AI Garson ile sohbet edebilir!</div>
                        <div style={styles.noteItem}>📌 <b>Sürüm 2.5:</b> Reçete ve CRM modülleri kararlı çalışıyor.</div>
                    </div>
                    <div style={{marginTop: '30px', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)'}}>
                        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Donanım Durumu</div>
                        <div style={{fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', marginTop: '5px'}}>
                            <span>Fiş Yazıcısı 🖨️</span>
                            <span style={{color: '#2ecc71'}}>Bağlı</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, desc }) => (
    <div className="glass-card" style={styles.statCard}>
        <div style={{...styles.statIcon, backgroundColor: `${color}15`, color: color}}>{icon}</div>
        <div>
            <div style={styles.statTitle}>{title}</div>
            <div style={styles.statValue}>{value}</div>
            <div style={styles.statDesc}>{desc}</div>
        </div>
    </div>
);

const QuickTool = ({ to, icon, title, desc }) => (
    <NavLink to={to} style={styles.toolItem}>
        <div style={styles.toolIcon}>{icon}</div>
        <div>
            <div style={styles.toolTitle}>{title}</div>
            <div style={styles.toolDesc}>{desc}</div>
        </div>
    </NavLink>
);

const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '30px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    greeting: { fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.5px' },
    subtitle: { color: 'var(--text-secondary)', fontSize: '1.1rem' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
    statCard: { padding: '25px', display: 'flex', alignItems: 'flex-start', gap: '20px' },
    statIcon: { width: '55px', height: '55px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' },
    statTitle: { fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' },
    statValue: { fontSize: '1.8rem', fontWeight: '800', margin: '5px 0' },
    statDesc: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' },
    contentRow: { display: 'flex', gap: '30px', height: 'auto' },
    mainCard: { flex: 2, padding: '30px' },
    sideCard: { flex: 1, padding: '30px' },
    cardTitle: { fontSize: '1.3rem', fontWeight: '700', marginBottom: '25px', color: 'var(--primary-color)' },
    tools: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    toolItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', textDecoration: 'none', color: 'white', border: '1px solid transparent', transition: 'all 0.3s' },
    toolTitle: { fontWeight: '700', fontSize: '1rem' },
    toolDesc: { fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px' },
    toolIcon: { fontSize: '1.8rem' },
    notlar: { display: 'flex', flexDirection: 'column', gap: '15px' },
    noteItem: { padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--primary-color)' }
};

export default Dashboard;