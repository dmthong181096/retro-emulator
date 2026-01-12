import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './Auth/UserProfile';
import LoginModal from './Auth/LoginModal';
import Footer from './Footer';
import SupabaseStatus from './SupabaseStatus';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
      {/* Top Bar with Auth */}
      <div className="top-bar">
        <div className="top-bar-content">
          <div className="logo">
            🎮 Retro Emulator
          </div>
          
          <div className="auth-section">
            {user ? (
              <UserProfile />
            ) : (
              <button 
                className="login-btn"
                onClick={() => setShowLoginModal(true)}
              >
                🔐 Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Particles */}
      <div className="particles" id="particles"></div>

      <div className="container">
        {children}
      </div>

      <Footer />

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      {/* Supabase Status (only in development) */}
      {process.env.NODE_ENV === 'development' && <SupabaseStatus />}
    </div>
  );
};

export default Layout;