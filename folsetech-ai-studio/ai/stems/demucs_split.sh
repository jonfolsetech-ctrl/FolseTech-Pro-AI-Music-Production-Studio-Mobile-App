#!/bin/bash
# Demucs Stem Separation Script
# Separates audio into vocals, drums, bass, and other

set -e

# Check if input file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <input_audio_file> [output_directory]"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_DIR="${2:-./separated}"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🎵 Starting stem separation with Demucs..."
echo "Input: $INPUT_FILE"
echo "Output: $OUTPUT_DIR"

# Check if Demucs is installed
if ! command -v demucs &> /dev/null; then
    echo "❌ Demucs not found. Please install: pip install demucs"
    exit 1
fi

# Run Demucs separation
# Using htdemucs_ft (fine-tuned hybrid transformer model)
demucs \
    --two-stems=vocals \
    --mp3 \
    --mp3-bitrate=320 \
    --out "$OUTPUT_DIR" \
    --name htdemucs_ft \
    "$INPUT_FILE"

# Optionally run full 4-stem separation
echo "🎸 Running full 4-stem separation..."
demucs \
    --mp3 \
    --mp3-bitrate=320 \
    --out "$OUTPUT_DIR" \
    --name htdemucs_ft \
    "$INPUT_FILE"

echo "✅ Stem separation complete!"
echo "Output files in: $OUTPUT_DIR"

# List generated files
echo ""
echo "Generated stems:"
find "$OUTPUT_DIR" -name "*.mp3" -type f
