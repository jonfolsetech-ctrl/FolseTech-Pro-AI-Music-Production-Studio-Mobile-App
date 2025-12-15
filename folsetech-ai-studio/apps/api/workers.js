const Queue = require('bull');
const axios = require('axios');
const admin = require('firebase-admin');
require('dotenv').config();

const db = admin.firestore();

// AI Service URL (where Python services run)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Job Queues
const analysisQueue = new Queue('audio-analysis', process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const transcriptionQueue = new Queue('transcription', process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const stemQueue = new Queue('stem-separation', process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const masteringQueue = new Queue('mastering', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// Analysis Worker
analysisQueue.process(async (job) => {
  const { userId, fileUrl, filename } = job.data;
  
  try {
    await db.collection('jobs').doc(job.id.toString()).update({ status: 'processing' });
    
    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      fileUrl,
      filename
    });

    await db.collection('jobs').doc(job.id.toString()).update({
      status: 'completed',
      result: response.data,
      completedAt: Date.now()
    });

    return response.data;
  } catch (error) {
    await db.collection('jobs').doc(job.id.toString()).update({
      status: 'failed',
      error: error.message,
      failedAt: Date.now()
    });
    throw error;
  }
});

// Transcription Worker
transcriptionQueue.process(async (job) => {
  const { userId, fileUrl, filename } = job.data;
  
  try {
    await db.collection('jobs').doc(job.id.toString()).update({ status: 'processing' });
    
    const response = await axios.post(`${AI_SERVICE_URL}/transcribe`, {
      fileUrl,
      filename
    });

    await db.collection('jobs').doc(job.id.toString()).update({
      status: 'completed',
      result: response.data,
      completedAt: Date.now()
    });

    return response.data;
  } catch (error) {
    await db.collection('jobs').doc(job.id.toString()).update({
      status: 'failed',
      error: error.message,
      failedAt: Date.now()
    });
    throw error;
  }
});

// Stem Separation Worker
stemQueue.process(async (job) => {
  const { userId, fileUrl, filename } = job.data;
  
  try {
    await db.collection('jobs').doc(job.id.toString()).update({ status: 'processing' });
    
    const response = await axios.post(`${AI_SERVICE_URL}/separate`, {
      fileUrl,
      filename
    });

    await db.collection('jobs').doc(job.id.toString()).update({
      status: 'completed',
      result: response.data,
      completedAt: Date.now()
    });

    return response.data;
  } catch (error) {
    await db.collection('jobs').doc(job.id.toString()).update({
      status: 'failed',
      error: error.message,
      failedAt: Date.now()
    });
    throw error;
  }
});

// Mastering Worker
masteringQueue.process(async (job) => {
  const { userId, fileUrl, filename, settings } = job.data;
  
  try {
    await db.collection('jobs').doc(job.id.toString()).update({ status: 'processing' });
    
    const response = await axios.post(`${AI_SERVICE_URL}/master`, {
      fileUrl,
      filename,
      settings
    });

    await db.collection('jobs').doc(job.id.toString()).update({
      status: 'completed',
      result: response.data,
      completedAt: Date.now()
    });

    return response.data;
  } catch (error) {
    await db.collection('jobs').doc(job.id.toString()).update({
      status: 'failed',
      error: error.message,
      failedAt: Date.now()
    });
    throw error;
  }
});

console.log('Workers started and listening for jobs...');
