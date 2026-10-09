import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';

const MasaYonetimiPage = () => {
    const [masalar, setMasalar] = useState([]);
    const [loading, setLoading] = useState(true);
    const { role } = useAuth();

    const verileriGetir = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/MasaYonetimi/Masalar');
            setMasalar(res.data);
        } catch (err) {
            console.error("Masalar yüklenemedi:", err);
            // Eğer backend hatası alırsak demo verisi gösterelim (Geliştirme aşaması için)
            if(masalar.length === 0) {
                setMasalar([
                    { id: 1, masaAdi: "Masa 1", durum: "Bos", konum: "Salon", masaTutari: 0 },
                    { id: 2, masaAdi: "Masa 2", durum: "Dolu", konum: "Salon", masaTutari: 450.50 },
                    { id: 3, masaAdi: "Teras 1", durum: "Bos", konum: "Teras", masaTutari: 0 },
                    { id: 4, masaAdi: "Bahçe 3", durum: "Kirli", konum: "Bahce", masaTutari: 0 },
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { verileriGetir(); }, []);

    const durumRengi = (durum) => {
        switch (durum) {
            case 'Bos': return '#2ecc71';
            case 'Dolu': return '#e74c3c';
            case 'Kirli': return '#f1c40f';
            case 'Rezerve': return '#3498db';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Masa Yönetimi & Salon Planı</h1>
                    <p style={styles.subtitle}>İşletmenizdeki tüm masaların doluluk oranını ve hesaplarını takip edin.</p>
                </div>
                <button className="btn-primary" onClick={verileriGetir}>🔄 Yenile</button>
            </header>

            <div style={styles.planGrid}>
                {masalar.map(masa => (
                    <div key={masa.id} className="glass-card" style={styles.masaCard}>
                        <div style={{...styles.durumIndicator, backgroundColor: durumRengi(masa.durum)}}></div>
                        <div style={styles.masaNumber}>{masa.masaAdi}</div>
                        <div style={styles.masaKonum}>{masa.konum}</div>
                        
                        <div style={styles.masaDetails}>
                            {masa.durum === 'Dolu' ? (
                                <div style={styles.tutar}>{masa.masaTutari.toFixed(2)} ₺</div>
                            ) : (
                                <div style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>{masa.durum}</div>
                            )}
                        </div>

                        <div style={styles.actions}>
                            <button style={styles.actionBtn}>Hesap Yazdır</button>
                            <button style={styles.actionBtn}>Masa Taşı</button>
                        </div>
                    </div>
                ))}

                {/* Yeni Masa Ekleme Kartı (Demo) */}
                <div className="glass-card" style={{...styles.masaCard, borderStyle: 'dashed', opacity: 0.6, cursor: 'pointer', justifyContent: 'center'}}>
                    <div style={{fontSize: '2rem'}}>+</div>
                    <div style={{fontSize: '0.9rem'}}>Masa Ekle</div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '30px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)' },
    subtitle: { color: 'var(--text-secondary)' },
    planGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' },
    masaCard: { 
        padding: '25px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        position: 'relative',
        minHeight: '220px'
    },
    durumIndicator: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        boxShadow: '0 0 10px currentColor'
    },
    masaNumber: { fontSize: '1.8rem', fontWeight: '800', marginBottom: '5px' },
    masaKonum: { fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' },
    masaDetails: { margin: '20px 0', flex: 1, display: 'flex', alignItems: 'center' },
    tutar: { fontSize: '1.3rem', fontWeight: '700', color: '#2ecc71' },
    actions: { display: 'flex', gap: '10px', width: '100%', marginTop: 'auto' },
    actionBtn: { 
        flex: 1, 
        padding: '8px', 
        background: 'rgba(255,255,255,0.05)', 
        border: '1px solid var(--glass-border)', 
        borderRadius: '8px', 
        color: 'white', 
        fontSize: '0.75rem',
        cursor: 'pointer'
    }
};

export default MasaYonetimiPage;
