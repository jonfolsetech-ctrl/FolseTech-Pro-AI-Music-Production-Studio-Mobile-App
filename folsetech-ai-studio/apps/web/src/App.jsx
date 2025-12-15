import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import AudioAnalysis from './pages/AudioAnalysis';
import SongGenerator from './pages/SpeechToText';
import VoiceCloning from './pages/VoiceCloning';
import StemSeparation from './pages/StemSeparation';
import Mastering from './pages/Mastering';

// Firebase will be initialized when credentials are provided
export const auth = null;
export const db = null;
export const storage = null;

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h1>FolseTech AI Pro Music Production Studio</h1>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/studio">Studio</Link></li>
            <li><Link to="/analysis">Audio Analysis</Link></li>
            <li><Link to="/speech">Song Generator</Link></li>
            <li><Link to="/voice-clone">Voice Cloning</Link></li>
            <li><Link to="/stems">Stem Separation</Link></li>
            <li><Link to="/mastering">Mastering</Link></li>
          </ul>
        </nav>
        <main className="container">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/analysis" element={<AudioAnalysis />} />
            <Route path="/speech" element={<SongGenerator />} />
            <Route path="/voice-clone" element={<VoiceCloning />} />
            <Route path="/stems" element={<StemSeparation />} />
            <Route path="/mastering" element={<Mastering />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
