import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const ReceteYonetimiPage = () => {
    const [receteler, setReceteler] = useState([]);
    const [urunCesitleri, setUrunCesitleri] = useState([]);
    const [malzemeler, setMalzemeler] = useState([]);
    
    const [secilenUrunCesitId, setSecilenUrunCesitId] = useState('');
    const [secilenMalzemeId, setSecilenMalzemeId] = useState('');
    const [miktar, setMiktar] = useState('');
    
    const [loading, setLoading] = useState(true);

    const verileriGetir = async () => {
        setLoading(true);
        try {
            const [receteRes, urunRes, malRes] = await Promise.all([
                axiosInstance.get('/ReceteYonetimi/Receteler'),
                axiosInstance.get('/UrunYonetimi/Urunler'), // Urun listesi içinde çeşitlerde gelir
                axiosInstance.get('/StokYonetimi/Malzemeler')
            ]);
            
            setReceteler(receteRes.data);
            setMalzemeler(malRes.data);
            
            // Tüm ürünlerin içindeki çeşitleri tek bir listeye toplayalım
            const tumCesitler = [];
            urunRes.data.forEach(urun => {
                if(urun.cesitler) {
                    urun.cesitler.forEach(cesit => {
                        tumCesitler.push({
                            id: cesit.id,
                            display: `${urun.isim} (${cesit.cesitAdi})`
                        });
                    });
                }
            });
            setUrunCesitleri(tumCesitler);
            
        } catch (err) {
            console.error("Veriler yüklenemedi:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { verileriGetir(); }, []);

    const receteEkle = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/ReceteYonetimi/ReceteEkle', {
                UrunCesitId: parseInt(secilenUrunCesitId),
                MalzemeId: parseInt(secilenMalzemeId),
                KullanilanMiktar: parseFloat(miktar)
            });
            setMiktar('');
            verileriGetir();
        } catch (err) {
            alert("Reçete eklenemedi.");
        }
    };

    const receteSil = async (id) => {
        if(!window.confirm("Bu reçete kaydını silmek istediğinize emin misiniz?")) return;
        try {
            await axiosInstance.delete(`/ReceteYonetimi/ReceteSil/${id}`);
            verileriGetir();
        } catch (err) {
            alert("Silme hatası.");
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Reçete & Üretim Yönetimi</h1>
                <p style={styles.subtitle}>Hangi ürün satıldığında hangi malzemeden ne kadar düşeceğini belirleyin.</p>
            </header>

            <div style={styles.mainGrid}>
                {/* Sol: Reçete Ekleme Formu */}
                <div className="glass-card" style={styles.formCard}>
                    <h3 style={styles.cardTitle}>Yeni İçerik Tanımla</h3>
                    <form onSubmit={receteEkle} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Ürün Çeşidi</label>
                            <select value={secilenUrunCesitId} onChange={(e) => setSecilenUrunCesitId(e.target.value)} required style={styles.select}>
                                <option value="">Seçiniz...</option>
                                {urunCesitleri.map(uc => <option key={uc.id} value={uc.id}>{uc.display}</option>)}
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Kullanılan Malzeme</label>
                            <select value={secilenMalzemeId} onChange={(e) => setSecilenMalzemeId(e.target.value)} required style={styles.select}>
                                <option value="">Seçiniz...</option>
                                {malzemeler.map(m => <option key={m.id} value={m.id}>{m.isim} ({m.birim})</option>)}
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Miktar</label>
                            <input type="number" step="0.0001" value={miktar} onChange={(e) => setMiktar(e.target.value)} required placeholder="Örn: 0.200" style={styles.input} />
                        </div>
                        <button type="submit" className="btn-primary" style={{marginTop: '10px'}}>🔄 Reçeteye Ekle</button>
                    </form>
                </div>

                {/* Sağ: Mevcut Reçeteler Tablosu */}
                <div className="glass-card" style={styles.listCard}>
                    <h3 style={styles.cardTitle}>Tanımlı Reçeteler</h3>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Ürün</th>
                                    <th style={styles.th}>Malzeme</th>
                                    <th style={styles.th}>Miktar</th>
                                    <th style={styles.th}>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receteler.map(r => (
                                    <tr key={r.id} style={styles.tr}>
                                        <td style={styles.td}><b>{r.urunCesit?.urun?.isim}</b> <span style={{fontSize: '0.8rem', opacity: 0.7}}>({r.urunCesit?.cesitAdi})</span></td>
                                        <td style={styles.td}>{r.malzeme?.isim}</td>
                                        <td style={styles.td}>{r.kullanilanMiktar} {r.malzeme?.birim}</td>
                                        <td style={styles.td}>
                                            <button onClick={() => receteSil(r.id)} style={styles.deleteBtn}>Sil</button>
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
    container: { display: 'flex', flexDirection: 'column', gap: '30px' },
    header: { marginBottom: '10px' },
    title: { fontSize: '2.2rem', fontWeight: '800', color: '#ffa502' },
    subtitle: { color: 'var(--text-secondary)' },
    mainGrid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '25px' },
    formCard: { padding: '25px', height: 'fit-content' },
    cardTitle: { fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.85rem', color: 'var(--text-secondary)' },
    input: { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '10px', color: 'white', outline: 'none' },
    select: { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '10px', color: 'white', outline: 'none', cursor: 'pointer' },
    listCard: { padding: '25px' },
    tableWrapper: { overflowY: 'auto', maxHeight: '600px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.85rem' },
    tr: { borderBottom: '1px solid var(--glass-border)' },
    td: { padding: '15px 12px' },
    deleteBtn: { background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }
};

export default ReceteYonetimiPage;
