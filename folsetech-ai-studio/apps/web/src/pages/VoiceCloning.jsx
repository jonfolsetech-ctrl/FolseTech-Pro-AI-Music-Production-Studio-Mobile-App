import React, { useState } from 'react';
import axios from 'axios';
import WaveformPlayer from '../components/WaveformPlayer';

function VoiceCloning() {
  const [text, setText] = useState('');
  const [voiceSample, setVoiceSample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('speech'); // 'speech' or 'sing'

  const handleClone = async () => {
    if (!text || !voiceSample) return;

    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('audio', voiceSample);
    formData.append('text', text);
    formData.append('mode', mode);

    try {
      const response = await axios.post('/api/voice-clone', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (error) {
      console.error('Voice cloning failed:', error);
      alert('Voice cloning failed. This feature requires AI service to be running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>🎤 Voice Cloning & Text-to-Sing</h2>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '2rem' }}>
        Clone any voice and generate speech or singing with custom text
      </p>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div 
          className={`stat-card ${mode === 'speech' ? 'active' : ''}`}
          onClick={() => setMode('speech')}
          style={{ 
            cursor: 'pointer', 
            background: mode === 'speech' ? 'rgba(255, 107, 0, 0.3)' : 'rgba(255, 107, 0, 0.1)',
            border: mode === 'speech' ? '2px solid #ff6b00' : '1px solid rgba(255, 107, 0, 0.3)'
          }}
        >
          <div className="label">Mode</div>
          <div className="value" style={{ fontSize: '1.5rem' }}>🗣️ Speech</div>
        </div>
        <div 
          className={`stat-card ${mode === 'sing' ? 'active' : ''}`}
          onClick={() => setMode('sing')}
          style={{ 
            cursor: 'pointer',
            background: mode === 'sing' ? 'rgba(255, 107, 0, 0.3)' : 'rgba(255, 107, 0, 0.1)',
            border: mode === 'sing' ? '2px solid #ff6b00' : '1px solid rgba(255, 107, 0, 0.3)'
          }}
        >
          <div className="label">Mode</div>
          <div className="value" style={{ fontSize: '1.5rem' }}>🎵 Sing</div>
        </div>
      </div>
      
      <div className="card">
        <h3>📁 Upload Voice Sample</h3>
        <p style={{ color: '#aaa', marginBottom: '1rem' }}>Upload a clean audio sample of the voice you want to clone (10-30 seconds recommended)</p>
        <label className="upload-zone" style={{ padding: '2rem', cursor: 'pointer' }}>
          <input 
            type="file" 
            accept="audio/*" 
            onChange={(e) => setVoiceSample(e.target.files[0])}
            style={{ display: 'none' }}
          />
          {voiceSample ? (
            <div>
              <p style={{ fontSize: '1.2rem', color: '#ff6b00' }}>✓ {voiceSample.name}</p>
              <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Size: {(voiceSample.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '1.2rem' }}>📂 Click to select voice sample</p>
              <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Supports: MP3, WAV, FLAC, M4A</p>
            </div>
          )}
        </label>
        
        <h3 style={{ marginTop: '2rem' }}>
          {mode === 'sing' ? '🎼 Lyrics to Sing' : '💬 Text to Speak'}
        </h3>
        <p style={{ color: '#aaa', marginBottom: '1rem' }}>
          {mode === 'sing' 
            ? 'Enter the lyrics you want the voice to sing. You can include melody notes or just text.'
            : 'Enter the text you want the voice to speak naturally.'
          }
        </p>
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={mode === 'sing' 
            ? "Enter lyrics here...\n\nExample:\nTwinkle twinkle little star\nHow I wonder what you are\nUp above the world so high\nLike a diamond in the sky"
            : "Enter text to speak...\n\nExample:\nHello, this is a demonstration of voice cloning technology. It can recreate my voice saying anything you want."
          }
          rows={8}
          style={{ 
            width: '100%', 
            padding: '1rem', 
            fontSize: '1rem',
            background: 'rgba(255, 107, 0, 0.05)',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            borderRadius: '8px',
            color: '#fff',
            resize: 'vertical'
          }}
        />

        <button 
          className="btn" 
          onClick={handleClone} 
          disabled={!text || !voiceSample || loading}
          style={{ marginTop: '1.5rem', width: '100%' }}
        >
          {loading ? '⏳ Processing...' : mode === 'sing' ? '🎵 Generate Singing' : '🎤 Generate Speech'}
        </button>
      </div>

      {loading && (
        <div className="card">
          <h3>🔄 Processing Voice...</h3>
          <div className="progress">
            <div className="progress-bar" style={{ width: '100%' }}></div>
          </div>
          <p style={{ textAlign: 'center', color: '#aaa', marginTop: '1rem' }}>
            {mode === 'sing' ? 'Creating your singing voice...' : 'Cloning and generating speech...'}
          </p>
        </div>
      )}

      {result && (
        <div className="card">
          <h3>✨ {result.audioUrl ? 'Generated Audio Ready!' : 'Processing Complete'}</h3>
          {result.audioUrl ? (
            <div>
              <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '1rem' }}>
                Your {mode === 'sing' ? 'singing voice' : 'cloned speech'} has been generated
              </p>
              <WaveformPlayer audioUrl={result.audioUrl} />
              <a 
                href={result.audioUrl} 
                download={`${mode === 'sing' ? 'singing' : 'speech'}_output_${Date.now()}.wav`}
                className="btn" 
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}
              >
                ⬇️ Download {mode === 'sing' ? 'Singing Voice' : 'Speech Audio'}
              </a>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <p style={{ color: '#ff6b00', marginBottom: '1rem' }}>
                ℹ️ {result.message || 'AI service configuration required'}
              </p>
              {result.note && (
                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                  {result.note}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem', background: 'rgba(255, 107, 0, 0.05)' }}>
        <h3>💡 Tips for Best Results</h3>
        <ul style={{ color: '#aaa', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
          <li>Use a clean, clear voice sample with minimal background noise</li>
          <li>10-30 seconds of audio is ideal for voice cloning</li>
          <li>For singing: The AI will attempt to match the voice characteristics while singing your lyrics</li>
          <li>For speech: Natural conversational tone works best</li>
          <li>Avoid samples with music or multiple speakers</li>
        </ul>
      </div>
    </div>
  );
}

export default VoiceCloning;
