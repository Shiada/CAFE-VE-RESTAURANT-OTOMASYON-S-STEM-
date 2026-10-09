import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; 
import useAuth from '../hooks/useAuth';

const StokYonetimiPage = () => {
    const [malzemeler, setMalzemeler] = useState([]);
    const [malzemeAdi, setMalzemeAdi] = useState('');
    const [stokMiktari, setStokMiktari] = useState('');
    const [birimMaliyet, setBirimMaliyet] = useState('');
    const [birim, setBirim] = useState('kg');
    const [kritikSeviye, setKritikSeviye] = useState('1.0');
    
    const [loading, setLoading] = useState(true);
    const [hata, setHata] = useState(null);
    const [mesaj, setMesaj] = useState(null);
    const { role } = useAuth(); 

    const [urunListesi, setUrunListesi] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const malRes = await axiosInstance.get('/StokYonetimi/Malzemeler');
            setMalzemeler(malRes.data);
            
            const urunRes = await axiosInstance.get('/UrunYonetimi/Urunler');
            setUrunListesi(urunRes.data);
        } catch (err) {
            console.error("Veri çekme hatası:", err);
            setHata("Veriler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (role === 'Yonetici') {
            fetchData();
        }
    }, [role]);

    const malzemeEkle = async (e) => {
        e.preventDefault();
        setHata(null);
        setMesaj(null);
        try {
            const yeniMalzeme = {
                Isim: malzemeAdi,
                StokMiktari: parseFloat(stokMiktari),
                SonBirimMaliyet: parseFloat(birimMaliyet),
                Birim: birim,
                KritikSeviye: parseFloat(kritikSeviye)
            };
            
            await axiosInstance.post('/StokYonetimi/MalzemeEkle', yeniMalzeme);
            setMesaj("✅ Hammadde başarıyla eklendi.");
            setMalzemeAdi('');
            setStokMiktari('');
            setBirimMaliyet('');
            fetchData(); 
        } catch (err) {
            setHata("❌ Hammadde eklenirken hata oluştu.");
        }
    };

    if (role !== 'Yonetici') {
        return <div style={{padding: '100px', textAlign: 'center', color: 'white'}}>Bu sayfaya erişim yetkiniz yok.</div>;
    }

    return (
        <div className="page-container">
            <div className="glass-card" style={styles.headerCard}>
                <div>
                    <h1 style={styles.headerTitle}>Stok & Hammadde Yönetimi</h1>
                    <p style={styles.headerSubtitle}>İşletmenizin hammadde stoklarını ve maliyetlerini buradan yönetebilirsiniz.</p>
                </div>
                <div style={styles.statsRow}>
                    <div style={styles.statBox}>
                        <span style={styles.statValue}>{malzemeler.length}</span>
                        <span style={styles.statLabel}>Toplam Kalem</span>
                    </div>
                </div>
            </div>

            <div style={styles.mainGrid}>
                {/* Sol Taraf: Ekleme Formu */}
                <div className="glass-card" style={styles.formContainer}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconCircle}>📦</div>
                        <h2 style={styles.cardTitle}>Yeni Hammadde Tanımla</h2>
                    </div>
                    
                    <form onSubmit={malzemeEkle} style={styles.form}>
                        <div style={styles.inputWrapper}>
                            <label style={styles.label}>Hammadde Adı</label>
                            <input 
                                type="text" 
                                value={malzemeAdi} 
                                onChange={(e) => setMalzemeAdi(e.target.value)} 
                                required 
                                placeholder="Örn: Mozzarella Peyniri" 
                                style={styles.input} 
                            />
                        </div>

                        <div style={styles.row}>
                            <div style={{...styles.inputWrapper, flex: 2}}>
                                <label style={styles.label}>Stok Miktarı</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    value={stokMiktari} 
                                    onChange={(e) => setStokMiktari(e.target.value)} 
                                    required 
                                    placeholder="0.00" 
                                    style={styles.input} 
                                />
                            </div>
                            <div style={{...styles.inputWrapper, flex: 1}}>
                                <label style={styles.label}>Birim</label>
                                <select 
                                    value={birim} 
                                    onChange={(e) => setBirim(e.target.value)} 
                                    style={styles.select}
                                >
                                    <option value="kg">kg</option>
                                    <option value="litre">litre</option>
                                    <option value="adet">adet</option>
                                    <option value="gram">gram</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.inputWrapper}>
                            <label style={styles.label}>Birim Maliyet (₺)</label>
                            <div style={styles.currencyInputWrapper}>
                                <span style={styles.currencySymbol}>₺</span>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    value={birimMaliyet} 
                                    onChange={(e) => setBirimMaliyet(e.target.value)} 
                                    required 
                                    placeholder="0.00" 
                                    style={styles.currencyInput} 
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={styles.submitBtn}>
                            🚀 Hammaddeyi Kaydet
                        </button>
                    </form>

                    {mesaj && <p style={styles.successMsg}>{mesaj}</p>}
                    {hata && <p style={styles.errorMsg}>{hata}</p>}
                </div>

                {/* Sağ Taraf: Liste */}
                <div className="glass-card" style={styles.listContainer}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconCircle}>📊</div>
                        <h2 style={styles.cardTitle}>Mevcut Stok Durumu</h2>
                    </div>
                    
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Hammadde</th>
                                    <th style={styles.th}>Stok</th>
                                    <th style={styles.th}>Birim</th>
                                    <th style={styles.th}>Maliyet</th>
                                    <th style={styles.th}>Durum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {malzemeler.map(mal => (
                                    <tr key={mal.id} style={styles.tr}>
                                        <td style={styles.td}><b>{mal.isim}</b></td>
                                        <td style={styles.td}>{mal.stokMiktari}</td>
                                        <td style={styles.td}><span style={styles.birimBadge}>{mal.birim}</span></td>
                                        <td style={{...styles.td, color: 'var(--primary-color)', fontWeight: '600'}}>{mal.sonBirimMaliyet} ₺</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                background: mal.stokMiktari <= mal.kritikSeviye ? 'rgba(231, 76, 60, 0.15)' : 'rgba(46, 204, 113, 0.15)',
                                                color: mal.stokMiktari <= mal.kritikSeviye ? '#ff4757' : '#2ed573',
                                                border: `1px solid ${mal.stokMiktari <= mal.kritikSeviye ? 'rgba(231, 76, 60, 0.3)' : 'rgba(46, 204, 113, 0.3)'}`
                                            }}>
                                                {mal.stokMiktari <= mal.kritikSeviye ? '⚠️ KRİTİK' : '✅ YETERLİ'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    headerCard: {
        marginBottom: '30px',
        padding: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to right, rgba(255,255,255,0.05), rgba(255, 255, 255, 0.02))'
    },
    headerTitle: { color: 'var(--primary-color)', fontSize: '2.2rem', fontWeight: '700', marginBottom: '5px' },
    headerSubtitle: { color: 'var(--text-secondary)', fontSize: '1rem' },
    statsRow: { display: 'flex', gap: '20px' },
    statBox: { textAlign: 'center', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid var(--glass-border)' },
    statValue: { display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'white' },
    statLabel: { fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' },
    
    mainGrid: { display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '30px' },
    
    formContainer: { padding: '30px', height: 'fit-content' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' },
    iconCircle: { width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
    cardTitle: { fontSize: '1.3rem', fontWeight: '600', color: 'white' },
    
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputWrapper: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' },
    input: {
        width: '100%',
        padding: '14px',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s ease'
    },
    select: {
        width: '100%',
        padding: '14px',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        cursor: 'pointer'
    },
    row: { display: 'flex', gap: '15px' },
    
    currencyInputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    currencySymbol: { position: 'absolute', left: '15px', color: 'var(--primary-color)', fontWeight: 'bold' },
    currencyInput: {
        width: '100%',
        padding: '14px 14px 14px 35px',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none'
    },
    
    submitBtn: { width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '10px' },
    
    successMsg: { color: '#2ecc71', background: 'rgba(46, 204, 113, 0.1)', padding: '12px', borderRadius: '10px', marginTop: '20px', textAlign: 'center', border: '1px solid rgba(46, 204, 113, 0.2)' },
    errorMsg: { color: '#ff4757', background: 'rgba(255, 71, 87, 0.1)', padding: '12px', borderRadius: '10px', marginTop: '20px', textAlign: 'center', border: '1px solid rgba(255, 71, 87, 0.2)' },
    
    listContainer: { padding: '30px' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' },
    th: { textAlign: 'left', padding: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' },
    tr: { background: 'rgba(255,255,255,0.02)', transition: 'all 0.3s ease' },
    td: { padding: '18px 15px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    birimBadge: { background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' },
    statusBadge: { padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }
};

export default StokYonetimiPage;