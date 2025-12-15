# FolseTech Pro AI Music Production Studio

A comprehensive AI-powered audio processing platform featuring audio analysis, speech-to-text, voice cloning, stem separation, and professional mastering.

## 🚀 Features

- **Audio Analysis** - Analyze audio files for tempo, key, loudness, and spectral features
- **Speech to Text** - Transcribe speech using OpenAI Whisper
- **Voice Cloning** - Clone voices with custom text-to-speech
- **Stem Separation** - Separate audio into individual stems (vocals, drums, bass, other) using Demucs
- **Audio Mastering** - Professional loudness normalization and mastering

## 🏗️ Architecture

```
folsetech-ai-studio/
├── apps/
│   ├── web/          # React + Vite + Firebase frontend
│   └── api/          # Node.js Express API with Stripe integration
├── ai/               # Python AI modules
│   ├── analysis/     # Audio analysis (librosa)
│   ├── speech/       # Speech-to-text (Whisper)
│   ├── voice_cloning/# Voice cloning
│   ├── stems/        # Stem separation (Demucs)
│   └── mastering/    # Audio mastering (FFmpeg)
└── infra/           # Infrastructure as code
    ├── docker/      # Docker Compose setup
    ├── terraform/   # GCP/Cloud deployment
    └── scripts/     # Deployment scripts
```

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Firebase (Auth, Firestore, Storage)
- Stripe Elements
- React Dropzone
- WaveSurfer.js

### Backend
- Node.js + Express
- Firebase Admin SDK
- Stripe
- Bull (job queues)
- Redis

### AI/ML
- PyTorch
- Librosa
- OpenAI Whisper
- Demucs
- FFmpeg

### Infrastructure
- Docker & Docker Compose
- Terraform (GCP)
- Cloud Run
- Firebase Hosting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- Firebase CLI
- CUDA-capable GPU (for production AI workloads)

### Local Development

1. **Clone and setup**
```bash
cd folsetech-ai-studio
cp .env.example .env
# Edit .env with your credentials
```

2. **Start services**
```bash
chmod +x infra/scripts/dev.sh
./infra/scripts/dev.sh
```

3. **Access the application**
- Web App: http://localhost:3000
- API: http://localhost:4000
- AI Service: http://localhost:8000

### Manual Setup (without Docker)

**Frontend:**
```bash
cd apps/web
npm install
npm run dev
```

**Backend API:**
```bash
cd apps/api
npm install
npm run dev
```

**AI Service:**
```bash
cd ai
pip install -r requirements.txt
python -m http.server 8000
```

## 📦 Deployment

### Deploy to GCP with Firebase

```bash
chmod +x infra/scripts/deploy.sh
./infra/scripts/deploy.sh
```

This will:
1. Build Docker images
2. Push to Google Container Registry
3. Deploy infrastructure with Terraform
4. Deploy web app to Firebase Hosting

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication, Firestore, and Storage
3. Download service account key
4. Update `.env` with Firebase credentials

### Stripe Setup

1. Create account at https://stripe.com
2. Get API keys from dashboard
3. Set up webhook endpoint for payment events
4. Update `.env` with Stripe keys

## 📝 API Endpoints

- `POST /api/analyze` - Analyze audio file
- `POST /api/transcribe` - Transcribe speech
- `POST /api/separate` - Separate stems
- `POST /api/master` - Master audio
- `GET /api/jobs/:jobId` - Get job status
- `POST /api/create-payment-intent` - Create Stripe payment

## 🎯 Usage Examples

### Audio Analysis
```bash
curl -X POST http://localhost:4000/api/analyze \
  -F "audio=@song.wav"
```

### Speech to Text
```bash
curl -X POST http://localhost:4000/api/transcribe \
  -F "audio=@speech.wav"
```

### Stem Separation
```bash
curl -X POST http://localhost:4000/api/separate \
  -F "audio=@song.wav"
```

## 🧪 Testing

**API tests:**
```bash
cd apps/api
npm test
```

**Frontend tests:**
```bash
cd apps/web
npm test
```

## 📄 License

Copyright © 2025 FolseTech AI Solutions LLC

## 🤝 Support

For support, email support@folsetech.com or open an issue.

## 🙏 Acknowledgments

- OpenAI Whisper for speech recognition
- Demucs for stem separation
- FFmpeg for audio processing
- Firebase for backend infrastructure
