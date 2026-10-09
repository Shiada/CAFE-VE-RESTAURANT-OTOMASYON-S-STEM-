import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';

const RaporlamaPage = () => {
    const [ozetRapor, setOzetRapor] = useState(null);
    const [cokSatanlar, setCokSatanlar] = useState([]);
    const [loading, setLoading] = useState(true);
    const { role } = useAuth();

    const raporlariGetir = async () => {
        setLoading(true);
        try {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
            const endOfDay = today.toISOString();

            const [ozetRes, cokSatanRes] = await Promise.all([
                axiosInstance.get(`/Raporlama/SatisOzeti?baslangic=${startOfDay}&bitis=${endOfDay}`),
                axiosInstance.get('/Raporlama/CokSatanlar')
            ]);
            
            setOzetRapor(ozetRes.data);
            setCokSatanlar(cokSatanRes.data);
        } catch (err) {
            console.error("Raporlar yüklenemedi:", err);
            // Demo verisi (Offline çalışıyorsa)
            if(!ozetRapor) {
                setOzetRapor({
                    toplamSiparisSayisi: 45,
                    toplamCiro: 12450.50,
                    toplamMaliyet: 4230.20,
                    netKar: 8220.30,
                    ortalamaSiparisTutari: 276.67
                });
                setCokSatanlar([
                    { urunAdi: "Karışık Pizza (Orta)", satilanMiktar: 12 },
                    { urunAdi: "Margarita Pizza", satilanMiktar: 8 },
                    { urunAdi: "Kola 330ml", satilanMiktar: 15 },
                    { urunAdi: "Ayran 300ml", satilanMiktar: 10 },
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(role === 'Yonetici') {
            raporlariGetir();
        }
    }, [role]);

    if(role !== 'Yonetici') {
        return <div style={{padding: '100px', textAlign: 'center'}}>Bu sayfaya erişim yetkiniz yok.</div>;
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>İşletme Finansal Raporları</h1>
                <div style={styles.dateSelector}>Rapor Dönemi: <b>Bugün</b></div>
            </header>

            {ozetRapor && (
                <div style={styles.ozetGrid}>
                    <ReportBox title="Toplam Ciro" value={`${ozetRapor.toplamCiro.toFixed(2)} ₺`} icon="💰" color="#2ecc71" />
                    <ReportBox title="Toplam Maliyet" value={`${ozetRapor.toplamMaliyet.toFixed(2)} ₺`} icon="🛒" color="#e74c3c" />
                    <ReportBox title="Net Kar" value={`${ozetRapor.netKar.toFixed(2)} ₺`} icon="📈" color="#3498db" />
                    <ReportBox title="Sipariş Sayısı" value={ozetRapor.toplamSiparisSayisi} icon="🧾" color="#f1c40f" />
                </div>
            )}

            <div style={styles.detailRow}>
                {/* En Çok Satanlar Listesi */}
                <div className="glass-card" style={styles.detailCard}>
                    <h3 style={styles.cardTitle}>En Çok Satan Ürünler</h3>
                    <div style={styles.list}>
                        {cokSatanlar.map((urun, index) => (
                            <div key={index} style={styles.listRow}>
                                <div style={styles.rankBadge}>{index + 1}</div>
                                <div style={{flex: 1, fontWeight: '500'}}>{urun.urunAdi}</div>
                                <div style={styles.amountBadge}>{urun.satilanMiktar} Adet</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Kar Analizi Grafiği (Placeholder) */}
                <div className="glass-card" style={styles.detailCard}>
                    <h3 style={styles.cardTitle}>Kar / Zarar Analizi</h3>
                    <div style={styles.progressSection}>
                        <div style={styles.progressLabel}>Satış Geliri</div>
                        <div style={styles.progressBar}><div style={{...styles.progressFill, width: '100%', background: '#2ecc71'}}></div></div>
                        
                        <div style={{...styles.progressLabel, marginTop: '15px'}}>Giderler (Maliyet + Kira)</div>
                        <div style={styles.progressBar}><div style={{...styles.progressFill, width: '35%', background: '#ff4757'}}></div></div>
                    </div>
                </div>
            </div>
            
            <button className="btn-primary" style={styles.exportBtn}>PDF Raporu Olarak Dışa Aktar</button>
        </div>
    );
};

const ReportBox = ({ title, value, icon, color }) => (
    <div className="glass-card" style={styles.reportBox}>
        <div style={{...styles.iconWrapper, color, background: `${color}15`}}>{icon}</div>
        <div>
            <div style={styles.rtTitle}>{title}</div>
            <div style={styles.rtValue}>{value}</div>
        </div>
    </div>
);

const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '30px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '2.2rem', fontWeight: '800' },
    ozetGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
    reportBox: { padding: '25px', display: 'flex', alignItems: 'center', gap: '15px' },
    iconWrapper: { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' },
    rtTitle: { fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' },
    rtValue: { fontSize: '1.5rem', fontWeight: '800' },
    detailRow: { display: 'flex', gap: '25px' },
    detailCard: { flex: 1, padding: '25px' },
    cardTitle: { fontSize: '1.2rem', marginBottom: '20px', fontWeight: '600' },
    list: { display: 'flex', flexDirection: 'column', gap: '15px' },
    listRow: { display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border)' },
    rankBadge: { width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    amountBadge: { background: 'var(--primary-color)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' },
    progressSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
    progressBar: { width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '4px' },
    exportBtn: { width: 'fit-content', transform: 'scale(1.1)', alignSelf: 'center', marginTop: '30px' }
};

export default RaporlamaPage;
