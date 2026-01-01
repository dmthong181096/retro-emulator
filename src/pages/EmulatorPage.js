import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const EmulatorPage = () => {
  const { console: consoleType } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Console information with supported file formats
  const consoleInfo = {
    nes: { name: 'Nintendo Entertainment System', icon: '🎮', files: ['.nes'], color: 'nes' },
    snes: { name: 'Super Nintendo', icon: '🕹️', files: ['.smc', '.sfc'], color: 'snes' },
    gb: { name: 'Game Boy', icon: '📱', files: ['.gb', '.gbc'], color: 'gb' },
    gba: { name: 'Game Boy Advance', icon: '🎯', files: ['.gba'], color: 'gba' },
    genesis: { name: 'Sega Genesis', icon: '⚡', files: ['.md', '.gen'], color: 'genesis' },
    psx: { name: 'PlayStation 1', icon: '💿', files: ['.bin', '.iso'], color: 'psx' }
  };

  const currentConsole = consoleInfo[consoleType] || { name: 'Unknown Console', icon: '🎮', files: [], color: 'nes' };

  useEffect(() => {
    // Create particles effect
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

    // Cleanup function
    return () => {
      const particlesContainer = document.getElementById('particles');
      if (particlesContainer) {
        particlesContainer.innerHTML = '';
      }
    };
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const startGame = () => {
    if (!selectedFile) {
      alert('Vui lòng chọn ROM file trước!');
      return;
    }

    setIsGameStarted(true);
    
    // Convert file to base64 and pass via URL
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Data = btoa(e.target.result);
      const fileName = encodeURIComponent(selectedFile.name);
      const redirectUrl = `/emulator.html?console=${consoleType}&file=${fileName}&data=${base64Data}`;
      
      console.log('🔄 Redirecting to standalone emulator page with file data');
      window.location.href = redirectUrl;
    };
    reader.readAsBinaryString(selectedFile);
  };

  const goHome = () => {
    window.location.href = '/';
  };

  const renderGameContainer = () => {
    if (isGameStarted) {
      return (
        <div className="game-placeholder">
          <div className="game-placeholder-icon">🔄</div>
          <h3>Đang tải game...</h3>
          <p>Vui lòng đợi trong giây lát</p>
        </div>
      );
    }

    if (selectedFile) {
      return (
        <div className="game-placeholder">
          <div className="game-placeholder-icon">✅</div>
          <h3>ROM đã được chọn: {selectedFile.name}</h3>
          <p>Nhấn "Chơi Game" để bắt đầu</p>
        </div>
      );
    }

    return (
      <div className="game-placeholder">
        <div className="game-placeholder-icon">{currentConsole.icon}</div>
        <h3>Chọn ROM file để bắt đầu chơi</h3>
        <p>Hỗ trợ định dạng: {currentConsole.files.join(', ')}</p>
      </div>
    );
  };

  return (
    <div>
      {/* Floating background elements */}
      <div className="floating-elements">
        <div className="floating-element">{currentConsole.icon}</div>
        <div className="floating-element">🎮</div>
        <div className="floating-element">⚡</div>
        <div className="floating-element">🎯</div>
      </div>

      {/* Particles */}
      <div className="particles" id="particles"></div>

      <div className="container">
        <div className="emulator-header">
          <h1 className={`console-title ${currentConsole.color}`}>
            {currentConsole.icon} {currentConsole.name}
          </h1>
          <p className="console-subtitle">Chọn ROM file và nhấn "Chơi Game" để bắt đầu</p>
        </div>

        <div className="main-content">
          <div className="emulator-container">
            <div className="controls-section">
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  id="romFile" 
                  className="file-input" 
                  accept={currentConsole.files.join(',')} 
                  onChange={handleFileSelect}
                />
                <label htmlFor="romFile" className="file-input-label">
                  📁 Chọn ROM File
                </label>
              </div>
              
              <button 
                className="control-button" 
                onClick={startGame} 
                disabled={!selectedFile || isGameStarted}
              >
                {isGameStarted ? '🔄 Đang tải...' : '🎮 Chơi Game'}
              </button>
              
              <button className="control-button home" onClick={goHome}>
                🏠 Trang chủ
              </button>
            </div>

            <div className="game-container" id="gameContainer">
              {renderGameContainer()}
            </div>
          </div>

          <div className="instructions">
            <h3>🎮 Hướng dẫn sử dụng:</h3>
            <div className="instructions-grid">
              <div className="instruction-item">
                <div className="instruction-icon">📁</div>
                <div>
                  <strong>Chọn ROM:</strong> Click "Chọn ROM File" và chọn file game
                </div>
              </div>
              <div className="instruction-item">
                <div className="instruction-icon">🎮</div>
                <div>
                  <strong>Khởi động:</strong> Nhấn "Chơi Game" để bắt đầu
                </div>
              </div>
              <div className="instruction-item">
                <div className="instruction-icon">⌨️</div>
                <div>
                  <strong>Điều khiển:</strong> Arrow keys, Z (A), X (B), Enter (Start)
                </div>
              </div>
              <div className="instruction-item">
                <div className="instruction-icon">🖥️</div>
                <div>
                  <strong>Toàn màn hình:</strong> Nhấn F11 hoặc menu trong game
                </div>
              </div>
            </div>

            <div className="legal-notice">
              <h4>⚖️ Lưu ý bản quyền</h4>
              <ul>
                <li>Chỉ sử dụng ROM từ game bạn sở hữu hợp pháp</li>
                <li>Tuân thủ luật bản quyền trong khu vực của bạn</li>
                <li>Tôn trọng quyền sở hữu trí tuệ của nhà phát triển</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmulatorPage;