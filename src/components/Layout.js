import React, { useEffect } from 'react';
import Footer from './Footer';

const Layout = ({ children }) => {
  useEffect(() => {
    // Create particles effect - shared for all pages
    const createParticles = () => {
      const particlesContainer = document.getElementById('particles');
      if (!particlesContainer) return;
      
      const particleCount = 30;

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

    // Cleanup particles
    return () => {
      const particlesContainer = document.getElementById('particles');
      if (particlesContainer) {
        particlesContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <div>
      {/* Particles */}
      <div className="particles" id="particles"></div>

      <div className="container">
        {children}
      </div>

      <Footer />
    </div>
  );
};

export default Layout;