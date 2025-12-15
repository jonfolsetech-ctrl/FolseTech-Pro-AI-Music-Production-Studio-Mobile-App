#!/usr/bin/env python3
"""
MIDI Melody Generator using MusicGen or custom models
Generates MIDI sequences based on text prompts
"""

import sys
import json
import numpy as np
from midiutil import MIDIFile
import argparse

def generate_melody_from_prompt(prompt, genre, mood, tempo, duration_bars=16):
    """
    Generate a MIDI melody based on text prompt and parameters
    
    Args:
        prompt: Text description of the melody
        genre: Music genre
        mood: Emotional mood
        tempo: BPM
        duration_bars: Number of bars to generate
    
    Returns:
        dict: MIDI note data
    """
    
    # Scale definitions
    scales = {
        'major': [0, 2, 4, 5, 7, 9, 11],
        'minor': [0, 2, 3, 5, 7, 8, 10],
        'pentatonic_major': [0, 2, 4, 7, 9],
        'pentatonic_minor': [0, 3, 5, 7, 10],
        'blues': [0, 3, 5, 6, 7, 10]
    }
    
    # Genre-specific scale selection
    genre_scales = {
        'pop': 'major',
        'rock': 'pentatonic_minor',
        'jazz': 'minor',
        'blues': 'blues',
        'classical': 'major',
        'electronic': 'minor',
        'hip hop': 'pentatonic_minor'
    }
    
    scale_type = genre_scales.get(genre.lower(), 'major')
    scale = scales[scale_type]
    
    # Base note (C4)
    base_note = 60
    
    # Mood affects velocity and note range
    mood_settings = {
        'happy': {'velocity_range': (90, 110), 'octave_range': 2},
        'sad': {'velocity_range': (60, 85), 'octave_range': 1},
        'energetic': {'velocity_range': (100, 127), 'octave_range': 3},
        'calm': {'velocity_range': (50, 75), 'octave_range': 1},
        'mysterious': {'velocity_range': (70, 95), 'octave_range': 2},
        'epic': {'velocity_range': (95, 120), 'octave_range': 3}
    }
    
    settings = mood_settings.get(mood.lower(), mood_settings['happy'])
    
    # Generate notes
    notes = []
    beats_per_bar = 4
    total_beats = duration_bars * beats_per_bar
    subdivisions = 4  # 16th notes
    
    current_beat = 0.0
    note_durations = [0.25, 0.5, 0.75, 1.0]  # Various note lengths
    
    while current_beat < total_beats:
        # Select random note from scale with octave variation
        octave_shift = np.random.randint(-settings['octave_range'], settings['octave_range'] + 1) * 12
        scale_degree = np.random.choice(scale)
        midi_note = base_note + scale_degree + octave_shift
        
        # Ensure note is in valid MIDI range
        midi_note = max(21, min(108, midi_note))
        
        # Random duration
        duration = np.random.choice(note_durations)
        
        # Random velocity within mood range
        velocity = np.random.randint(*settings['velocity_range'])
        
        notes.append({
            'note': midi_to_note_name(midi_note),
            'midiNote': int(midi_note),
            'start': float(current_beat),
            'duration': float(duration),
            'velocity': int(velocity)
        })
        
        current_beat += duration
    
    return {
        'notes': notes,
        'tempo': tempo,
        'duration': duration_bars,
        'scale': scale_type,
        'genre': genre,
        'mood': mood
    }

def midi_to_note_name(midi_note):
    """Convert MIDI note number to note name"""
    note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    octave = (midi_note // 12) - 1
    note = note_names[midi_note % 12]
    return f"{note}{octave}"

def export_to_midi_file(melody_data, output_path):
    """Export melody data to MIDI file"""
    midi = MIDIFile(1)
    track = 0
    time = 0
    
    midi.addTempo(track, time, melody_data['tempo'])
    midi.addTrackName(track, time, "AI Generated Melody")
    
    for note in melody_data['notes']:
        midi.addNote(
            track=track,
            channel=0,
            pitch=note['midiNote'],
            time=note['start'],
            duration=note['duration'],
            volume=note['velocity']
        )
    
    with open(output_path, 'wb') as output_file:
        midi.writeFile(output_file)

def main():
    parser = argparse.ArgumentParser(description='Generate AI melody')
    parser.add_argument('--prompt', type=str, required=True, help='Melody description')
    parser.add_argument('--genre', type=str, default='pop', help='Music genre')
    parser.add_argument('--mood', type=str, default='happy', help='Mood/emotion')
    parser.add_argument('--tempo', type=int, default=120, help='Tempo in BPM')
    parser.add_argument('--duration', type=int, default=16, help='Duration in bars')
    parser.add_argument('--output', type=str, help='Output MIDI file path')
    
    args = parser.parse_args()
    
    # Generate melody
    melody_data = generate_melody_from_prompt(
        prompt=args.prompt,
        genre=args.genre,
        mood=args.mood,
        tempo=args.tempo,
        duration_bars=args.duration
    )
    
    # Export to MIDI if output path provided
    if args.output:
        export_to_midi_file(melody_data, args.output)
    
    # Print JSON to stdout
    print(json.dumps(melody_data))

if __name__ == '__main__':
    main()
