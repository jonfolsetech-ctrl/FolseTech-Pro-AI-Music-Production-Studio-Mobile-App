import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import WaveformPlayer from '../components/WaveformPlayer';

function Mastering() {
  const [file, setFile] = useState(null);
  const [settings, setSettings] = useState({
    targetLUFS: -14,
    lra: 11,
    truePeak: -1.5
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.wav', '.mp3', '.flac', '.m4a'] },
    maxFiles: 1
  });

  const handleMaster = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('settings', JSON.stringify(settings));

    try {
      const response = await axios.post('/api/master', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (error) {
      console.error('Mastering failed:', error);
      alert('Mastering failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>🎚️ Audio Mastering</h2>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '2rem' }}>
        Professional loudness normalization with customizable LUFS targets
      </p>
      
      <div {...getRootProps()} className="upload-zone">
        <input {...getInputProps()} />
        {file ? (
          <div>
            <p style={{ fontSize: '1.2rem', color: '#ff6b00', marginBottom: '0.5rem' }}>✓ Selected: {file.name}</p>
            <p style={{ color: '#aaa' }}>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🎧 Upload audio for professional mastering</p>
            <p style={{ color: '#aaa' }}>Loudness normalization for streaming platforms</p>
          </div>
        )}
      </div>

      {file && (
        <>
          <div className="card" style={{ marginTop: '1rem' }}>
            <h4>🎵 Uploaded Audio Preview</h4>
            <WaveformPlayer audioUrl={URL.createObjectURL(file)} height={100} />
          </div>
          <div className="card">
          <h3>⚙️ Mastering Settings</h3>
          <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
            <div className="stat-card" style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ff6b00', fontWeight: 'bold' }}>Target LUFS:</label>
              <input 
                type="number" 
                value={settings.targetLUFS} 
                onChange={(e) => setSettings({...settings, targetLUFS: parseFloat(e.target.value)})}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,107,0,0.1)', border: '1px solid #ff6b00', borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
              />
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Spotify: -14, YouTube: -13, Apple Music: -16</p>
            </div>
            <div className="stat-card" style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ff6b00', fontWeight: 'bold' }}>Loudness Range (LRA):</label>
              <input 
                type="number" 
                value={settings.lra} 
                onChange={(e) => setSettings({...settings, lra: parseFloat(e.target.value)})}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,107,0,0.1)', border: '1px solid #ff6b00', borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
              />
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Typical: 7-20 LU</p>
            </div>
            <div className="stat-card" style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ff6b00', fontWeight: 'bold' }}>True Peak (dB):</label>
              <input 
                type="number" 
                step="0.1"
                value={settings.truePeak} 
                onChange={(e) => setSettings({...settings, truePeak: parseFloat(e.target.value)})}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,107,0,0.1)', border: '1px solid #ff6b00', borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
              />
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Prevents clipping (-1.5 to -2.0)</p>
            </div>
          </div>
          <button className="btn" onClick={handleMaster} disabled={loading} style={{ marginTop: '2rem', width: '100%' }}>
            {loading ? '⏳ Mastering Audio...' : '🎵 Master Audio'}
          </button>
        </div>
        </>
      )}

      {result && (
        <div className="card">
          <h3>✨ Mastered Audio Ready!</h3>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#aaa' }}>Your professionally mastered audio is ready for download</p>
          <WaveformPlayer audioUrl={result.url} />
          <a href={result.url} download className="btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}>
            ⬇️ Download Mastered Audio
          </a>
        </div>
      )}
    </div>
  );
}

export default Mastering;
