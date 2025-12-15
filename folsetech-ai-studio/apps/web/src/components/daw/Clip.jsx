import React, { useState, useRef } from 'react';

const Clip = ({ clip, trackId, pixelsPerSecond, isSelected, onSelect, onMove, onResize, snapToGrid }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const clipRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }
    setDragStart({ x: e.clientX, y: e.clientY });
    onSelect();
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const newStart = snapToGrid((clip.start * pixelsPerSecond) + deltaX) / pixelsPerSecond;
      onMove(trackId, clip.id, newStart);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const newDuration = Math.max(0.5, snapToGrid((clip.duration * pixelsPerSecond) + deltaX) / pixelsPerSecond);
      onResize(trackId, clip.id, newDuration);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart]);

  const clipColors = {
    audio: '#9333ea',
    midi: '#3b82f6',
    automation: '#10b981'
  };

  return (
    <div
      ref={clipRef}
      className="clip"
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${150 + (clip.start * pixelsPerSecond)}px`,
        top: '10px',
        width: `${clip.duration * pixelsPerSecond}px`,
        height: '60px',
        background: `linear-gradient(135deg, ${clipColors[clip.type] || '#9333ea'} 0%, ${clipColors[clip.type]}aa 100%)`,
        border: isSelected ? '2px solid #ff6b00' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: '4px',
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '5px 10px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        transition: isDragging ? 'none' : 'border 0.2s'
      }}
    >
      <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {clip.name}
      </span>
      <span style={{ color: '#ccc', fontSize: '10px' }}>
        {clip.type.toUpperCase()}
      </span>

      {/* Waveform preview placeholder */}
      {clip.type === 'audio' && (
        <div style={{ 
          position: 'absolute', 
          bottom: '5px', 
          left: '5px', 
          right: '25px', 
          height: '20px', 
          opacity: 0.3,
          display: 'flex',
          alignItems: 'flex-end',
          gap: '1px'
        }}>
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              style={{ 
                flex: 1, 
                height: `${Math.random() * 100}%`, 
                background: '#fff',
                borderRadius: '1px'
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Resize handle */}
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '8px',
          cursor: 'ew-resize',
          background: isSelected ? 'rgba(255, 107, 0, 0.3)' : 'transparent'
        }}
      ></div>
    </div>
  );
};

export default Clip;
