import React, { useState, useRef, useEffect } from 'react';

const PianoRoll = ({ notes = [], onNotesChange, duration = 32, gridDivision = 16 }) => {
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const canvasRef = useRef(null);
  const [localNotes, setLocalNotes] = useState(notes);

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octaves = [7, 6, 5, 4, 3, 2, 1];
  const allNotes = octaves.flatMap(oct => noteNames.map(name => `${name}${oct}`));
  
  const noteHeight = 20;
  const beatWidth = 60;
  const keyWidth = 50;
  const totalBeats = duration;

  const isBlackKey = (note) => {
    const noteName = note.slice(0, -1);
    return noteName.includes('#');
  };

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - keyWidth;
    const y = e.clientY - rect.top;

    const beatPosition = Math.floor(x / (beatWidth / gridDivision)) / gridDivision;
    const noteIndex = Math.floor(y / noteHeight);
    
    if (beatPosition >= 0 && beatPosition < totalBeats && noteIndex >= 0 && noteIndex < allNotes.length) {
      const newNote = {
        id: Date.now() + Math.random(),
        note: allNotes[noteIndex],
        midiNote: 84 - noteIndex,
        start: beatPosition,
        duration: 1 / gridDivision,
        velocity: 100
      };

      // Check if clicking on existing note
      const clickedNote = localNotes.find(n => 
        n.note === newNote.note && 
        Math.abs(n.start - newNote.start) < 0.1
      );

      if (clickedNote) {
        // Remove note
        const updated = localNotes.filter(n => n.id !== clickedNote.id);
        setLocalNotes(updated);
        if (onNotesChange) onNotesChange(updated);
      } else {
        // Add note
        const updated = [...localNotes, newNote];
        setLocalNotes(updated);
        if (onNotesChange) onNotesChange(updated);
      }
    }
  };

  const renderGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw piano keys
    allNotes.forEach((note, index) => {
      const y = index * noteHeight;
      const isBlack = isBlackKey(note);
      
      ctx.fillStyle = isBlack ? '#2a2a2a' : '#3a3a3a';
      ctx.fillRect(0, y, keyWidth, noteHeight);
      
      ctx.strokeStyle = '#444';
      ctx.strokeRect(0, y, keyWidth, noteHeight);
      
      ctx.fillStyle = '#aaa';
      ctx.font = '10px Arial';
      ctx.fillText(note, 8, y + 14);
    });

    // Draw grid
    for (let beat = 0; beat <= totalBeats; beat++) {
      const x = keyWidth + (beat * beatWidth);
      ctx.strokeStyle = beat % 4 === 0 ? '#555' : '#333';
      ctx.lineWidth = beat % 4 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    allNotes.forEach((note, index) => {
      const y = index * noteHeight;
      const isBlack = isBlackKey(note);
      ctx.strokeStyle = isBlack ? '#2a2a2a' : '#333';
      ctx.beginPath();
      ctx.moveTo(keyWidth, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    // Draw notes
    localNotes.forEach(note => {
      const noteIndex = allNotes.indexOf(note.note);
      if (noteIndex === -1) return;

      const x = keyWidth + (note.start * beatWidth);
      const y = noteIndex * noteHeight;
      const width = note.duration * beatWidth;
      const height = noteHeight - 2;

      // Note body
      const gradient = ctx.createLinearGradient(x, y, x + width, y);
      gradient.addColorStop(0, '#9333ea');
      gradient.addColorStop(1, '#ec4899');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, y + 1, width - 2, height);

      // Note border
      ctx.strokeStyle = selectedNotes.includes(note.id) ? '#ff6b00' : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = selectedNotes.includes(note.id) ? 2 : 1;
      ctx.strokeRect(x + 1, y + 1, width - 2, height);

      // Velocity indicator
      const velocityAlpha = note.velocity / 127;
      ctx.fillStyle = `rgba(255, 255, 255, ${velocityAlpha * 0.3})`;
      ctx.fillRect(x + 1, y + 1, width - 2, height);
    });
  };

  useEffect(() => {
    renderGrid();
  }, [localNotes, selectedNotes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = keyWidth + (totalBeats * beatWidth);
      canvas.height = allNotes.length * noteHeight;
      renderGrid();
    }
  }, []);

  return (
    <div className="piano-roll" style={{
      background: '#1a1a1a',
      borderRadius: '12px',
      overflow: 'auto',
      border: '1px solid #333'
    }}>
      {/* Toolbar */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: '#2a2a2a',
        padding: '10px 15px',
        borderBottom: '1px solid #444',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        zIndex: 10
      }}>
        <label style={{ color: '#aaa', fontSize: '12px' }}>Grid:</label>
        <select 
          style={{
            padding: '5px 10px',
            background: 'rgba(147, 51, 234, 0.1)',
            border: '1px solid #9333ea',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '12px'
          }}
        >
          <option>1/16</option>
          <option>1/8</option>
          <option>1/4</option>
        </select>

        <button
          onClick={() => {
            setLocalNotes([]);
            if (onNotesChange) onNotesChange([]);
          }}
          style={{
            padding: '5px 12px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            color: '#ef4444',
            fontSize: '12px',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          Clear All
        </button>

        <span style={{ color: '#888', fontSize: '12px' }}>
          {localNotes.length} notes
        </span>
      </div>

      {/* Piano roll canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ display: 'block', cursor: 'crosshair' }}
      />

      {/* Instructions */}
      <div style={{
        padding: '10px 15px',
        background: 'rgba(147, 51, 234, 0.05)',
        borderTop: '1px solid #333',
        color: '#aaa',
        fontSize: '11px'
      }}>
        Click to add notes • Click existing notes to remove • Drag to move notes
      </div>
    </div>
  );
};

export default PianoRoll;
