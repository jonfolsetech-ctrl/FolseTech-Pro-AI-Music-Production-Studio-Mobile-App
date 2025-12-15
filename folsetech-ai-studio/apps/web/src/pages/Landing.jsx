import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const isMobile = window.innerWidth <= 768;
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
      color: '#fff'
    }}>
      {/* Hero Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '40px 15px' : '60px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: isMobile ? '2rem' : '4rem',
          background: 'linear-gradient(135deg, #ff6b00 0%, #ff8533 50%, #ffaa66 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '20px',
          fontWeight: '900',
          textShadow: '2px 2px 8px rgba(255, 107, 0, 0.6), -1px -1px 4px rgba(255, 133, 51, 0.5), 0 0 20px rgba(255, 107, 0, 0.3)',
          lineHeight: '1.2'
        }}>
          Folsetech Pro Ai Music Production Studio
        </h1>
        
        <p style={{
          fontSize: isMobile ? '1rem' : '1.5rem',
          color: '#aaa',
          marginBottom: '40px',
          maxWidth: '700px',
          margin: '0 auto 40px',
          padding: isMobile ? '0 10px' : '0'
        }}>
          Professional music production powered by cutting-edge AI.
          Create, mix, master, and produce like the pros.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '10px' : '20px', 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          padding: isMobile ? '0 10px' : '0'
        }}>
          <Link 
            to="/studio"
            style={{
              padding: isMobile ? '14px 24px' : '18px 40px',
              background: 'linear-gradient(135deg, #ff6b00 0%, #ff8533 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: isMobile ? '1rem' : '1.2rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(255, 107, 0, 0.4)',
              transition: 'all 0.3s',
              display: 'inline-block',
              flex: isMobile ? '1 1 auto' : 'none',
              minWidth: isMobile ? '140px' : 'auto'
            }}
          >
            🎵 Launch Studio
          </Link>

          <Link 
            to="/dashboard"
            style={{
              padding: isMobile ? '14px 24px' : '18px 40px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid #ff6b00',
              borderRadius: '12px',
              color: '#fff',
              fontSize: isMobile ? '1rem' : '1.2rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              transition: 'all 0.3s',
              display: 'inline-block',
              flex: isMobile ? '1 1 auto' : 'none',
              minWidth: isMobile ? '140px' : 'auto'
            }}
          >
            📊 Dashboard
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: isMobile ? '40px auto' : '80px auto',
        padding: isMobile ? '0 15px' : '0 20px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: isMobile ? '20px' : '30px'
      }}>
        {[
          {
            icon: '🎹',
            title: 'AI Melody Generator',
            description: 'Generate original melodies with AWS Bedrock AI. Describe what you want and let AI compose.'
          },
          {
            icon: '🎚️',
            title: 'Professional Mastering',
            description: 'Industry-standard mastering profiles optimized for streaming, vinyl, and clubs.'
          },
          {
            icon: '🎛️',
            title: 'Stem Mixer',
            description: 'Separate and mix vocals, drums, bass, and instruments independently.'
          },
          {
            icon: '🎼',
            title: 'Piano Roll Editor',
            description: 'Full-featured MIDI editor for precise note editing and programming.'
          },
          {
            icon: '📊',
            title: 'DAW Timeline',
            description: 'Professional timeline interface with clip editing, automation, and arrangement.'
          },
          {
            icon: '🎤',
            title: 'Voice Cloning',
            description: 'Clone any voice and generate speech or singing with custom text.'
          },
          {
            icon: '🎵',
            title: 'AI Song Generator',
            description: 'Generate complete songs with lyrics across 20+ genres.'
          },
          {
            icon: '☁️',
            title: 'Cloud Processing',
            description: 'GPU-accelerated processing in the cloud for lightning-fast results.'
          }
        ].map((feature, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '30px',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ fontSize: isMobile ? '2.5rem' : '3rem', marginBottom: '15px' }}>{feature.icon}</div>
            <h3 style={{ color: '#ff6b00', marginBottom: '10px', fontSize: isMobile ? '1.1rem' : '1.3rem' }}>
              {feature.title}
            </h3>
            <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: isMobile ? '0.95rem' : '1rem' }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div style={{
        maxWidth: '800px',
        margin: isMobile ? '40px auto' : '80px auto',
        padding: isMobile ? '30px 15px' : '40px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', marginBottom: '20px', color: '#fff', lineHeight: '1.3' }}>
          Ready to create professional music?
        </h2>
        <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', color: '#aaa', marginBottom: '30px', padding: isMobile ? '0 10px' : '0' }}>
          Join thousands of producers using AI-powered tools
        </p>
        <Link 
          to="/studio"
          style={{
            padding: isMobile ? '14px 30px' : '18px 50px',
            background: 'linear-gradient(135deg, #ff6b00 0%, #ff8533 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: isMobile ? '1rem' : '1.2rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            boxShadow: '0 8px 30px rgba(255, 107, 0, 0.4)',
            display: 'inline-block'
          }}
        >
          Get Started Free →
        </Link>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: isMobile ? '30px 15px' : '40px 20px',
        textAlign: 'center',
        color: '#666',
        fontSize: isMobile ? '0.85rem' : '1rem'
      }}>
        <p>© 2025 FolseTech Pro AI Music Production Studio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
