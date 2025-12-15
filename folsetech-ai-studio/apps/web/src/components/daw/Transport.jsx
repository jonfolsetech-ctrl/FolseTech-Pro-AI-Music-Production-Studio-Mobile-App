import React, { useState, useEffect } from 'react';

const Transport = ({ onPlayPause, onStop, onSeek, isPlaying, currentTime, duration, tempo, onTempoChange }) => {
  const [localTempo, setLocalTempo] = useState(tempo || 120);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  const handleTempoChange = (value) => {
    const newTempo = Math.max(40, Math.min(240, parseInt(value) || 120));
    setLocalTempo(newTempo);
    if (onTempoChange) {
      onTempoChange(newTempo);
    }
  };

  return (
    <div className="transport" style={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
      borderTop: '1px solid #444',
      padding: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
    }}>
      {/* Playback controls */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onStop}
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(255, 107, 0, 0.1)',
            color: '#ff6b00',
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 107, 0, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 107, 0, 0.1)'}
        >
          ⏹
        </button>

        <button
          onClick={onPlayPause}
          style={{
            width: '55px',
            height: '45px',
            borderRadius: '8px',
            border: 'none',
            background: isPlaying ? 'rgba(255, 107, 0, 0.8)' : 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          onClick={() => onSeek(0)}
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#aaa',
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          ⏮
        </button>
      </div>

      {/* Time display */}
      <div style={{
        background: 'rgba(0,0,0,0.5)',
        padding: '10px 20px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ff6b00',
        minWidth: '150px',
        textAlign: 'center'
      }}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      {/* Tempo control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ color: '#aaa', fontSize: '14px' }}>BPM:</label>
        <input
          type="number"
          value={localTempo}
          onChange={(e) => handleTempoChange(e.target.value)}
          min="40"
          max="240"
          style={{
            width: '70px',
            padding: '8px',
            background: 'rgba(255, 107, 0, 0.1)',
            border: '1px solid #ff6b00',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '16px',
            textAlign: 'center'
          }}
        />
      </div>

      {/* Loop toggle */}
      <button
        style={{
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid #555',
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#aaa',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(147, 51, 234, 0.2)';
          e.target.style.borderColor = '#9333ea';
          e.target.style.color = '#9333ea';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
          e.target.style.borderColor = '#555';
          e.target.style.color = '#aaa';
        }}
      >
        🔁 Loop
      </button>

      {/* Record button */}
      <button
        style={{
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          border: '2px solid #ef4444',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          fontSize: '20px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginLeft: 'auto'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(239, 68, 68, 0.3)';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(239, 68, 68, 0.1)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        ⏺
      </button>
    </div>
  );
};

export default Transport;
