import React, { useState } from 'react';

const TrackStrip = ({ track, isSelected, onSelect, onChange }) => {
  const [showFX, setShowFX] = useState(false);

  const handleVolumeChange = (value) => {
    onChange('volume', parseFloat(value));
  };

  const handlePanChange = (value) => {
    onChange('pan', parseFloat(value));
  };

  const toggleMute = () => {
    onChange('mute', !track.mute);
  };

  const toggleSolo = () => {
    onChange('solo', !track.solo);
  };

  return (
    <div
      onClick={onSelect}
      style={{
        minWidth: '80px',
        background: isSelected 
          ? `linear-gradient(135deg, ${track.color}44 0%, ${track.color}22 100%)`
          : 'rgba(255, 255, 255, 0.05)',
        border: isSelected ? `2px solid ${track.color}` : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s',
        cursor: 'pointer',
        boxShadow: isSelected ? `0 4px 20px ${track.color}44` : 'none'
      }}
    >
      {/* Track name */}
      <h4 style={{
        margin: 0,
        color: track.color,
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {track.name}
      </h4>

      {/* Volume meter */}
      <div style={{
        flex: 1,
        minHeight: '200px',
        position: 'relative',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '8px',
        padding: '8px 4px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '20px',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Level indicator */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${track.mute ? 0 : ((track.volume + 60) / 60) * 100}%`,
            background: `linear-gradient(to top, ${track.color}44, ${track.color})`,
            borderRadius: '4px',
            transition: 'height 0.1s'
          }}></div>
        </div>
      </div>

      {/* Volume fader */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <input
          type="range"
          min="-60"
          max="6"
          step="0.1"
          value={track.volume}
          onChange={(e) => handleVolumeChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          style={{
            WebkitAppearance: 'slider-vertical',
            width: '30px',
            height: '100px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '8px',
            outline: 'none'
          }}
        />
        <span style={{
          color: '#fff',
          fontSize: '10px',
          fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.5)',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          {track.volume > 0 ? '+' : ''}{track.volume.toFixed(1)}
        </span>
      </div>

      {/* Pan control */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <label style={{ fontSize: '9px', color: '#aaa', textTransform: 'uppercase' }}>Pan</label>
        <input
          type="range"
          min="-100"
          max="100"
          value={track.pan}
          onChange={(e) => handlePanChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '60px',
            height: '4px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '2px',
            outline: 'none'
          }}
        />
        <span style={{ fontSize: '9px', color: '#999' }}>
          {track.pan === 0 ? 'C' : track.pan > 0 ? `R${track.pan}` : `L${Math.abs(track.pan)}`}
        </span>
      </div>

      {/* Mute/Solo buttons */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          style={{
            flex: 1,
            padding: '6px',
            background: track.mute ? '#ef4444' : 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          M
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleSolo(); }}
          style={{
            flex: 1,
            padding: '6px',
            background: track.solo ? '#fbbf24' : 'rgba(251, 191, 36, 0.2)',
            border: '1px solid #fbbf24',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          S
        </button>
      </div>

      {/* FX button */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowFX(!showFX); }}
        style={{
          padding: '6px',
          background: showFX ? `${track.color}44` : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${showFX ? track.color : '#444'}`,
          borderRadius: '4px',
          color: '#fff',
          fontSize: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        FX
      </button>
    </div>
  );
};

export default TrackStrip;
