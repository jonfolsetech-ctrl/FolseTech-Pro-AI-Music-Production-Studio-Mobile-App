const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Queue = require('bull');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Firebase Admin (only if credentials are provided)
let db, bucket;
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    db = admin.firestore();
    bucket = admin.storage().bucket();
    console.log('✓ Firebase Admin initialized');
  } catch (error) {
    console.warn('⚠️  Firebase Admin initialization failed:', error.message);
    console.warn('Running in limited mode without Firebase');
  }
} else {
  console.warn('⚠️  Firebase credentials not configured. Running in limited mode.');
}

// Job Queues
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const analysisQueue = new Queue('audio-analysis', redisUrl);
const transcriptionQueue = new Queue('transcription', redisUrl);
const stemQueue = new Queue('stem-separation', redisUrl);
const masteringQueue = new Queue('mastering', redisUrl);

console.log('✓ Job queues initialized');

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Audio Analysis
app.post('/api/analyze', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.headers['user-id'] || 'anonymous';

    // Upload to Firebase Storage
    const blob = bucket.file(`uploads/${Date.now()}_${file.originalname}`);
    await blob.save(require('fs').readFileSync(file.path));
    const fileUrl = await blob.getSignedUrl({ action: 'read', expires: Date.now() + 3600000 });

    // Create job
    const job = await analysisQueue.add({
      userId,
      fileUrl: fileUrl[0],
      filename: file.originalname
    });

    // Store in Firestore
    await db.collection('jobs').doc(job.id.toString()).set({
      userId,
      type: 'analysis',
      status: 'pending',
      fileUrl: fileUrl[0],
      createdAt: Date.now()
    });

    res.json({ jobId: job.id, status: 'pending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Speech to Text
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.headers['user-id'] || 'anonymous';

    const blob = bucket.file(`uploads/${Date.now()}_${file.originalname}`);
    await blob.save(require('fs').readFileSync(file.path));
    const fileUrl = await blob.getSignedUrl({ action: 'read', expires: Date.now() + 3600000 });

    const job = await transcriptionQueue.add({
      userId,
      fileUrl: fileUrl[0],
      filename: file.originalname
    });

    await db.collection('jobs').doc(job.id.toString()).set({
      userId,
      type: 'transcription',
      status: 'pending',
      fileUrl: fileUrl[0],
      createdAt: Date.now()
    });

    res.json({ jobId: job.id, status: 'pending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// Stem Separation
app.post('/api/separate', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.headers['user-id'] || 'anonymous';

    const blob = bucket.file(`uploads/${Date.now()}_${file.originalname}`);
    await blob.save(require('fs').readFileSync(file.path));
    const fileUrl = await blob.getSignedUrl({ action: 'read', expires: Date.now() + 3600000 });

    const job = await stemQueue.add({
      userId,
      fileUrl: fileUrl[0],
      filename: file.originalname
    });

    await db.collection('jobs').doc(job.id.toString()).set({
      userId,
      type: 'stem-separation',
      status: 'pending',
      fileUrl: fileUrl[0],
      createdAt: Date.now()
    });

    res.json({ jobId: job.id, status: 'pending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Stem separation failed' });
  }
});

// Mastering
app.post('/api/master', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    const settings = JSON.parse(req.body.settings);
    const userId = req.headers['user-id'] || 'anonymous';

    const blob = bucket.file(`uploads/${Date.now()}_${file.originalname}`);
    await blob.save(require('fs').readFileSync(file.path));
    const fileUrl = await blob.getSignedUrl({ action: 'read', expires: Date.now() + 3600000 });

    const job = await masteringQueue.add({
      userId,
      fileUrl: fileUrl[0],
      filename: file.originalname,
      settings
    });

    await db.collection('jobs').doc(job.id.toString()).set({
      userId,
      type: 'mastering',
      status: 'pending',
      fileUrl: fileUrl[0],
      settings,
      createdAt: Date.now()
    });

    res.json({ jobId: job.id, status: 'pending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Mastering failed' });
  }
});

// Voice Cloning / Text-to-Sing
app.post('/api/voice-clone', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    const { text, mode } = req.body; // mode: 'speech' or 'sing'
    const userId = req.headers['user-id'] || 'anonymous';

    if (!file || !text) {
      return res.status(400).json({ error: 'Audio file and text are required' });
    }

    // Return the uploaded file as a demo (in production, this would be the generated audio)
    // This allows you to see the waveform visualization working
    const audioPath = `/uploads/${path.basename(file.path)}`;
    
    res.json({ 
      success: true,
      message: `Demo: Showing your uploaded audio. Configure AI service for actual ${mode === 'sing' ? 'singing' : 'voice cloning'}`,
      audioUrl: audioPath,
      text: text,
      mode: mode,
      note: 'This is your uploaded audio file. Real AI processing requires model configuration.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Voice cloning failed' });
  }
});

// Song Generation
app.post('/api/generate-song', async (req, res) => {
  try {
    const { genre, style, lyrics } = req.body;
    const userId = req.headers['user-id'] || 'anonymous';

    if (!lyrics) {
      return res.status(400).json({ error: 'Lyrics are required' });
    }

    // Demo response - in production, this would call an AI music generation service
    // like MusicGen, AudioCraft, or similar models
    res.json({ 
      success: true,
      message: `AI song generation in ${genre} genre`,
      audioUrl: null, // Would be the generated MP3 URL
      genre: genre,
      style: style,
      note: 'Configure AI music generation service (MusicGen, Suno AI, etc.) to generate actual songs with vocals and instrumentals'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Song generation failed' });
  }
});

// Get job status
app.get('/api/jobs/:jobId', async (req, res) => {
  try {
    const doc = await db.collection('jobs').doc(req.params.jobId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(doc.data());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

// Stripe Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

// Stripe Webhook
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // Handle successful payment
    }

    res.json({ received: true });
  } catch (error) {
    console.error(error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
