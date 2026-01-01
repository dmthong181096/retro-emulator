import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EmulatorPage = () => {
  const { console: consoleType } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameLoaded, setIsGameLoaded] = useState(false);

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

    // Cleanup function - runs when component unmounts OR when dependencies change
    const cleanup = () => {
      console.log('🧹 Cleaning up EmulatorJS...');
      
      // Reset states
      setIsGameStarted(false);
      setIsGameLoaded(false);
      
      const particlesContainer = document.getElementById('particles');
      if (particlesContainer) {
        particlesContainer.innerHTML = '';
      }
      
      // Cleanup game container (iframe will be destroyed automatically)
      const gameContainer = document.getElementById('gameContainer');
      if (gameContainer) {
        gameContainer.innerHTML = '';
      }
      
      // Remove any remaining scripts (just in case)
      const scripts = document.querySelectorAll('script[src*="loader.js"], script[src*="emulator.min.js"], script[src*="emulator.js"]');
      scripts.forEach(script => {
        try {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        } catch (e) {
          console.warn('Script cleanup warning:', e);
        }
      });
    };

    // Return cleanup function
    return cleanup;
  }, []);

  // Additional cleanup when component unmounts (backup)
  useEffect(() => {
    return () => {
      console.log('🚪 Component unmounting - final cleanup');
      // Simple cleanup since we're using iframe isolation
      const gameContainer = document.getElementById('gameContainer');
      if (gameContainer) {
        gameContainer.innerHTML = '';
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
    
    // Add delay to ensure DOM is ready
    setTimeout(() => {
      try {
        console.log('🚀 Starting game:', selectedFile.name);
        
        // Create object URL for the file
        const gameUrl = URL.createObjectURL(selectedFile);
        console.log('🔗 Game URL created:', gameUrl);
        
        // Clear any existing content
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
          gameContainer.innerHTML = '';
        }
        
        // Create iframe to isolate EmulatorJS
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '480px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '15px';
        iframe.style.backgroundColor = '#000';
        
        // Create HTML content for iframe
        const iframeContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Emulator</title>
            <style>
              body { margin: 0; padding: 0; background: #000; }
              #emulator { width: 100%; height: 480px; }
            </style>
          </head>
          <body>
            <div id="emulator"></div>
            <script>
              window.EJS_player = "#emulator";
              window.EJS_core = "${getConsoleCore(consoleType)}";
              window.EJS_pathtodata = "${window.location.origin}/emulatorjs/";
              window.EJS_gameUrl = "${gameUrl}";
              window.EJS_language = "en-US";
              window.EJS_startOnLoaded = true;
              window.EJS_fullscreenOnLoad = false;
              window.EJS_gameID = "${selectedFile.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}";
              window.EJS_gameName = "${selectedFile.name}";
              window.EJS_width = "100%";
              window.EJS_height = "480px";
              
              window.EJS_onGameStart = function() {
                console.log('🎉 Game started in iframe!');
                parent.postMessage({type: 'gameStarted'}, '*');
              };
              
              window.EJS_onError = function(error) {
                console.error('❌ EmulatorJS Error in iframe:', error);
                parent.postMessage({type: 'gameError', error: error}, '*');
              };
            </script>
            <script src="${window.location.origin}/emulatorjs/loader.js?t=${Date.now()}"></script>
          </body>
          </html>
        `;
        
        // Set iframe content
        iframe.onload = function() {
          console.log('✅ Iframe loaded successfully');
        };
        
        iframe.srcdoc = iframeContent;
        gameContainer.appendChild(iframe);
        
        // Listen for messages from iframe
        const messageHandler = (event) => {
          if (event.data.type === 'gameStarted') {
            console.log('🎉 Game started successfully in iframe!');
            setIsGameLoaded(true);
          } else if (event.data.type === 'gameError') {
            console.error('❌ Game error in iframe:', event.data.error);
            setIsGameStarted(false);
            setIsGameLoaded(false);
          }
        };
        
        window.addEventListener('message', messageHandler);
        
        // Cleanup message listener when component unmounts
        return () => {
          window.removeEventListener('message', messageHandler);
        };
        
      } catch (error) {
        console.error('❌ Error starting game:', error);
        setIsGameStarted(false);
      }
    }, 300);
  };

  const getConsoleCore = (console) => {
    const cores = {
      'nes': 'fceumm',
      'snes': 'snes9x',
      'gb': 'gambatte',
      'gba': 'mgba',
      'genesis': 'genesis_plus_gx',
      'psx': 'pcsx_rearmed'
    };
    return cores[console] || 'mgba';
  };

  const goHome = () => {
    navigate('/');
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
          <p className="supported-formats-text">Hỗ trợ: {currentConsole.files.join(', ')}</p>
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
                  disabled={isGameLoaded}
                />
                <label 
                  htmlFor="romFile" 
                  className={`file-input-label ${isGameLoaded ? 'disabled' : ''}`}
                >
                  {selectedFile ? (
                    <>✅ {selectedFile.name.length > 15 ? selectedFile.name.substring(0, 15) + '...' : selectedFile.name}</>
                  ) : (
                    <>📁 {isGameLoaded ? 'Game đã tải' : 'Chọn ROM File'}</>
                  )}
                </label>
              </div>
              
              <button 
                className="control-button play-button" 
                onClick={startGame} 
                disabled={!selectedFile || isGameStarted}
              >
                {isGameStarted ? (isGameLoaded ? '🎮 Đang chơi' : '🔄 Đang tải...') : '🎮 Chơi Game'}
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