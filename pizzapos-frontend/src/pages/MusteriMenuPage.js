import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import storeConfig from '../storeConfig';

const MusteriMenuPage = () => {
    const [urunler, setUrunler] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    // AI Chat State
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { role: 'ai', text: `Merhaba! Ben ${storeConfig.name} Akıllı Asistanı. Menümüz hakkında bir şey sormak ister misin? (Örn: '150 TL bütçem var' veya 'Tatlılarda neler var?')` }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { scrollToBottom(); }, [chatMessages]);

    useEffect(() => {
        const verileriGetir = async () => {
            try {
                const [urunRes, catRes] = await Promise.all([
                    axiosInstance.get('/UrunYonetimi/Urunler'),
                    axiosInstance.get('/UrunYonetimi/Kategoriler')
                ]);
                setUrunler(urunRes.data);
                setCategories(catRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Menü yüklenemedi:", err);
                setLoading(false);
            }
        };
        verileriGetir();
    }, []);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const userText = userInput;
        setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
        setUserInput('');
        setIsTyping(true);

        try {
            const res = await axiosInstance.post('/YapayZeka/SoruSor', { Query: userText });
            setChatMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'ai', text: "Üzgünüm, şu an bağlantım kesildi. Menüye bakmaya devam edebilirsin!" }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (loading) return <div style={{padding: '50px', textAlign: 'center', color: 'white'}}>Lezzetler yükleniyor... 🍕</div>;

    return (
        <div style={styles.container}>
            {/* Header: Şık Mağaza İsmi */}
            <header style={styles.menuHeader}>
                <h2 style={styles.logo}>{storeConfig.name}</h2>
                <p style={styles.tagline}>Gerçek Lezzet, Akıllı Seçim</p>
            </header>

            {/* Kategoriler: Yatay Kaydırma */}
            <div style={styles.categoryBar}>
                <button onClick={() => setActiveCategory(null)} style={{...styles.catBtn, background: !activeCategory ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}}>Tümü</button>
                {categories.map(c => (
                    <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{...styles.catBtn, background: activeCategory === c.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}}>{c.ad}</button>
                ))}
            </div>

            {/* Ürün Listesi: Modern Kartlar */}
            <div style={styles.menuList}>
                {urunler.filter(u => !activeCategory || u.kategoriId === activeCategory).map(urun => (
                    <div key={urun.id} className="glass-card" style={styles.productCard}>
                        <div style={styles.pInfo}>
                            <h3 style={styles.pTitle}>{urun.isim}</h3>
                            <p style={styles.pDesc}>{urun.kategoriAdi} kategorisinde en taze ürünlerimizden biri.</p>
                            <span style={styles.pPrice}>{urun.varsayilanFiyat} ₺</span>
                        </div>
                        <div style={styles.pEmoji}>{urun.kategoriAdi === 'İçecekler' ? '🥤' : '🍕'}</div>
                    </div>
                ))}
            </div>

            {/* AI CHAT ASİSTAN BUTONU VE PENCERESİ */}
            <div style={styles.aiWrapper}>
                {!isAIChatOpen && (
                    <button style={styles.aiOpenBtn} onClick={() => setIsAIChatOpen(true)}>
                        🤖 AI Asistan'a Sor
                    </button>
                )}

                {isAIChatOpen && (
                    <div className="glass-card" style={styles.aiChatWindow}>
                        <div style={styles.chatHeader}>
                            <span>🤖 Akıllı Garson</span>
                            <button onClick={() => setIsAIChatOpen(false)} style={styles.closeBtn}>×</button>
                        </div>
                        <div style={styles.chatBody}>
                            {chatMessages.map((m, i) => (
                                <div key={i} style={{...styles.message, alignSelf: m.role === 'ai' ? 'flex-start' : 'flex-end', background: m.role === 'ai' ? 'rgba(255,255,255,0.1)' : 'var(--primary-color)'}}>
                                    {m.text}
                                </div>
                            ))}
                            {isTyping && <div style={{...styles.message, alignSelf: 'flex-start', opacity: 0.5}}>... yazıyor</div>}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={sendMessage} style={styles.chatFooter}>
                            <input value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Sorunu buraya yaz..." style={styles.chatInput} />
                            <button type="submit" style={styles.sendBtn}>➤</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '600px', margin: '0 auto', padding: '20px', minHeight: '100vh', background: 'linear-gradient(to bottom, #141a21, #0a0e12)', color: 'white' },
    menuHeader: { textAlign: 'center', marginBottom: '30px', padding: '20px 0' },
    logo: { fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' },
    tagline: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '5px' },
    categoryBar: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '20px' },
    catBtn: { border: 'none', padding: '8px 20px', borderRadius: '25px', color: 'white', fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap', cursor: 'pointer' },
    menuList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    productCard: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRight: '5px solid var(--primary-color)' },
    pTitle: { fontSize: '1.2rem', fontWeight: '700', marginBottom: '5px' },
    pDesc: { fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' },
    pPrice: { fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-color)' },
    pEmoji: { fontSize: '2.5rem' },
    
    // AI Styles
    aiWrapper: { position: 'fixed', bottom: '30px', right: '30px', left: '30px', display: 'flex', justifyContent: 'center', zIndex: 1000 },
    aiOpenBtn: { background: 'var(--primary-color)', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', cursor: 'pointer' },
    aiChatWindow: { position: 'fixed', bottom: '100px', left: '20px', right: '20px', maxWidth: '400px', margin: '0 auto', height: '450px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 },
    chatHeader: { padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', background: 'rgba(255,255,255,0.03)' },
    closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' },
    chatBody: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
    message: { maxWidth: '80%', padding: '12px 16px', borderRadius: '15px', fontSize: '0.9rem', lineHeight: '1.4' },
    chatFooter: { padding: '15px', display: 'flex', gap: '10px', borderTop: '1px solid var(--glass-border)' },
    chatInput: { flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '25px', color: 'white', outline: 'none' },
    sendBtn: { background: 'var(--primary-color)', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }
};

export default MusteriMenuPage;
