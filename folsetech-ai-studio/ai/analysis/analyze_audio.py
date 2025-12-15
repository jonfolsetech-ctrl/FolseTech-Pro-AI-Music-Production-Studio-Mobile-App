import librosa
import numpy as np
import json
import sys

def analyze_audio(file_path):
    """Analyze audio file and extract key metrics."""
    
    # Load audio
    y, sr = librosa.load(file_path, sr=None)
    
    # Duration
    duration = librosa.get_duration(y=y, sr=sr)
    
    # Peak and RMS levels
    peak_level = 20 * np.log10(np.max(np.abs(y)))
    rms = np.sqrt(np.mean(y**2))
    rms_level = 20 * np.log10(rms) if rms > 0 else -np.inf
    
    # Dynamic range
    dynamic_range = peak_level - rms_level
    
    # Tempo estimation
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    
    # Key detection (using chroma features)
    chromagram = librosa.feature.chroma_stft(y=y, sr=sr)
    key_idx = np.argmax(np.sum(chromagram, axis=1))
    keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    key = keys[key_idx]
    
    # Spectral features
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    
    # Zero crossing rate
    zcr = librosa.feature.zero_crossing_rate(y)
    
    results = {
        'duration': float(duration),
        'sample_rate': int(sr),
        'channels': 1 if y.ndim == 1 else y.shape[0],
        'peak_level': float(peak_level),
        'rms_level': float(rms_level),
        'dynamic_range': float(dynamic_range),
        'tempo': float(tempo),
        'key': key,
        'spectral_centroid_mean': float(np.mean(spectral_centroids)),
        'spectral_rolloff_mean': float(np.mean(spectral_rolloff)),
        'zero_crossing_rate_mean': float(np.mean(zcr))
    }
    
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python analyze_audio.py <input_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    results = analyze_audio(input_file)
    print(json.dumps(results, indent=2))
