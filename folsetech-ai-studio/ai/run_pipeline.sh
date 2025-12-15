#!/bin/bash
# GPU Processing Pipeline Orchestrator
# Manages multiple AI processing tasks in sequence or parallel

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check GPU availability
check_gpu() {
    if command -v nvidia-smi &> /dev/null; then
        log_info "GPU detected:"
        nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
        return 0
    else
        log_warn "No GPU detected. Processing will use CPU (slower)."
        return 1
    fi
}

# Run audio analysis
run_analysis() {
    local input_file="$1"
    log_info "Running audio analysis..."
    python3 "$SCRIPT_DIR/analysis/analyze_audio.py" "$input_file"
}

# Run speech transcription
run_transcription() {
    local input_file="$1"
    log_info "Running speech transcription..."
    python3 "$SCRIPT_DIR/speech/transcribe.py" "$input_file"
}

# Run stem separation
run_stem_separation() {
    local input_file="$1"
    local output_dir="$2"
    log_info "Running stem separation..."
    bash "$SCRIPT_DIR/stems/demucs_split.sh" "$input_file" "$output_dir"
}

# Run mastering
run_mastering() {
    local input_file="$1"
    local output_file="$2"
    local target_lufs="${3:--14}"
    log_info "Running audio mastering (Target: ${target_lufs} LUFS)..."
    python3 "$SCRIPT_DIR/mastering/master_audio.py" \
        --input "$input_file" \
        --output "$output_file" \
        --target-lufs "$target_lufs"
}

# Run voice cloning
run_voice_clone() {
    local reference="$1"
    local text="$2"
    local output="$3"
    log_info "Running voice cloning..."
    python3 "$SCRIPT_DIR/voice_cloning/rvc_infer.py" \
        --reference "$reference" \
        --text "$text" \
        --output "$output"
}

# Run melody generation
run_melody_generation() {
    local prompt="$1"
    local genre="$2"
    local mood="$3"
    local output="$4"
    log_info "Generating AI melody..."
    python3 "$SCRIPT_DIR/melody/generate_midi.py" \
        --prompt "$prompt" \
        --genre "$genre" \
        --mood "$mood" \
        --output "$output"
}

# Full pipeline: Separate -> Master each stem -> Mix
run_full_production_pipeline() {
    local input_file="$1"
    local output_dir="$2"
    
    log_info "🎵 Starting full production pipeline..."
    
    # Step 1: Analyze
    run_analysis "$input_file"
    
    # Step 2: Separate stems
    local stems_dir="$output_dir/stems"
    run_stem_separation "$input_file" "$stems_dir"
    
    # Step 3: Master each stem
    local mastered_dir="$output_dir/mastered"
    mkdir -p "$mastered_dir"
    
    for stem in "$stems_dir"/*.mp3; do
        if [ -f "$stem" ]; then
            local basename=$(basename "$stem" .mp3)
            log_info "Mastering stem: $basename"
            run_mastering "$stem" "$mastered_dir/${basename}_mastered.mp3"
        fi
    done
    
    log_info "✅ Full production pipeline complete!"
    log_info "Output directory: $output_dir"
}

# Main script
main() {
    log_info "🚀 FolseTech AI Studio - GPU Pipeline"
    
    # Check GPU
    check_gpu
    
    # Parse command
    case "${1:-}" in
        analyze)
            run_analysis "$2"
            ;;
        transcribe)
            run_transcription "$2"
            ;;
        stems)
            run_stem_separation "$2" "${3:-./output/stems}"
            ;;
        master)
            run_mastering "$2" "$3" "${4:--14}"
            ;;
        voice-clone)
            run_voice_clone "$2" "$3" "$4"
            ;;
        melody)
            run_melody_generation "$2" "$3" "$4" "$5"
            ;;
        full-pipeline)
            run_full_production_pipeline "$2" "${3:-./output}"
            ;;
        *)
            echo "Usage: $0 {analyze|transcribe|stems|master|voice-clone|melody|full-pipeline} [args...]"
            echo ""
            echo "Commands:"
            echo "  analyze <audio_file>                           - Analyze audio file"
            echo "  transcribe <audio_file>                        - Transcribe speech"
            echo "  stems <audio_file> [output_dir]                - Separate stems"
            echo "  master <input> <output> [target_lufs]          - Master audio"
            echo "  voice-clone <reference> <text> <output>        - Clone voice"
            echo "  melody <prompt> <genre> <mood> <output>        - Generate melody"
            echo "  full-pipeline <audio_file> [output_dir]        - Run full pipeline"
            exit 1
            ;;
    esac
}

main "$@"
