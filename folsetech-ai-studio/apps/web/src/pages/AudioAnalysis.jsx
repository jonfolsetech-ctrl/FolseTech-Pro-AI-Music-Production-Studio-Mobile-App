import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import WaveformPlayer from '../components/WaveformPlayer';

function AudioAnalysis() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
    setAnalysis(null);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.wav', '.mp3', '.flac', '.m4a'] },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await axios.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysis(response.data);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>🎼 Audio Analysis</h2>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '2rem' }}>
        Analyze your audio files for detailed insights including tempo, key, loudness, and spectral features
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
            <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📁 Drag & drop an audio file here, or click to select</p>
            <p style={{ color: '#aaa' }}>Supports: MP3, WAV, FLAC, M4A</p>
          </div>
        )}
      </div>

      {file && (
        <>
          <div className="card" style={{ marginTop: '1rem' }}>
            <h4>🎵 Preview</h4>
            <WaveformPlayer audioUrl={URL.createObjectURL(file)} height={100} />
          </div>
          <button className="btn" onClick={handleAnalyze} disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Analyzing...' : 'Analyze Audio'}
        </button>
        </>
      )}

      {analysis && (
        <div className="card">
          <h3>✨ Analysis Results</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="label">Duration</div>
              <div className="value" style={{ fontSize: '1.5rem' }}>{analysis.duration?.toFixed(2)}s</div>
            </div>
            <div className="stat-card">
              <div className="label">Tempo</div>
              <div className="value" style={{ fontSize: '1.5rem' }}>{analysis.tempo?.toFixed(1)} BPM</div>
            </div>
            <div className="stat-card">
              <div className="label">Key</div>
              <div className="value" style={{ fontSize: '1.5rem' }}>{analysis.key}</div>
            </div>
            <div className="stat-card">
              <div className="label">Sample Rate</div>
              <div className="value" style={{ fontSize: '1.5rem' }}>{(analysis.sample_rate / 1000).toFixed(1)}kHz</div>
            </div>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ color: '#ff6b00', marginBottom: '1rem' }}>Detailed Metrics</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,107,0,0.2)' }}>
                <strong>Peak Level:</strong> {analysis.peak_level?.toFixed(2)} dB
              </li>
              <li style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,107,0,0.2)' }}>
                <strong>RMS Level:</strong> {analysis.rms_level?.toFixed(2)} dB
              </li>
              <li style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,107,0,0.2)' }}>
                <strong>Dynamic Range:</strong> {analysis.dynamic_range?.toFixed(2)} dB
              </li>
              <li style={{ padding: '0.5rem' }}>
                <strong>Channels:</strong> {analysis.channels === 1 ? 'Mono' : 'Stereo'}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioAnalysis;
