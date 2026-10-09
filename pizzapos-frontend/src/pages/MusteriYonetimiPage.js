import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const MusteriYonetimiPage = () => {
    const [musteriler, setMusteriler] = useState([]);
    const [yeniMusteri, setYeniMusteri] = useState({ Isim: '', Telefon: '', Email: '', Adres: '' });
    const [loading, setLoading] = useState(true);

    const verileriGetir = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/MusteriYonetimi/Musteriler');
            setMusteriler(res.data);
        } catch (err) {
            console.error("Müşteriler yüklenemedi:", err);
            // Eğer backend'de tablo henüz yoksa veya migration yapılmadıysa demo verisi
            if(musteriler.length === 0) {
                setMusteriler([
                    { id: 1, isim: "Ahmet Yılmaz", telefon: "05321234567", puan: 450.50, toplamHarcama: 9010.00, kayitTarihi: new Date().toISOString() },
                    { id: 2, isim: "Ayşe Erdem", telefon: "05059876543", puan: 120.00, toplamHarcama: 2400.00, kayitTarihi: new Date().toISOString() },
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { verileriGetir(); }, []);

    const musteriEkle = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/MusteriYonetimi/MusteriEkle', yeniMusteri);
            setYeniMusteri({ Isim: '', Telefon: '', Email: '', Adres: '' });
            verileriGetir();
        } catch (err) {
            alert("Müşteri kaydedilemedi (Telefon numarası zaten kayıtlı olabilir).");
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>CRM & Müşteri Bağlılığı</h1>
                <p style={styles.subtitle}>Müşterilerinizi tanıyın, harcama alışkanlıklarını görün ve onlara değer katın.</p>
            </header>

            <div style={styles.layout}>
                {/* Sol: Yeni Müşteri Ekleme */}
                <div className="glass-card" style={styles.formCard}>
                    <h3 style={styles.cardTitle}>Yeni Müşteri Kaydı</h3>
                    <form onSubmit={musteriEkle} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Ad Soyad</label>
                            <input type="text" value={yeniMusteri.Isim} onChange={(e) => setYeniMusteri({...yeniMusteri, Isim: e.target.value})} required placeholder="Müşteri İsmi" style={styles.input} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Telefon Numarası</label>
                            <input type="text" value={yeniMusteri.Telefon} onChange={(e) => setYeniMusteri({...yeniMusteri, Telefon: e.target.value})} required placeholder="05XX..." style={styles.input} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>E-Posta (Opsiyonel)</label>
                            <input type="email" value={yeniMusteri.Email} onChange={(e) => setYeniMusteri({...yeniMusteri, Email: e.target.value})} placeholder="...@mail.com" style={styles.input} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Adres Bilgisi</label>
                            <textarea value={yeniMusteri.Adres} onChange={(e) => setYeniMusteri({...yeniMusteri, Adres: e.target.value})} placeholder="Ev/İş Adresi" style={{...styles.input, height: '80px'}}></textarea>
                        </div>
                        <button type="submit" className="btn-primary" style={{marginTop: '10px'}}>👤 Kayıt Et</button>
                    </form>
                </div>

                {/* Sağ: Müşteri Listesi */}
                <div className="glass-card" style={styles.listCard}>
                    <h3 style={styles.cardTitle}>Müşteri Portföyü</h3>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Müşteri</th>
                                    <th style={styles.th}>Telefon</th>
                                    <th style={styles.th}>Harcanan</th>
                                    <th style={styles.th}>Sadakat Puanı</th>
                                    <th style={styles.th}>Durum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {musteriler.map(m => (
                                    <tr key={m.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{fontWeight: '700'}}>{m.isim}</div>
                                            <div style={{fontSize: '0.75rem', opacity: 0.6}}>{new Date(m.kayitTarihi).toLocaleDateString()}'den beri</div>
                                        </td>
                                        <td style={styles.td}>{m.telefon}</td>
                                        <td style={styles.td}>{m.toplamHarcama.toFixed(2)} ₺</td>
                                        <td style={styles.td}><span style={styles.puan}>{m.puan.toFixed(2)} Puan</span></td>
                                        <td style={styles.td}>
                                            <span style={{...styles.badge, background: m.toplamHarcama > 5000 ? 'rgba(255,165,2,0.1)' : 'rgba(255,255,255,0.05)', color: m.toplamHarcama > 5000 ? '#ffa502' : '#a4b0be'}}>
                                                {m.toplamHarcama > 5000 ? '⭐ VIP' : 'Standart'}
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
    container: { display: 'flex', flexDirection: 'column', gap: '30px' },
    header: { marginBottom: '10px' },
    title: { fontSize: '2.2rem', fontWeight: '800', color: '#1e90ff' },
    subtitle: { color: 'var(--text-secondary)' },
    layout: { display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '30px' },
    formCard: { padding: '30px', height: 'fit-content' },
    cardTitle: { fontSize: '1.2rem', marginBottom: '25px', color: 'white', fontWeight: '700' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.85rem', color: 'var(--text-secondary)' },
    input: { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' },
    listCard: { padding: '30px' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' },
    th: { textAlign: 'left', padding: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem' },
    tr: { background: 'rgba(255,255,255,0.02)', transition: 'all 0.3s' },
    td: { padding: '15px', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' },
    puan: { color: '#2ecc71', fontWeight: 'bold' },
    badge: { padding: '5px 12px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: '700' }
};

export default MusteriYonetimiPage;
