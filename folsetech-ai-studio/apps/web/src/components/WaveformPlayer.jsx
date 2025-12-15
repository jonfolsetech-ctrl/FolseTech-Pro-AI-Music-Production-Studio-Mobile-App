import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

const WaveformPlayer = ({ audioUrl, height = 128 }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  useEffect(() => {
    if (waveformRef.current && audioUrl) {
      // Create WaveSurfer instance
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(147, 51, 234, 0.5)',
        progressColor: '#9333ea',
        cursorColor: '#c084fc',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 2,
        height: height,
        barGap: 2,
        responsive: true,
        normalize: true,
      });

      // Load audio
      wavesurfer.current.load(audioUrl);

      // Event listeners
      wavesurfer.current.on('ready', () => {
        const dur = wavesurfer.current.getDuration();
        setDuration(formatTime(dur));
      });

      wavesurfer.current.on('audioprocess', () => {
        const time = wavesurfer.current.getCurrentTime();
        setCurrentTime(formatTime(time));
      });

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));

      // Cleanup
      return () => {
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
        }
      };
    }
  }, [audioUrl, height]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  return (
    <div className="waveform-container">
      <div ref={waveformRef} className="waveform"></div>
      <div className="waveform-controls">
        <button onClick={handlePlayPause} className="waveform-play-btn">
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div className="waveform-time">
          <span>{currentTime}</span>
          <span>/</span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
};

export default WaveformPlayer;
