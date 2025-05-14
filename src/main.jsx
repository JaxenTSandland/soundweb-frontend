import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Callback from './Auth/callback.jsx';

function Root() {
    const [user, setUser] = useState(null);
    console.log(user);
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App user={user} setUser={setUser} />} />
                <Route path="/callback" element={<Callback setUser={setUser} />} />
            </Routes>
        </Router>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Root />
    </StrictMode>
);