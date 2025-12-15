import React, { useState } from 'react';
import axios from 'axios';
import WaveformPlayer from '../components/WaveformPlayer';

function SongGenerator() {
  const [genre, setGenre] = useState('pop');
  const [style, setStyle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const genres = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Jazz', 'Classical',
    'Electronic', 'EDM', 'Blues', 'Reggae', 'Metal', 'Indie', 'Folk',
    'Soul', 'Funk', 'Latin', 'K-Pop', 'Afrobeat', 'Trap'
  ];

  const handleGenerate = async () => {
    if (!lyrics.trim()) {
      alert('Please enter lyrics for your song');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('/api/generate-song', {
        genre,
        style,
        lyrics
      });
      setResult(response.data);
    } catch (error) {
      console.error('Song generation failed:', error);
      alert('Song generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>🎵 AI Song Generator</h2>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '2rem' }}>
        Create complete songs with AI - choose your genre, describe your style, and provide lyrics
      </p>

      <div className="card">
        <h3>🎸 Song Configuration</h3>
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ff6b00', fontWeight: 'bold' }}>
            Genre
          </label>
          <select 
            value={genre} 
            onChange={(e) => setGenre(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid #ff6b00',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {genres.map(g => (
              <option key={g} value={g.toLowerCase()} style={{ background: '#1a1a1a' }}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ff6b00', fontWeight: 'bold' }}>
            Style Description (Optional)
          </label>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="e.g., upbeat, acoustic, energetic, melancholic..."
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem'
            }}
          />
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#aaa' }}>
            Describe the mood, tempo, or specific characteristics you want
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ff6b00', fontWeight: 'bold' }}>
            Lyrics
          </label>
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Enter your song lyrics here...&#10;&#10;[Verse 1]&#10;Your lyrics here...&#10;&#10;[Chorus]&#10;More lyrics..."
            rows={12}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#aaa' }}>
            Structure your lyrics with [Verse], [Chorus], [Bridge] tags for best results
          </p>
        </div>

        <button 
          className="btn" 
          onClick={handleGenerate} 
          disabled={loading || !lyrics.trim()}
          style={{ width: '100%', fontSize: '1.1rem' }}
        >
          {loading ? '🎼 Generating Song...' : '🎵 Generate Song'}
        </button>
      </div>

      {loading && (
        <div className="card">
          <h3>🔄 Creating Your Song...</h3>
          <div className="progress">
            <div className="progress-bar" style={{ width: '100%' }}></div>
          </div>
          <p style={{ textAlign: 'center', color: '#aaa' }}>
            This may take a minute while we compose your music
          </p>
        </div>
      )}

      {result && (
        <div className="card">
          <h3>✨ Your Song is Ready!</h3>
          {result.audioUrl ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{ color: '#ff6b00', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  🎵 {genre.charAt(0).toUpperCase() + genre.slice(1)} Song
                </p>
                {style && (
                  <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    Style: {style}
                  </p>
                )}
              </div>
              <WaveformPlayer audioUrl={result.audioUrl} />
              <a 
                href={result.audioUrl} 
                download={`ai_song_${genre}_${Date.now()}.mp3`}
                className="btn" 
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}
              >
                ⬇️ Download MP3
              </a>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <p style={{ color: '#ff6b00', marginBottom: '1rem' }}>
                ℹ️ {result.message || 'AI song generation service configuration required'}
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
          <li>Structure your lyrics with sections: [Verse], [Chorus], [Bridge], [Outro]</li>
          <li>Match your lyrics length to your desired song duration</li>
          <li>The style description helps fine-tune the mood and energy</li>
          <li>Each genre has unique characteristics - experiment with different ones</li>
          <li>More detailed style descriptions lead to more personalized results</li>
        </ul>
      </div>
    </div>
  );
}

export default SongGenerator;
