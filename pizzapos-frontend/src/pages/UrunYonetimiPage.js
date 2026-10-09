import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; 

const UrunYonetimiPage = () => {
    const [urunler, setUrunler] = useState([]);
    const [kategoriler, setKategoriler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hata, setHata] = useState(null);
    const [basari, setBasari] = useState(null);
    
    // Form Inputları
    const [urunIsim, setUrunIsim] = useState('');           
    const [urunAciklama, setUrunAciklama] = useState('');   
    const [urunFiyati, setUrunFiyati] = useState('');      
    const [secilenKategoriId, setSecilenKategoriId] = useState('');       

    const verileriGetir = async () => {
        setLoading(true);
        try {
            const [urunRes, catRes] = await Promise.all([
                axiosInstance.get('/UrunYonetimi/Urunler'),
                axiosInstance.get('/UrunYonetimi/Kategoriler')
            ]);
            setUrunler(urunRes.data); 
            setKategoriler(catRes.data);
            if(catRes.data.length > 0) setSecilenKategoriId(catRes.data[0].id);
        } catch (err) {
            setHata("Veriler sunucudan alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { verileriGetir(); }, []); 

    const urunEkle = async (e) => {
        e.preventDefault();
        setHata(null);
        setBasari(null);
        
        try {
            const yeniUrun = {
                Isim: urunIsim, 
                Aciklama: urunAciklama,
                Fiyat: parseFloat(urunFiyati),
                KategoriId: parseInt(secilenKategoriId),
                Cesitler: [], 
            };
            
            await axiosInstance.post('/UrunYonetimi/UrunEkle', yeniUrun);
            
            setUrunIsim('');
            setUrunAciklama('');
            setUrunFiyati('');
            verileriGetir();
            setBasari("Ürün başarıyla kataloğa eklendi."); 
        } catch (err) {
            setHata(err.response?.data?.Message || "Ürün eklenirken bir hata oluştu.");
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Ürün & Katalog Yönetimi</h1>
                <p style={styles.subtitle}>Menü içeriklerini, fiyatları ve kategorileri buradan yönetin.</p>
            </header>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '30px'}}>
                {/* Sol: Ekleme Formu */}
                <div className="glass-card" style={styles.formCard}>
                    <h2 style={styles.cardTitle}>Yeni Ürün Ekle</h2>
                    <form onSubmit={urunEkle} style={styles.form}>
                        <div className="form-group" style={styles.formGroup}>
                            <label style={styles.label}>Ürün Adı</label>
                            <input value={urunIsim} onChange={(e) => setUrunIsim(e.target.value)} required placeholder="Örn: Margarita Pizza" style={styles.input} />
                        </div>
                        <div className="form-group" style={styles.formGroup}>
                            <label style={styles.label}>Kategori</label>
                            <select value={secilenKategoriId} onChange={(e) => setSecilenKategoriId(e.target.value)} style={styles.input}>
                                {kategoriler.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.ad}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={styles.formGroup}>
                            <label style={styles.label}>Birim Fiyat (₺)</label>
                            <input type="number" step="0.01" value={urunFiyati} onChange={(e) => setUrunFiyati(e.target.value)} required placeholder="150.00" style={styles.input} />
                        </div>
                        <div className="form-group" style={styles.formGroup}>
                            <label style={styles.label}>Açıklama</label>
                            <textarea value={urunAciklama} onChange={(e) => setUrunAciklama(e.target.value)} placeholder="İçerik bilgisi..." style={{...styles.input, height: '80px', resize: 'none'}} />
                        </div>
                        <button type="submit" className="glass-button" style={styles.addBtn}>Katalogda Yayınla</button>
                    </form>
                    {basari && <div style={styles.successMsg}>{basari}</div>}
                    {hata && <div style={styles.errorMsg}>{hata}</div>}
                </div>

                {/* Sağ: Liste */}
                <div className="glass-card" style={styles.tableCard}>
                    <h2 style={styles.cardTitle}>Yayındaki Ürünler</h2>
                    {loading ? (
                        <p style={{padding: '20px'}}>Yükleniyor...</p>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Ürün</th>
                                    <th style={styles.th}>Kategori</th>
                                    <th style={styles.th}>Fiyat</th>
                                    <th style={styles.th}>Açıklama</th>
                                    <th style={styles.th}>Durum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {urunler.map(urun => (
                                    <tr key={urun.id} style={styles.tr}>
                                        <td style={styles.td}><b>{urun.isim}</b></td>
                                        <td style={styles.td}>{urun.kategoriAdi}</td>
                                        <td style={{...styles.td, color: 'var(--primary-color)', fontWeight: 'bold'}}>{urun.varsayilanFiyat} ₺</td>
                                        <td style={{...styles.td, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{urun.aciklama || '-'}</td>
                                        <td style={styles.td}>
                                            <span style={styles.statusBadge}>Aktif</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '30px' },
    header: { marginBottom: '10px' },
    title: { fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)' },
    subtitle: { color: 'var(--text-secondary)' },
    formCard: { padding: '25px', height: 'fit-content' },
    cardTitle: { fontSize: '1.2rem', marginBottom: '20px', fontWeight: '600' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.9rem', color: 'var(--text-secondary)' },
    input: { padding: '12px 15px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white', outline: 'none' },
    addBtn: { width: '100%', marginTop: '10px' },
    successMsg: { marginTop: '15px', color: '#2ecc71', fontSize: '0.9rem', textAlign: 'center' },
    errorMsg: { marginTop: '15px', color: '#e74c3c', fontSize: '0.9rem', textAlign: 'center' },
    tableCard: { padding: '25px', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '15px', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' },
    td: { padding: '15px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.95rem' },
    tr: { transition: 'background 0.3s', '&:hover': { background: 'rgba(255,255,255,0.02)' } },
    statusBadge: { background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }
};

export default UrunYonetimiPage;