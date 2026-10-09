import React, { useState } from 'react';
import storeConfig from '../storeConfig';

const AyarlarPage = () => {
    const [config, setConfig] = useState(storeConfig);
    const [mesaj, setMesaj] = useState(null);

    const kaydet = () => {
        // Normalde burada backend'e istek atılır. Şu an yerel state'de simüle ediyoruz.
        setMesaj("✅ Ayarlar başarıyla kaydedildi.");
        setTimeout(() => setMesaj(null), 3000);
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>İşletme Ayarları</h1>
                <p style={styles.subtitle}>Logonuzu, mağaza isminizi ve sektörel ayarları buradan özelleştirin.</p>
            </header>

            <div style={styles.grid}>
                {/* 1. Mağaza Kimliği */}
                <div className="glass-card" style={styles.card}>
                    <h3 style={styles.cardTitle}>Mağaza Kimliği</h3>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mağaza İsmi</label>
                        <input type="text" value={config.name} onChange={(e) => setConfig({...config, name: e.target.value})} style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Logo Yazısı (Kısa)</label>
                        <input type="text" value={config.logoText} onChange={(e) => setConfig({...config, logoText: e.target.value})} style={styles.input} />
                    </div>
                </div>

                {/* 2. Sektörel Ayarlar */}
                <div className="glass-card" style={styles.card}>
                    <h3 style={styles.cardTitle}>Sektörel Kimlik (Niche)</h3>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Sektör (Örn: Pizza Edition, Cafe Edition)</label>
                        <input type="text" value={config.currentNiche} onChange={(e) => setConfig({...config, currentNiche: e.target.value})} style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Para Birimi Simgesi</label>
                        <select style={styles.input}>
                            <option value="₺">₺ (Türk Lirası)</option>
                            <option value="$">$ (Dolar)</option>
                            <option value="€">€ (Euro)</option>
                        </select>
                    </div>
                </div>

                {/* 3. Vergi ve Fiş Ayarları */}
                <div className="glass-card" style={styles.card}>
                    <h3 style={styles.cardTitle}>Fiş & Vergi Ayarları</h3>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>KDV Oranı (%)</label>
                        <input type="number" defaultValue="10" style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Fiş Alt Bilgi (Teşekkür yazısı)</label>
                        <textarea style={{...styles.input, height: '80px'}} defaultValue="Bizi tercih ettiğiniz için teşekkür ederiz."></textarea>
                    </div>
                </div>

                {/* 4. Genel Güvenlik */}
                <div className="glass-card" style={styles.card}>
                    <h3 style={styles.cardTitle}>Sistem Güvenliği</h3>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Otomatik Çıkış Süresi (Dakika)</label>
                        <input type="number" defaultValue="30" style={styles.input} />
                    </div>
                    <button className="btn-primary" style={{marginTop: '20px', width: '100%', background: '#34495e'}}>Lisans Bilgilerini Görüntüle</button>
                </div>
            </div>

            <div style={styles.footer}>
                {mesaj && <p style={styles.success}>{mesaj}</p>}
                <button className="btn-primary" style={styles.saveBtn} onClick={kaydet}>🛠 Tüm Değişiklikleri Kaydet</button>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '30px' },
    header: { marginBottom: '10px' },
    title: { fontSize: '2.2rem', fontWeight: '800' },
    subtitle: { color: 'var(--text-secondary)' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
    card: { padding: '25px' },
    cardTitle: { fontSize: '1.2rem', marginBottom: '20px', fontWeight: '600', color: 'var(--primary-color)' },
    formGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.9rem', color: 'var(--text-secondary)' },
    input: { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '10px', color: 'white', fontSize: '1rem', outline: 'none' },
    footer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '30px' },
    saveBtn: { padding: '15px 40px', fontSize: '1.1rem' },
    success: { color: '#2ecc71', fontWeight: 'bold' }
};

export default AyarlarPage;
