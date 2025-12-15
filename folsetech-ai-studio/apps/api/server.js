const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');
const Queue = require('bull');
require('dotenv').config();

// Import new API modules
const stripeCheckout = require('./stripe/checkout');
const stripeWebhook = require('./stripe/webhook');
const bedrockMelody = require('./bedrock/melody');
const bedrockCoproducer = require('./bedrock/coproducer');
const bedrockMasteringAI = require('./bedrock/masteringAI');
const { createMusicJob, getJobStatus, cancelJob } = require('./jobs/createMusicJob');

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

// ============================================
// STRIPE PAYMENT ROUTES
// ============================================

// Create Checkout Session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { priceId, userId, email, successUrl, cancelUrl } = req.body;
    const session = await stripeCheckout.createCheckoutSession({
      priceId,
      userId,
      email,
      successUrl,
      cancelUrl
    });
    res.json(session);
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create Payment Intent
app.post('/api/stripe/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, userId } = req.body;
    const paymentIntent = await stripeCheckout.createPaymentIntent({ amount, currency, userId });
    res.json(paymentIntent);
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Subscription
app.get('/api/stripe/subscription/:subscriptionId', async (req, res) => {
  try {
    const subscription = await stripeCheckout.getSubscription(req.params.subscriptionId);
    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel Subscription
app.post('/api/stripe/subscription/:subscriptionId/cancel', async (req, res) => {
  try {
    const subscription = await stripeCheckout.cancelSubscription(req.params.subscriptionId);
    res.json(subscription);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe Webhook
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    await stripeWebhook.handleWebhook(req.body, sig, db);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// ============================================
// AWS BEDROCK AI ROUTES
// ============================================

// Generate AI Melody
app.post('/api/bedrock/generate-melody', async (req, res) => {
  try {
    const { prompt, genre, mood, tempo, duration } = req.body;
    const melody = await bedrockMelody.generateMelody({ prompt, genre, mood, tempo, duration });
    res.json(melody);
  } catch (error) {
    console.error('Melody generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Producer Advice
app.post('/api/bedrock/producer-advice', async (req, res) => {
  try {
    const { question, context } = req.body;
    const advice = await bedrockCoproducer.getProducerAdvice(question, context);
    res.json({ advice });
  } catch (error) {
    console.error('Producer advice error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze Arrangement
app.post('/api/bedrock/analyze-arrangement', async (req, res) => {
  try {
    const { sections, genre, tempo } = req.body;
    const analysis = await bedrockCoproducer.analyzeArrangement(sections, genre, tempo);
    res.json(analysis);
  } catch (error) {
    console.error('Arrangement analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Mastering Recommendations
app.post('/api/bedrock/mastering-recommendations', async (req, res) => {
  try {
    const { audioAnalysis, targetPlatform, genre } = req.body;
    const recommendations = await bedrockMasteringAI.getMasteringRecommendations(
      audioAnalysis,
      targetPlatform,
      genre
    );
    res.json(recommendations);
  } catch (error) {
    console.error('Mastering recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// JOB QUEUE ROUTES
// ============================================

// Create Music Job
app.post('/api/jobs/create', async (req, res) => {
  try {
    const { jobType, jobData } = req.body;
    const job = await createMusicJob(jobType, jobData);
    res.json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Job Status
app.get('/api/jobs/:jobId', async (req, res) => {
  try {
    const status = await getJobStatus(req.params.jobId);
    res.json(status);
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel Job
app.post('/api/jobs/:jobId/cancel', async (req, res) => {
  try {
    const result = await cancelJob(req.params.jobId);
    res.json(result);
  } catch (error) {
    console.error('Cancel job error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
