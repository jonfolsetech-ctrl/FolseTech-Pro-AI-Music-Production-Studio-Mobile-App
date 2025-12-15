import React, { useState } from 'react';
import TrackStrip from './TrackStrip';

const StemMixer = ({ stems, onStemUpdate, onMasterUpdate, masterSettings }) => {
  const [selectedStem, setSelectedStem] = useState(null);

  const defaultStems = stems || [
    { id: 'vocals', name: 'Vocals', volume: 0, pan: 0, solo: false, mute: false, color: '#ec4899' },
    { id: 'drums', name: 'Drums', volume: 0, pan: 0, solo: false, mute: false, color: '#3b82f6' },
    { id: 'bass', name: 'Bass', volume: 0, pan: 0, solo: false, mute: false, color: '#8b5cf6' },
    { id: 'other', name: 'Other', volume: 0, pan: 0, solo: false, mute: false, color: '#10b981' }
  ];

  const defaultMaster = masterSettings || {
    volume: 0,
    limiter: true,
    limiterThreshold: -0.3
  };

  const [localStems, setLocalStems] = useState(defaultStems);
  const [master, setMaster] = useState(defaultMaster);

  const handleStemChange = (stemId, property, value) => {
    const updated = localStems.map(stem => 
      stem.id === stemId ? { ...stem, [property]: value } : stem
    );
    setLocalStems(updated);
    if (onStemUpdate) {
      onStemUpdate(stemId, property, value);
    }
  };

  const handleMasterChange = (property, value) => {
    const updated = { ...master, [property]: value };
    setMaster(updated);
    if (onMasterUpdate) {
      onMasterUpdate(property, value);
    }
  };

  return (
    <div className="stem-mixer" style={{
      display: 'flex',
      gap: '10px',
      padding: '20px',
      background: 'linear-gradient(to bottom, #1a1a1a, #0a0a0a)',
      borderRadius: '12px',
      overflowX: 'auto'
    }}>
      {/* Stem tracks */}
      {localStems.map(stem => (
        <TrackStrip
          key={stem.id}
          track={stem}
          isSelected={selectedStem === stem.id}
          onSelect={() => setSelectedStem(stem.id)}
          onChange={(property, value) => handleStemChange(stem.id, property, value)}
        />
      ))}

      {/* Master track */}
      <div style={{
        minWidth: '100px',
        background: 'linear-gradient(135deg, #ff6b00 0%, #ff8533 100%)',
        borderRadius: '12px',
        padding: '15px',
        boxShadow: '0 4px 20px rgba(255, 107, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <h4 style={{ margin: 0, color: '#fff', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
          MASTER
        </h4>

        {/* Volume meter */}
        <div style={{
          flex: 1,
          position: 'relative',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '10px 5px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '30px',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '4px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Meter gradient */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${((master.volume + 60) / 60) * 100}%`,
              background: 'linear-gradient(to top, #10b981 0%, #fbbf24 70%, #ef4444 100%)',
              borderRadius: '4px'
            }}></div>
            
            {/* Scale marks */}
            {[-60, -40, -20, -10, -3, 0].map(db => (
              <div key={db} style={{
                position: 'absolute',
                left: '32px',
                top: `${100 - ((db + 60) / 60 * 100)}%`,
                transform: 'translateY(-50%)',
                fontSize: '9px',
                color: '#fff',
                whiteSpace: 'nowrap'
              }}>
                {db}
              </div>
            ))}
          </div>
        </div>

        {/* Master fader */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <input
            type="range"
            min="-60"
            max="6"
            step="0.1"
            value={master.volume}
            onChange={(e) => handleMasterChange('volume', parseFloat(e.target.value))}
            style={{
              WebkitAppearance: 'slider-vertical',
              width: '40px',
              height: '150px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '10px',
              outline: 'none'
            }}
          />
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
            {master.volume > 0 ? '+' : ''}{master.volume.toFixed(1)} dB
          </span>
        </div>

        {/* Limiter toggle */}
        <button
          onClick={() => handleMasterChange('limiter', !master.limiter)}
          style={{
            padding: '8px',
            background: master.limiter ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0,0,0,0.3)',
            border: `1px solid ${master.limiter ? '#10b981' : '#444'}`,
            borderRadius: '6px',
            color: '#fff',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {master.limiter ? '✓' : ''} LIMITER
        </button>
      </div>
    </div>
  );
};

export default StemMixer;
