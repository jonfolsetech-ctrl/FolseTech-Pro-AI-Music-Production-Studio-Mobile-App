import React, { useEffect, useState } from 'react';
import { db } from '../App';

function Dashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // Firebase not configured yet
    if (!db) {
      console.log('Firebase not configured');
      return;
    }
    loadRecentJobs();
  }, []);

  const loadRecentJobs = async () => {
    // This will work once Firebase is configured
    // const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(10));
    // const snapshot = await getDocs(q);
    // setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  return (
    <div>
      <h2>🎵 FolseTech Pro AI Music Production Studio</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Projects</div>
          <div className="value">0</div>
        </div>
        <div className="stat-card">
          <div className="label">Processing Time</div>
          <div className="value">0h</div>
        </div>
        <div className="stat-card">
          <div className="label">Files Processed</div>
          <div className="value">0</div>
        </div>
        <div className="stat-card">
          <div className="label">Success Rate</div>
          <div className="value">100%</div>
        </div>
      </div>

      <div className="feature-list">
        <div className="feature-card">
          <h4>🎼 Audio Analysis</h4>
          <p>Analyze tempo, key, loudness, and spectral features of your audio files with advanced AI algorithms.</p>
        </div>
        <div className="feature-card">
          <h4>� AI Song Generator</h4>
          <p>Generate complete songs with AI - choose genre, style, and provide lyrics for full MP3 productions.</p>
        </div>
        <div className="feature-card">
          <h4>🗣️ Voice Cloning</h4>
          <p>Clone any voice and generate speech or singing. Create unique vocal content instantly.</p>
        </div>
        <div className="feature-card">
          <h4>🎸 Stem Separation</h4>
          <p>Separate vocals, drums, bass, and other instruments using state-of-the-art Demucs technology.</p>
        </div>
        <div className="feature-card">
          <h4>🎚️ Audio Mastering</h4>
          <p>Professional loudness normalization and mastering with customizable LUFS targets and dynamics.</p>
        </div>
        <div className="feature-card">
          <h4>☁️ Cloud Processing</h4>
          <p>All processing happens in the cloud with GPU acceleration for lightning-fast results.</p>
        </div>
      </div>

      <div className="card">
        <h3>📊 Recent Jobs</h3>
        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ fontSize: '1.2rem', color: '#aaa' }}>No jobs yet. Start by processing some audio!</p>
            <p style={{ marginTop: '1rem', color: '#888' }}>Choose a feature from the navigation menu to get started.</p>
          </div>
        ) : (
          <table style={{ width: '100%', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{job.type}</td>
                  <td>{job.status}</td>
                  <td>{new Date(job.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
