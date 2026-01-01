import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const consoles = [
    {
      id: 'nes',
      name: 'Nintendo Entertainment System',
      icon: '🎮',
      description: 'Console huyền thoại với những game kinh điển như Mario, Zelda'
    },
    {
      id: 'snes',
      name: 'Super Nintendo',
      icon: '🕹️',
      description: 'Thế hệ tiếp theo với đồ họa 16-bit tuyệt vời'
    },
    {
      id: 'gb',
      name: 'Game Boy',
      icon: '📱',
      description: 'Console cầm tay huyền thoại của Nintendo'
    },
    {
      id: 'gba',
      name: 'Game Boy Advance',
      icon: '🎯',
      description: 'Game Boy với đồ họa 32-bit và màn hình màu'
    },
    {
      id: 'genesis',
      name: 'Sega Genesis',
      icon: '⚡',
      description: 'Console 16-bit của Sega với Sonic the Hedgehog'
    },
    {
      id: 'psx',
      name: 'PlayStation 1',
      icon: '💿',
      description: 'Console 32-bit đầu tiên của Sony'
    }
  ];

  const handleConsoleClick = (consoleId) => {
    navigate(`/emulator/${consoleId}`);
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#00ff88' }}>
          🎮 Retro Console Emulator
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Trải nghiệm lại những game console kinh điển ngay trên trình duyệt
        </p>
      </div>

      <div className="console-grid">
        {consoles.map((console) => (
          <div
            key={console.id}
            className="console-card"
            onClick={() => handleConsoleClick(console.id)}
          >
            <div className="console-icon">{console.icon}</div>
            <h3>{console.name}</h3>
            <p>{console.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;