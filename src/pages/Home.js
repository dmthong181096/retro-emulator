import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllConsoles } from '../config/Config';
import Layout from '../components/Layout';
import FloatingElements from '../components/FloatingElements';
import ConsoleCard from '../components/ConsoleCard';

const Home = () => {
  const navigate = useNavigate();
  const consoles = getAllConsoles();

  const handleConsoleClick = (consoleId) => {
    navigate(`/emulator/${consoleId}`);
  };

  useEffect(() => {
    // Add stagger animation to cards
    const cards = document.querySelectorAll('.console-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate');
      }, index * 100);
    });
  }, []);

  return (
    <Layout>
      <FloatingElements elements={['🎮', '🕹️', '📱', '💿']} />

      <div className="hero-section">
        <h1 className="hero-title">🎮 Retro Console Emulator</h1>
        <p className="hero-subtitle">Trải nghiệm lại những game console kinh điển ngay trên trình duyệt</p>
      </div>

      <div className="consoles-grid">
        {consoles.map((console) => (
          <ConsoleCard
            key={console.id}
            console={console}
            onClick={handleConsoleClick}
          />
        ))}
      </div>
    </Layout>
  );
};

export default Home;