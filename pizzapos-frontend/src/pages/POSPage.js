// src/pages/POSPage.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import storeConfig from '../storeConfig';

const POSPage = () => {
    const [urunler, setUrunler] = useState([]);
    const [categories, setCategories] = useState([]);
    const [masalar, setMasalar] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [sepet, setSepet] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Müşteri & Masa Seçimi
    const [secilenMasaId, setSecilenMasaId] = useState('');
    const [musteriTelefon, setMusteriTelefon] = useState('');
    const [bulunanMusteri, setBulunanMusteri] = useState(null);
    const [odemeSekli, setOdemeSekli] = useState('Nakit');

    useEffect(() => {
        verileriGetir();
    }, []);

    const verileriGetir = async () => {
        try {
            const [urunRes, catRes, masaRes] = await Promise.all([
                axiosInstance.get('/UrunYonetimi/Urunler'),
                axiosInstance.get('/UrunYonetimi/Kategoriler'),
                axiosInstance.get('/MasaYonetimi/Masalar')
            ]);
            setUrunler(urunRes.data);
            setCategories(catRes.data);
            setMasalar(masaRes.data);
            setLoading(false);
        } catch (err) {
            console.error("POS Veri Hatası:", err);
            setLoading(false);
        }
    };

    const musteriSorgula = async () => {
        if(musteriTelefon.length < 10) return;
        try {
            const res = await axiosInstance.get(`/MusteriYonetimi/MusteriSorgula?telefon=${musteriTelefon}`);
            setBulunanMusteri(res.data);
        } catch (err) {
            setBulunanMusteri(null);
        }
    };

    const sepeteEkle = (urun) => {
        // Çeşit kontrolü
        const cesit = urun.cesitler && urun.cesitler.length > 0 ? urun.cesitler[0] : null;
        const urunCesitId = cesit ? cesit.id : 0;
        const urunBirimFiyat = urun.varsayilanFiyat + (cesit ? cesit.ekFiyat : 0);

        const existing = sepet.find(item => item.urunCesitId === urunCesitId && item.urunId === urun.id);
        if (existing) {
            setSepet(sepet.map(item => (item.urunCesitId === urunCesitId && item.urunId === urun.id) ? { ...item, adet: item.adet + 1 } : item));
        } else {
            setSepet([...sepet, {
                urunId: urun.id,
                isim: cesit ? `${urun.isim} (${cesit.cesitAdi})` : urun.isim,
                birimFiyat: urunBirimFiyat,
                urunCesitId: urunCesitId,
                adet: 1
            }]);
        }
    };

    const miktarDegistir = (urunCesitId, delta) => {
        setSepet(sepet.map(item => {
            if (item.urunCesitId === urunCesitId) {
                const newAdet = item.adet + delta;
                return newAdet > 0 ? { ...item, adet: newAdet } : null;
            }
            return item;
        }).filter(Boolean));
    };

    const araToplam = sepet.reduce((acc, item) => acc + (item.birimFiyat * item.adet), 0);
    const vergi = araToplam * 0.10; // %10 KDV
    const genelToplam = araToplam + vergi;

    const siparisTamamla = async () => {
        if (sepet.length === 0) return;
        
        const payload = {
            ToplamTutar: genelToplam,
            MusteriTelefon: musteriTelefon,
            MusteriId: bulunanMusteri?.id,
            MasaId: secilenMasaId ? parseInt(secilenMasaId) : null,
            OdemeSekli: odemeSekli,
            SiparisDetaylari: sepet.map(i => ({
                UrunId: i.urunCesitId, // Backend UrunCesitId bekliyor
                Miktar: i.adet,
                BirimFiyat: i.birimFiyat
            }))
        };

        try {
            await axiosInstance.post('/SiparisYonetimi/YeniSiparisAl', payload);
            alert("✅ Sipariş Reçete ve Stok Entegrasyonuyla Alındı!");
            setSepet([]);
            setMusteriTelefon('');
            setBulunanMusteri(null);
            setSecilenMasaId('');
        } catch (err) {
            alert("❌ Hata: " + (err.response?.data?.Message || "Stok yetersiz olabilir veya reçete tanımlanmamış."));
        }
    };

    if (loading) return <div style={{padding: '50px', color: 'white'}}>Yükleniyor...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.mainContent}>
                {/* 1. ÜRÜN KATALOĞU */}
                <div style={styles.catalog}>
                    <div style={styles.categoryBar}>
                        <button onClick={() => setActiveCategory(null)} style={{...styles.catBtn, color: !activeCategory ? 'var(--primary-color)' : 'white'}}>Tümü</button>
                        {categories.map(c => (
                            <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{...styles.catBtn, color: activeCategory === c.id ? 'var(--primary-color)' : 'white'}}>{c.ad}</button>
                        ))}
                    </div>
                    <div style={styles.productGrid}>
                        {urunler.filter(u => !activeCategory || u.kategoriId === activeCategory).map(urun => (
                            <div key={urun.id} className="glass-card" style={styles.productCard} onClick={() => sepeteEkle(urun)}>
                                <div style={styles.pIcon}>{urun.kategoriAdi === 'İçecekler' ? '🥤' : '🍕'}</div>
                                <div style={{fontWeight: '700'}}>{urun.isim}</div>
                                <div style={{color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: 'bold'}}>{urun.varsayilanFiyat} ₺</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. SİPARİŞ PANELİ (SAĞ TARAF) */}
                <div className="glass-card" style={styles.cartPanel}>
                    <h2 style={{marginBottom: '20px', fontSize: '1.4rem'}}>🛒 Sipariş Detayı</h2>
                    
                    {/* Masa & Müşteri Seçimi */}
                    <div style={styles.selectionArea}>
                        <div style={styles.inputRow}>
                            <select value={secilenMasaId} onChange={(e) => setSecilenMasaId(e.target.value)} style={styles.posInput}>
                                <option value="">Hızlı Satış (Masasız)</option>
                                {masalar.filter(m => m.durum === 'Bos').map(m => <option key={m.id} value={m.id}>{m.masaAdi} ({m.konum})</option>)}
                            </select>
                        </div>
                        <div style={styles.inputRow}>
                            <input 
                                placeholder="Müşteri Tel (Sorgula...)" 
                                value={musteriTelefon} 
                                onChange={(e) => setMusteriTelefon(e.target.value)} 
                                onBlur={musteriSorgula}
                                style={styles.posInput} 
                            />
                            {bulunanMusteri && <div style={styles.customerNotice}>✅ {bulunanMusteri.isim} ({bulunanMusteri.puan} Puan)</div>}
                        </div>
                    </div>

                    {/* Sepet Listesi */}
                    <div style={styles.cartItems}>
                        {sepet.map(item => (
                            <div key={item.urunCesitId} style={styles.cartItem}>
                                <div style={{flex: 1}}>
                                    <div style={{fontWeight: '600'}}>{item.isim}</div>
                                    <div style={{fontSize: '0.8rem', opacity: 0.7}}>{item.birimFiyat} ₺</div>
                                </div>
                                <div style={styles.qtyBox}>
                                    <button onClick={() => miktarDegistir(item.urunCesitId, -1)} style={styles.qtyBtn}>-</button>
                                    <span style={{width: '25px', textAlign: 'center'}}>{item.adet}</span>
                                    <button onClick={() => miktarDegistir(item.urunCesitId, 1)} style={styles.qtyBtn}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Özet & Ödeme */}
                    <div style={styles.summary}>
                        <div style={styles.sumRow}><span>Ara Toplam:</span><span>{araToplam.toFixed(2)} ₺</span></div>
                        <div style={styles.sumRow}><span>Vergi (%10):</span><span>{vergi.toFixed(2)} ₺</span></div>
                        <div style={{...styles.sumRow, fontSize: '1.4rem', fontWeight: '800', borderTop: '1px solid #444', paddingTop: '10px', marginTop: '10px'}}>
                            <span>TOPLAM:</span><span style={{color: 'var(--primary-color)'}}>{genelToplam.toFixed(2)} ₺</span>
                        </div>

                        <select value={odemeSekli} onChange={(e) => setOdemeSekli(e.target.value)} style={{...styles.posInput, marginTop: '20px'}}>
                            <option value="Nakit">Nakit Ödeme</option>
                            <option value="Kredi Kartı">Kredi Kartı</option>
                            <option value="Online">Online / QR</option>
                        </select>

                        <button className="btn-primary" style={styles.checkBtn} onClick={siparisTamamla} disabled={sepet.length === 0}>
                            🚀 SİPARİŞİ TAMAMLA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { height: '100%', display: 'flex', flexDirection: 'column' },
    mainContent: { display: 'flex', gap: '25px', height: 'calc(100vh - 120px)' },
    catalog: { flex: 2, display: 'flex', flexDirection: 'column' },
    categoryBar: { display: 'flex', gap: '15px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' },
    catBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' },
    productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', overflowY: 'auto' },
    productCard: { padding: '25px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' },
    pIcon: { fontSize: '3rem', marginBottom: '10px' },
    cartPanel: { flex: 1, padding: '30px', display: 'flex', flexDirection: 'column' },
    selectionArea: { marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '10px' },
    posInput: { width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', fontSize: '0.9rem', outline: 'none' },
    customerNotice: { fontSize: '0.8rem', color: '#2ecc71', marginTop: '5px', fontWeight: 'bold' },
    cartItems: { flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' },
    cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    qtyBox: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '20px' },
    qtyBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.7 },
    summary: { borderTop: '2px dashed var(--glass-border)', paddingTop: '20px' },
    sumRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)' },
    checkBtn: { width: '100%', padding: '15px', fontSize: '1.2rem', fontWeight: '800', marginTop: '15px' }
};

export default POSPage;