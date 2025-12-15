import React, { useState } from 'react';
import Timeline from '../components/daw/Timeline';
import Transport from '../components/daw/Transport';
import StemMixer from '../components/mixer/StemMixer';
import PianoRoll from '../components/midi/PianoRoll';
import MelodyGenerator from '../components/ai/MelodyGenerator';
import MasteringProfiles from '../components/ai/MasteringProfiles';

const Studio = () => {
  const [activeView, setActiveView] = useState('timeline');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [tracks, setTracks] = useState([
    {
      id: 'track1',
      name: 'Vocals',
      clips: [
        { id: 'clip1', name: 'Verse 1', type: 'audio', start: 0, duration: 8 },
        { id: 'clip2', name: 'Chorus', type: 'audio', start: 16, duration: 8 }
      ]
    },
    {
      id: 'track2',
      name: 'Piano',
      clips: [
        { id: 'clip3', name: 'Melody', type: 'midi', start: 0, duration: 16 }
      ]
    },
    {
      id: 'track3',
      name: 'Drums',
      clips: [
        { id: 'clip4', name: 'Beat', type: 'audio', start: 0, duration: 32 }
      ]
    }
  ]);
  const [midiNotes, setMidiNotes] = useState([]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
  };

  const handleClipMove = (trackId, clipId, newStart) => {
    setTracks(tracks.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          clips: track.clips.map(clip =>
            clip.id === clipId ? { ...clip, start: newStart } : clip
          )
        };
      }
      return track;
    }));
  };

  const handleClipResize = (trackId, clipId, newDuration) => {
    setTracks(tracks.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          clips: track.clips.map(clip =>
            clip.id === clipId ? { ...clip, duration: newDuration } : clip
          )
        };
      }
      return track;
    }));
  };

  const views = [
    { id: 'timeline', name: 'Timeline', icon: '📊' },
    { id: 'mixer', name: 'Mixer', icon: '🎚️' },
    { id: 'piano', name: 'Piano Roll', icon: '🎹' },
    { id: 'ai', name: 'AI Tools', icon: '✨' }
  ];

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0a0a',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(to right, #1a1a1a, #2a2a2a)',
        borderBottom: '1px solid #444',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ color: '#ff6b00', margin: 0, fontSize: '1.5rem' }}>
          🎵 FolseTech Studio
        </h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              style={{
                padding: '10px 20px',
                background: activeView === view.id 
                  ? 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: activeView === view.id ? '2px solid #9333ea' : '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {view.icon} {view.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{
            padding: '8px 16px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid #10b981',
            borderRadius: '6px',
            color: '#10b981',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            💾 Save
          </button>
          <button style={{
            padding: '8px 16px',
            background: 'rgba(255, 107, 0, 0.2)',
            border: '1px solid #ff6b00',
            borderRadius: '6px',
            color: '#ff6b00',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            📤 Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {activeView === 'timeline' && (
          <Timeline
            tracks={tracks}
            onClipMove={handleClipMove}
            onClipResize={handleClipResize}
            playheadPosition={currentTime}
            zoom={1}
          />
        )}

        {activeView === 'mixer' && (
          <StemMixer />
        )}

        {activeView === 'piano' && (
          <PianoRoll
            notes={midiNotes}
            onNotesChange={setMidiNotes}
          />
        )}

        {activeView === 'ai' && (
          <div style={{ display: 'grid', gap: '20px', maxWidth: '1200px' }}>
            <MelodyGenerator
              onMelodyGenerated={(notes) => {
                setMidiNotes(notes);
                setActiveView('piano');
              }}
            />
            <MasteringProfiles />
          </div>
        )}
      </div>

      {/* Transport */}
      <Transport
        onPlayPause={handlePlayPause}
        onStop={handleStop}
        onSeek={handleSeek}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={120}
        tempo={tempo}
        onTempoChange={setTempo}
      />
    </div>
  );
};

export default Studio;
