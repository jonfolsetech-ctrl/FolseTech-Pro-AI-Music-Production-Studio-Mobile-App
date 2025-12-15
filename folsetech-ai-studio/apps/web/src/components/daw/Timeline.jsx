import React, { useState, useRef, useEffect } from 'react';
import Clip from './Clip';

const Timeline = ({ tracks, onClipMove, onClipResize, zoom = 1, playheadPosition = 0 }) => {
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const timelineRef = useRef(null);

  const pixelsPerSecond = 50 * zoom;
  const gridSize = pixelsPerSecond / 4; // Quarter note grid
  const totalDuration = 120; // 2 minutes visible

  const timeMarkers = [];
  for (let i = 0; i <= totalDuration; i += 4) {
    timeMarkers.push(i);
  }

  const snapToGrid = (value) => {
    return Math.round(value / gridSize) * gridSize;
  };

  return (
    <div className="timeline-container" style={{ position: 'relative', background: '#1a1a1a', overflowX: 'auto', overflowY: 'auto' }}>
      {/* Time ruler */}
      <div className="time-ruler" style={{ 
        position: 'sticky', 
        top: 0, 
        background: '#2a2a2a', 
        height: '40px', 
        borderBottom: '1px solid #444',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '5px',
        zIndex: 10
      }}>
        {timeMarkers.map(time => (
          <div 
            key={time}
            style={{
              position: 'absolute',
              left: `${time * pixelsPerSecond}px`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '11px', color: '#aaa' }}>{time}s</span>
            <div style={{ width: '1px', height: '8px', background: '#555' }}></div>
          </div>
        ))}
      </div>

      {/* Playhead */}
      <div 
        className="playhead"
        style={{
          position: 'absolute',
          left: `${playheadPosition * pixelsPerSecond}px`,
          top: '40px',
          bottom: 0,
          width: '2px',
          background: '#ff6b00',
          zIndex: 5,
          pointerEvents: 'none'
        }}
      >
        <div style={{
          width: '0',
          height: '0',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid #ff6b00',
          marginLeft: '-5px',
          marginTop: '-8px'
        }}></div>
      </div>

      {/* Tracks */}
      <div 
        ref={timelineRef}
        className="tracks" 
        style={{ 
          position: 'relative', 
          minHeight: '400px',
          minWidth: `${totalDuration * pixelsPerSecond}px`
        }}
      >
        {tracks.map((track, trackIndex) => (
          <div 
            key={track.id}
            className="track"
            style={{
              position: 'relative',
              height: '80px',
              borderBottom: '1px solid #333',
              background: trackIndex % 2 === 0 ? '#1a1a1a' : '#222'
            }}
          >
            {/* Track header */}
            <div style={{
              position: 'absolute',
              left: 0,
              width: '150px',
              height: '100%',
              background: '#2a2a2a',
              borderRight: '1px solid #444',
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              zIndex: 2
            }}>
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{track.name}</span>
            </div>

            {/* Grid lines */}
            <div style={{ position: 'absolute', left: '150px', right: 0, top: 0, bottom: 0 }}>
              {timeMarkers.map(time => (
                <div 
                  key={time}
                  style={{
                    position: 'absolute',
                    left: `${time * pixelsPerSecond}px`,
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    background: time % 8 === 0 ? '#444' : '#2a2a2a'
                  }}
                ></div>
              ))}
            </div>

            {/* Clips */}
            {track.clips?.map(clip => (
              <Clip
                key={clip.id}
                clip={clip}
                trackId={track.id}
                pixelsPerSecond={pixelsPerSecond}
                isSelected={selectedClipId === clip.id}
                onSelect={() => setSelectedClipId(clip.id)}
                onMove={onClipMove}
                onResize={onClipResize}
                snapToGrid={snapToGrid}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
