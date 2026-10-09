import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard'; 
import Sidebar from './components/Sidebar'; 
import UrunYonetimiPage from './pages/UrunYonetimiPage';
import StokYonetimiPage from './pages/StokYonetimiPage';
import POSPage from './pages/POSPage';
import MasaYonetimiPage from './pages/MasaYonetimiPage';
import MutfakPage from './pages/MutfakPage';
import RaporlamaPage from './pages/RaporlamaPage';
import AyarlarPage from './pages/AyarlarPage';
import MusteriYonetimiPage from './pages/MusteriYonetimiPage';
import ReceteYonetimiPage from './pages/ReceteYonetimiPage';
import MusteriMenuPage from './pages/MusteriMenuPage'; // AI Menü Sayfası

const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('authToken'); 
    
    if (!isAuthenticated) return <Navigate to="/login" />;

    return (
        <div className="app-container">
            <Sidebar /> 
            <div className="main-content">
                {children}
            </div>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/menu" element={<MusteriMenuPage />} /> {/* 🤖 Public AI Menü */}
                
                <Route path="/" element={ <PrivateRoute><Dashboard /></PrivateRoute> } />
                <Route path="/pos" element={ <PrivateRoute><POSPage /></PrivateRoute> } />
                <Route path="/masalar" element={ <PrivateRoute><MasaYonetimiPage /></PrivateRoute> } />
                <Route path="/mutfak" element={ <PrivateRoute><MutfakPage /></PrivateRoute> } />
                <Route path="/crm" element={ <PrivateRoute><MusteriYonetimiPage /></PrivateRoute> } />
                <Route path="/recete" element={ <PrivateRoute><ReceteYonetimiPage /></PrivateRoute> } />
                <Route path="/urunler" element={ <PrivateRoute><UrunYonetimiPage /></PrivateRoute> } />
                <Route path="/stok" element={ <PrivateRoute><StokYonetimiPage /></PrivateRoute> } />
                <Route path="/rapor" element={ <PrivateRoute><RaporlamaPage /></PrivateRoute> } />
                <Route path="/ayarlar" element={ <PrivateRoute><AyarlarPage /></PrivateRoute> } />
                
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;