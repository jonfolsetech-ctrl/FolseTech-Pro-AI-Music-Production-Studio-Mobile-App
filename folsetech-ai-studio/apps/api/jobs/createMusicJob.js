const Bull = require('bull');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const createMusicJob = async (req, res) => {
  try {
    const { type, userId, data } = req.body;

    // Validate job type
    const validTypes = ['melody', 'mastering', 'stems', 'voiceClone', 'songGeneration', 'transcription'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid job type' });
    }

    // Create queue for this job type
    const queue = new Bull(type, {
      redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost'
      }
    });

    // Add job to queue
    const job = await queue.add({
      userId,
      type,
      data,
      createdAt: Date.now()
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: false,
      removeOnFail: false
    });

    res.json({
      success: true,
      jobId: job.id,
      status: 'queued',
      message: `${type} job created successfully`
    });

  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create job',
      message: error.message 
    });
  }
};

const getJobStatus = async (req, res) => {
  try {
    const { jobId, type } = req.params;

    const queue = new Bull(type, {
      redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost'
      }
    });

    const job = await queue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;

    res.json({
      jobId: job.id,
      type,
      status: state,
      progress,
      result: state === 'completed' ? result : null,
      error: state === 'failed' ? job.failedReason : null,
      createdAt: job.timestamp,
      processedAt: job.processedOn,
      finishedAt: job.finishedOn
    });

  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({ 
      error: 'Failed to get job status',
      message: error.message 
    });
  }
};

const cancelJob = async (req, res) => {
  try {
    const { jobId, type } = req.params;

    const queue = new Bull(type, {
      redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost'
      }
    });

    const job = await queue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await job.remove();

    res.json({
      success: true,
      message: 'Job canceled successfully'
    });

  } catch (error) {
    console.error('Job cancellation error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel job',
      message: error.message 
    });
  }
};

module.exports = {
  createMusicJob,
  getJobStatus,
  cancelJob
};
