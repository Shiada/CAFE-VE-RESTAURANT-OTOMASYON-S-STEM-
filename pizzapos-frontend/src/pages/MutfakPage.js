import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';

const MutfakPage = () => {
    const [siparisler, setSiparisler] = useState([]);
    const [loading, setLoading] = useState(true);

    const aktifSiparisleriGetir = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/SiparisYonetimi/AktifSiparisler');
            setSiparisler(res.data);
        } catch (err) {
            console.error("Mutfak verileri yüklenemedi:", err);
            // Demo verisi (Offline çalışıyorsa)
            if(siparisler.length === 0) {
                setSiparisler([
                    {
                        id: 120,
                        siparisTarihi: new Date().toISOString(),
                        durum: "Hazırlanıyor",
                        detaylar: [
                            { id: 1, miktar: 2, urunCesit: { urun: { isim: "Margarita Pizza" } } },
                            { id: 2, miktar: 1, urunCesit: { urun: { isim: "Kola 330ml" } } },
                        ]
                    },
                    {
                        id: 121,
                        siparisTarihi: new Date().toISOString(),
                        durum: "Beklemede",
                        detaylar: [
                            { id: 3, miktar: 1, urunCesit: { urun: { isim: "Karışık Pizza (Büyük)" } } },
                        ]
                    }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        aktifSiparisleriGetir(); 
        const interval = setInterval(aktifSiparisleriGetir, 10000); // 10 saniyede bir güncelle
        return () => clearInterval(interval);
    }, []);

    const durumuDegistir = async (siparisId, yeniDurum) => {
        // Backend'de durum güncelleme endpointi eklendiğinde aktif edilecek
        setSiparisler(siparisler.map(s => s.id === siparisId ? { ...s, durum: yeniDurum } : s));
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Mutfak Takip Sistemi (KDS)</h1>
                    <p style={styles.subtitle}>Hazırlanması beklenen siparişleri buradan yönetin.</p>
                </div>
                <div style={styles.timer}>{new Date().toLocaleTimeString()}</div>
            </header>

            <div style={styles.mutfakGrid}>
                {siparisler.map(siparis => (
                    <div key={siparis.id} className="glass-card" style={styles.orderCard}>
                        <div style={styles.cardHeader}>
                            <div style={styles.orderId}>#{siparis.id}</div>
                            <div style={{...styles.statusBadge, backgroundColor: siparis.durum === 'Hazırlanıyor' ? '#e67e22' : '#34495e'}}>
                                {siparis.durum}
                            </div>
                        </div>

                        <div style={styles.detaylar}>
                            {siparis.detaylar.map(d => (
                                <div key={d.id} style={styles.detayRow}>
                                    <div style={styles.miktar}>{d.miktar}x</div>
                                    <div style={styles.urunIsmi}>{d.urunCesit?.urun?.isim}</div>
                                </div>
                            ))}
                        </div>

                        <div style={styles.cardFooter}>
                            {siparis.durum === 'Beklemede' && (
                                <button className="btn-primary" style={{width: '100%'}} onClick={() => durumuDegistir(siparis.id, 'Hazırlanıyor')}>
                                    Hazırlamaya Başla
                                </button>
                            )}
                            {siparis.durum === 'Hazırlanıyor' && (
                                <button className="btn-success" style={{width: '100%'}} onClick={() => durumuDegistir(siparis.id, 'Hazırlandı')}>
                                    Hazır Olarak İşaretle
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {siparisler.length === 0 && (
                    <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '100px', color: 'var(--text-secondary)'}}>
                        <div style={{fontSize: '3rem'}}>👨‍🍳</div>
                        <h2>Bekleyen sipariş bulunmuyor.</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '30px', height: '100%' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '2rem', fontWeight: '800', color: '#ffa502' },
    subtitle: { color: 'var(--text-secondary)' },
    timer: { background: 'var(--glass-bg)', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.2rem' },
    mutfakGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', overflowY: 'auto' },
    orderCard: { padding: '20px', display: 'flex', flexDirection: 'column', borderTop: '5px solid #ffa502' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
    orderId: { fontSize: '1.4rem', fontWeight: '800' },
    statusBadge: { padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' },
    detaylar: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
    detayRow: { display: 'flex', gap: '10px', alignItems: 'center', fontSize: '1.1rem' },
    miktar: { background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '8px', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' },
    urunIsmi: { fontWeight: '500' },
    cardFooter: { marginTop: 'auto' }
};

export default MutfakPage;
