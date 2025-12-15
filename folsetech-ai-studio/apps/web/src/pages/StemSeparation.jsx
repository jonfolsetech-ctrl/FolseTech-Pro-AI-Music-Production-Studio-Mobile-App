import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import WaveformPlayer from '../components/WaveformPlayer';

function StemSeparation() {
  const [file, setFile] = useState(null);
  const [stems, setStems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
    setStems(null);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.wav', '.mp3', '.flac', '.m4a'] },
    maxFiles: 1
  });

  const handleSeparate = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await axios.post('/api/separate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      setStems(response.data.stems);
    } catch (error) {
      console.error('Separation failed:', error);
      alert('Stem separation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>🎸 Stem Separation</h2>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '2rem' }}>
        Separate vocals, drums, bass, and other instruments using AI-powered Demucs technology
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
            <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🎵 Drag & drop an audio file here</p>
            <p style={{ color: '#aaa' }}>We'll separate it into individual stems</p>
          </div>
        )}
      </div>

      {file && (
        <>
          <div className="card" style={{ marginTop: '1rem' }}>
            <h4>🎵 Audio Preview</h4>
            <WaveformPlayer audioUrl={URL.createObjectURL(file)} height={100} />
          </div>
          <button className="btn" onClick={handleSeparate} disabled={loading} style={{ marginTop: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
          {loading ? '⏳ Separating Stems...' : '✨ Separate Stems'}
        </button>
        </>
      )}

      {loading && (
        <div className="card">
          <h3>🔄 Processing...</h3>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <p style={{ textAlign: 'center', color: '#aaa' }}>{progress}% complete</p>
        </div>
      )}

      {stems && (
        <div className="card">
          <h3>✅ Separated Stems Ready!</h3>
          <div className="feature-list">
            {stems.map((stem, idx) => (
              <div key={idx} className="feature-card" style={{ textAlign: 'left' }}>
                <h4 style={{ textAlign: 'center' }}>🎶 {stem.name}</h4>
                <WaveformPlayer audioUrl={stem.url} height={100} />
                <a href={stem.url} download className="btn" style={{ marginTop: '1rem', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  ⬇️ Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StemSeparation;
