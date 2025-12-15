#!/usr/bin/env python3
import subprocess
import sys
import os
import json

def master_audio(input_file, output_file, target_lufs=-14, lra=11, true_peak=-1.5):
    """
    Master audio using FFmpeg's loudnorm filter.
    """
    
    # FFmpeg command for loudness normalization
    cmd = [
        'ffmpeg',
        '-i', input_file,
        '-filter_complex',
        f'loudnorm=I={target_lufs}:LRA={lra}:TP={true_peak}',
        '-ar', '44100',
        '-y',
        output_file
    ]
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        
        return {
            'success': True,
            'output': output_file,
            'settings': {
                'target_lufs': target_lufs,
                'lra': lra,
                'true_peak': true_peak
            }
        }
    
    except subprocess.CalledProcessError as e:
        return {
            'success': False,
            'error': str(e),
            'stderr': e.stderr
        }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python master_audio.py <input_file> <output_file> [target_lufs] [lra] [true_peak]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    target_lufs = float(sys.argv[3]) if len(sys.argv) > 3 else -14
    lra = float(sys.argv[4]) if len(sys.argv) > 4 else 11
    true_peak = float(sys.argv[5]) if len(sys.argv) > 5 else -1.5
    
    result = master_audio(input_file, output_file, target_lufs, lra, true_peak)
    print(json.dumps(result, indent=2))
