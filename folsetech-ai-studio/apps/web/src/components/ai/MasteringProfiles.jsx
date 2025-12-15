import React, { useState } from 'react';
import axios from 'axios';

const MasteringProfiles = ({ audioUrl, onMasteringComplete }) => {
  const [selectedProfile, setSelectedProfile] = useState('streaming');
  const [customSettings, setCustomSettings] = useState({
    targetLUFS: -14,
    ceiling: -1.0,
    stereoWidth: 100,
    enhanceBass: false,
    enhancePresence: false
  });
  const [mastering, setMastering] = useState(false);
  const [result, setResult] = useState(null);

  const profiles = [
    {
      id: 'streaming',
      name: 'Streaming',
      description: 'Optimized for Spotify, Apple Music (-14 LUFS)',
      icon: '🎧',
      settings: { targetLUFS: -14, ceiling: -1.0 }
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Optimized for YouTube videos (-13 LUFS)',
      icon: '📹',
      settings: { targetLUFS: -13, ceiling: -1.0 }
    },
    {
      id: 'podcast',
      name: 'Podcast',
      description: 'Clear spoken word (-16 LUFS)',
      icon: '🎙️',
      settings: { targetLUFS: -16, ceiling: -1.0 }
    },
    {
      id: 'club',
      name: 'Club/DJ',
      description: 'Loud and punchy for clubs (-8 LUFS)',
      icon: '🔊',
      settings: { targetLUFS: -8, ceiling: -0.3 }
    },
    {
      id: 'vinyl',
      name: 'Vinyl',
      description: 'Dynamic range for vinyl pressing (-18 LUFS)',
      icon: '💿',
      settings: { targetLUFS: -18, ceiling: -2.0 }
    },
    {
      id: 'custom',
      name: 'Custom',
      description: 'Fine-tune your own settings',
      icon: '⚙️',
      settings: customSettings
    }
  ];

  const handleMaster = async () => {
    if (!audioUrl) {
      alert('Please provide an audio file first');
      return;
    }

    setMastering(true);
    setResult(null);

    const profile = profiles.find(p => p.id === selectedProfile);

    try {
      const response = await axios.post('/api/bedrock/mastering', {
        audioUrl,
        profile: selectedProfile,
        settings: profile.settings
      });

      setResult(response.data);
      if (onMasteringComplete && response.data.masteredUrl) {
        onMasteringComplete(response.data.masteredUrl);
      }
    } catch (error) {
      console.error('Mastering failed:', error);
      alert('Failed to master audio. Please try again.');
    } finally {
      setMastering(false);
    }
  };

  return (
    <div className="mastering-profiles" style={{
      background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 133, 51, 0.1) 100%)',
      border: '1px solid rgba(255, 107, 0, 0.3)',
      borderRadius: '12px',
      padding: '20px'
    }}>
      <h3 style={{ color: '#ff6b00', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>🎚️</span>
        AI Mastering Profiles
      </h3>

      {/* Profile Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {profiles.map(profile => (
          <div
            key={profile.id}
            onClick={() => setSelectedProfile(profile.id)}
            style={{
              padding: '15px',
              background: selectedProfile === profile.id 
                ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.2) 0%, rgba(255, 107, 0, 0.1) 100%)'
                : 'rgba(0,0,0,0.3)',
              border: selectedProfile === profile.id ? '2px solid #ff6b00' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{profile.icon}</div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
              {profile.name}
            </h4>
            <p style={{ color: '#aaa', fontSize: '12px', lineHeight: '1.4' }}>
              {profile.description}
            </p>
          </div>
        ))}
      </div>

      {/* Custom Settings */}
      {selectedProfile === 'custom' && (
        <div style={{
          padding: '15px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#ff6b00', marginBottom: '15px' }}>Custom Settings</h4>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
                Target LUFS: {customSettings.targetLUFS}
              </label>
              <input
                type="range"
                min="-20"
                max="-8"
                step="0.1"
                value={customSettings.targetLUFS}
                onChange={(e) => setCustomSettings({...customSettings, targetLUFS: parseFloat(e.target.value)})}
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 107, 0, 0.3)',
                  borderRadius: '3px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
                True Peak Ceiling: {customSettings.ceiling} dB
              </label>
              <input
                type="range"
                min="-3"
                max="-0.1"
                step="0.1"
                value={customSettings.ceiling}
                onChange={(e) => setCustomSettings({...customSettings, ceiling: parseFloat(e.target.value)})}
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 107, 0, 0.3)',
                  borderRadius: '3px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
                Stereo Width: {customSettings.stereoWidth}%
              </label>
              <input
                type="range"
                min="0"
                max="150"
                value={customSettings.stereoWidth}
                onChange={(e) => setCustomSettings({...customSettings, stereoWidth: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 107, 0, 0.3)',
                  borderRadius: '3px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={customSettings.enhanceBass}
                  onChange={(e) => setCustomSettings({...customSettings, enhanceBass: e.target.checked})}
                />
                Enhance Bass
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={customSettings.enhancePresence}
                  onChange={(e) => setCustomSettings({...customSettings, enhancePresence: e.target.checked})}
                />
                Enhance Presence
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Master button */}
      <button
        onClick={handleMaster}
        disabled={mastering || !audioUrl}
        style={{
          width: '100%',
          padding: '15px',
          background: mastering || !audioUrl
            ? 'rgba(255, 107, 0, 0.3)'
            : 'linear-gradient(135deg, #ff6b00 0%, #ff8533 100%)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: mastering || !audioUrl ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          opacity: mastering || !audioUrl ? 0.6 : 1
        }}
      >
        {mastering ? '🎚️ Mastering...' : '✨ Apply Mastering'}
      </button>

      {/* Result */}
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px'
        }}>
          <h4 style={{ color: '#10b981', marginBottom: '10px' }}>✓ Mastering Complete!</h4>
          <p style={{ color: '#aaa', fontSize: '14px' }}>
            {result.message || 'Your track has been professionally mastered.'}
          </p>
          {result.masteredUrl && (
            <a
              href={result.masteredUrl}
              download
              style={{
                display: 'inline-block',
                marginTop: '10px',
                padding: '8px 16px',
                background: '#10b981',
                borderRadius: '6px',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              ⬇️ Download Mastered Track
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default MasteringProfiles;
