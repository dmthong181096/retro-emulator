import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const consoles = [
    {
      id: 'nes',
      name: 'Nintendo Entertainment System',
      icon: '🎮',
      description: 'Console huyền thoại với những game kinh điển như Mario, Zelda',
      supportedFiles: ['.nes']
    },
    {
      id: 'snes',
      name: 'Super Nintendo',
      icon: '🕹️',
      description: 'Thế hệ tiếp theo với đồ họa 16-bit tuyệt vời',
      supportedFiles: ['.smc', '.sfc']
    },
    {
      id: 'gb',
      name: 'Game Boy',
      icon: '📱',
      description: 'Console cầm tay huyền thoại của Nintendo',
      supportedFiles: ['.gb', '.gbc']
    },
    {
      id: 'gba',
      name: 'Game Boy Advance',
      icon: '🎯',
      description: 'Game Boy với đồ họa 32-bit và màn hình màu',
      supportedFiles: ['.gba']
    },
    {
      id: 'genesis',
      name: 'Sega Genesis',
      icon: '⚡',
      description: 'Console 16-bit của Sega với Sonic the Hedgehog',
      supportedFiles: ['.md', '.gen']
    },
    {
      id: 'psx',
      name: 'PlayStation 1',
      icon: '💿',
      description: 'Console 32-bit đầu tiên của Sony',
      supportedFiles: ['.bin', '.iso']
    }
  ];

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
                  <div className="files-list">{console.supportedFiles.join(', ')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;