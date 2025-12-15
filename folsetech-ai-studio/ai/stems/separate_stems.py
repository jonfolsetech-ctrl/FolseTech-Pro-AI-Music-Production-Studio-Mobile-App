#!/usr/bin/env python3
import subprocess
import sys
import os
import json

def separate_stems(input_file, output_dir='separated', model='htdemucs'):
    """
    Separate audio into stems using Demucs.
    """
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Run demucs
    cmd = [
        'demucs',
        '--two-stems=vocals',  # or use full separation: remove this flag
        '-o', output_dir,
        '-n', model,
        input_file
    ]
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        
        # Get output paths
        basename = os.path.splitext(os.path.basename(input_file))[0]
        stem_dir = os.path.join(output_dir, model, basename)
        
        stems = []
        if os.path.exists(stem_dir):
            for file in os.listdir(stem_dir):
                if file.endswith('.wav'):
                    stems.append({
                        'name': file,
                        'path': os.path.join(stem_dir, file)
                    })
        
        return {
            'success': True,
            'stems': stems,
            'output_dir': stem_dir
        }
    
    except subprocess.CalledProcessError as e:
        return {
            'success': False,
            'error': str(e),
            'stderr': e.stderr
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python separate_stems.py <input_file> [output_dir] [model]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else 'separated'
    model = sys.argv[3] if len(sys.argv) > 3 else 'htdemucs'
    
    result = separate_stems(input_file, output_dir, model)
    print(json.dumps(result, indent=2))
