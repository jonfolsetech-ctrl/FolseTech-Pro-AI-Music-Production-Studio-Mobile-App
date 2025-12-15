import whisper
import sys
import json

def transcribe_audio(file_path, model_size='base'):
    """Transcribe audio using OpenAI Whisper."""
    
    # Load model
    model = whisper.load_model(model_size)
    
    # Transcribe
    result = model.transcribe(file_path)
    
    return {
        'text': result['text'],
        'language': result['language'],
        'segments': [
            {
                'start': seg['start'],
                'end': seg['end'],
                'text': seg['text']
            }
            for seg in result['segments']
        ]
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <input_file> [model_size]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    model_size = sys.argv[2] if len(sys.argv) > 2 else 'base'
    
    results = transcribe_audio(input_file, model_size)
    print(json.dumps(results, indent=2))
