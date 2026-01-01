import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllConsoles } from '../config/Config';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const consoles = getAllConsoles();

  const handleConsoleClick = (consoleId) => {
    navigate(`/emulator/${consoleId}`);
  };

  // Create particles effect
  useEffect(() => {
    const createParticles = () => {
      const particlesContainer = document.getElementById('particles');
      if (!particlesContainer) return;
      
      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        particlesContainer.appendChild(particle);
      }
    };

    createParticles();

    // Add stagger animation to cards
    const cards = document.querySelectorAll('.console-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate');
      }, index * 100);
    });

    // Cleanup function
    return () => {
      const particlesContainer = document.getElementById('particles');
      if (particlesContainer) {
        particlesContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <div>
      {/* Floating background elements */}
      <div className="floating-elements">
        <div className="floating-element">🎮</div>
        <div className="floating-element">🕹️</div>
        <div className="floating-element">📱</div>
        <div className="floating-element">💿</div>
      </div>

      {/* Particles */}
      <div className="particles" id="particles"></div>

      <div className="container">
        <div className="hero-section">
          <h1 className="hero-title">🎮 Retro Console Emulator</h1>
          <p className="hero-subtitle">Trải nghiệm lại những game console kinh điển ngay trên trình duyệt</p>
        </div>

        <div className="consoles-grid">
          {consoles.map((console) => (
            <div
              key={console.id}
              className="console-card"
              data-console={console.id}
              onClick={() => handleConsoleClick(console.id)}
            >
              <div className="console-content">
                <div className="console-info">
                  <div className="console-icon">{console.icon}</div>
                  <h3 className="console-name">{console.name}</h3>
                  <p className="console-description">{console.description}</p>
                </div>
                <div className="supported-files">
                  <div className="files-label">📁 Định dạng hỗ trợ</div>
                  <div className="files-list">{console.files.join(', ')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;