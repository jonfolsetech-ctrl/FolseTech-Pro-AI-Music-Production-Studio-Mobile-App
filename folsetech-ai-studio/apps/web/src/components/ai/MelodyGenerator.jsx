import React, { useState } from 'react';
import axios from 'axios';

const MelodyGenerator = ({ onMelodyGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('pop');
  const [mood, setMood] = useState('happy');
  const [tempo, setTempo] = useState(120);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const genres = ['Pop', 'Rock', 'Jazz', 'Classical', 'Electronic', 'Hip Hop', 'R&B', 'Country'];
  const moods = ['Happy', 'Sad', 'Energetic', 'Calm', 'Mysterious', 'Epic', 'Romantic', 'Dark'];

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);

    try {
      const response = await axios.post('/api/bedrock/melody', {
        prompt,
        genre,
        mood,
        tempo,
        duration: 16 // bars
      });

      setResult(response.data);
      if (onMelodyGenerated && response.data.midiData) {
        onMelodyGenerated(response.data.midiData);
      }
    } catch (error) {
      console.error('Melody generation failed:', error);
      alert('Failed to generate melody. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="melody-generator" style={{
      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
      border: '1px solid rgba(147, 51, 234, 0.3)',
      borderRadius: '12px',
      padding: '20px'
    }}>
      <h3 style={{ color: '#9333ea', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>🎹</span>
        AI Melody Generator
      </h3>

      <div style={{ display: 'grid', gap: '15px' }}>
        {/* Prompt */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
            Describe your melody:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A catchy piano melody with arpeggios..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Genre and Mood */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
              Genre:
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
            >
              {genres.map(g => (
                <option key={g} value={g.toLowerCase()}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
              Mood:
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
            >
              {moods.map(m => (
                <option key={m} value={m.toLowerCase()}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tempo */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
            Tempo: {tempo} BPM
          </label>
          <input
            type="range"
            min="60"
            max="200"
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(147, 51, 234, 0.3)',
              borderRadius: '3px',
              outline: 'none'
            }}
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !prompt}
          style={{
            padding: '12px',
            background: generating 
              ? 'rgba(147, 51, 234, 0.3)'
              : 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: generating || !prompt ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            opacity: generating || !prompt ? 0.6 : 1
          }}
        >
          {generating ? '🎼 Generating...' : '✨ Generate Melody'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px'
        }}>
          <h4 style={{ color: '#10b981', marginBottom: '10px' }}>✓ Melody Generated!</h4>
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '10px' }}>
            {result.message || 'Your melody has been created and added to the piano roll.'}
          </p>
          {result.notes && (
            <div style={{ color: '#888', fontSize: '12px' }}>
              <p>Notes: {result.notes.length}</p>
              <p>Duration: {result.duration} bars</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MelodyGenerator;
