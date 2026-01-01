import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EmulatorPage = () => {
  const { console: consoleType } = useParams();
  const navigate = useNavigate();
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
      
      // Cleanup EmulatorJS safely
      const gameContainer = document.getElementById('gameContainer');
      if (gameContainer) {
        gameContainer.innerHTML = '';
      }
      
      // Remove EmulatorJS scripts safely
      const scripts = document.querySelectorAll('script[src*="loader.js"]');
      scripts.forEach(script => {
        try {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        } catch (e) {
          console.warn('Script cleanup warning:', e);
        }
      });
      
      // Clear EmulatorJS globals safely
      try {
        if (window.EJS_player) delete window.EJS_player;
        if (window.EJS_core) delete window.EJS_core;
        if (window.EJS_gameUrl) delete window.EJS_gameUrl;
        if (window.EJS_onGameStart) delete window.EJS_onGameStart;
        if (window.EJS_onError) delete window.EJS_onError;
        if (window.EJS_pathtodata) delete window.EJS_pathtodata;
        if (window.EJS_language) delete window.EJS_language;
        if (window.EJS_startOnLoaded) delete window.EJS_startOnLoaded;
        if (window.EJS_fullscreenOnLoad) delete window.EJS_fullscreenOnLoad;
        if (window.EJS_gameID) delete window.EJS_gameID;
        if (window.EJS_gameName) delete window.EJS_gameName;
        if (window.EJS_width) delete window.EJS_width;
        if (window.EJS_height) delete window.EJS_height;
        if (window.EJS_STORAGE) delete window.EJS_STORAGE;
        if (window.EJS_biosUrl) delete window.EJS_biosUrl;
        if (window.EJS_gameParent) delete window.EJS_gameParent;
        if (window.EJS_oldCores) delete window.EJS_oldCores;
        if (window.EJS_lightgun) delete window.EJS_lightgun;
        if (window.EJS_mouse) delete window.EJS_mouse;
        if (window.EJS_multitap) delete window.EJS_multitap;
        if (window.EJS_softpatching) delete window.EJS_softpatching;
        if (window.EJS_cheats) delete window.EJS_cheats;
        if (window.EJS_defaultControls) delete window.EJS_defaultControls;
        if (window.EJS_threads) delete window.EJS_threads;
        if (window.EJS_DEBUG_XX) delete window.EJS_DEBUG_XX;
        if (window.EJS_RESET_VARS) delete window.EJS_RESET_VARS;
        if (window.EJS_ready) delete window.EJS_ready;
        if (window.EJS_emulator) delete window.EJS_emulator;
        if (window.EJS_gameManager) delete window.EJS_gameManager;
        if (window.EJS_main) delete window.EJS_main;
        if (window.EJS_terminate) delete window.EJS_terminate;
        if (window.EJS_restart) delete window.EJS_restart;
        if (window.EJS_pause) delete window.EJS_pause;
        if (window.EJS_mute) delete window.EJS_mute;
        if (window.EJS_volume) delete window.EJS_volume;
        if (window.EJS_color) delete window.EJS_color;
        if (window.EJS_startVirtualGamepad) delete window.EJS_startVirtualGamepad;
        if (window.EJS_stopVirtualGamepad) delete window.EJS_stopVirtualGamepad;
        if (window.EJS_virtualGamepadSettings) delete window.EJS_virtualGamepadSettings;
        if (window.EJS_AdUrl) delete window.EJS_AdUrl;
        if (window.EJS_loadStateURL) delete window.EJS_loadStateURL;
        if (window.EJS_loadState) delete window.EJS_loadState;
        if (window.EJS_saveState) delete window.EJS_saveState;
        if (window.EJS_quickSaveState) delete window.EJS_quickSaveState;
        if (window.EJS_quickLoadState) delete window.EJS_quickLoadState;
        if (window.EJS_screenshot) delete window.EJS_screenshot;
        if (window.EJS_fullscreen) delete window.EJS_fullscreen;
        if (window.EJS_toggleMainLoop) delete window.EJS_toggleMainLoop;
        if (window.EJS_simulateInput) delete window.EJS_simulateInput;
        if (window.EJS_setVolume) delete window.EJS_setVolume;
        if (window.EJS_getVolume) delete window.EJS_getVolume;
        if (window.EJS_setVariable) delete window.EJS_setVariable;
        if (window.EJS_getVariable) delete window.EJS_getVariable;
        if (window.EJS_resizeCanvas) delete window.EJS_resizeCanvas;
        if (window.EJS_functions) delete window.EJS_functions;
        if (window.EJS_cachedFunction) delete window.EJS_cachedFunction;
        if (window.EJS_Buttons) delete window.EJS_Buttons;
        if (window.EJS_VirtualGamepadSettings) delete window.EJS_VirtualGamepadSettings;
        if (window.EJS_onSaveState) delete window.EJS_onSaveState;
        if (window.EJS_onLoadState) delete window.EJS_onLoadState;
        if (window.EJS_Netplay) delete window.EJS_Netplay;
        if (window.EJS_NetplayConfig) delete window.EJS_NetplayConfig;
        
        // Clear all EJS_ prefixed variables
        Object.keys(window).forEach(key => {
          if (key.startsWith('EJS_')) {
            try {
              delete window[key];
            } catch (e) {
              // Ignore errors for non-configurable properties
            }
          }
        });
      } catch (e) {
        console.warn('Cleanup warning:', e);
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
        
        // Clear any existing EmulatorJS content safely
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
          gameContainer.innerHTML = '';
        }
        
        // Set EmulatorJS variables
        window.EJS_player = "#gameContainer";
        window.EJS_core = getConsoleCore(consoleType);
        window.EJS_pathtodata = "/emulatorjs/";
        window.EJS_gameUrl = gameUrl;
        window.EJS_language = "en-US";
        window.EJS_startOnLoaded = true;
        window.EJS_fullscreenOnLoad = false;
        window.EJS_gameID = selectedFile.name.replace(/[^a-zA-Z0-9]/g, '_');
        window.EJS_gameName = selectedFile.name;
        window.EJS_width = '100%';
        window.EJS_height = '480px';
        
        console.log('🎯 EmulatorJS variables set for', consoleType);
        
        // Set up EmulatorJS callbacks
        window.EJS_onGameStart = function() {
          console.log('🎉 Game started successfully!');
        };

        window.EJS_onError = function(error) {
          console.error('❌ EmulatorJS Error:', error);
          setIsGameStarted(false);
        };
        
        // Remove any existing EmulatorJS scripts safely
        const existingScripts = document.querySelectorAll('script[src*="loader.js"]');
        existingScripts.forEach(script => {
          try {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          } catch (e) {
            console.warn('Script already removed:', e);
          }
        });
        
        // Clear all EJS_ prefixed variables before loading new game
        Object.keys(window).forEach(key => {
          if (key.startsWith('EJS_')) {
            try {
              delete window[key];
            } catch (e) {
              // Ignore errors for non-configurable properties
            }
          }
        });
        
        // Add delay before loading new script
        setTimeout(() => {
          // Load EmulatorJS
          const script = document.createElement('script');
          script.src = '/emulatorjs/loader.js';
          script.onload = function() {
            console.log('✅ EmulatorJS loaded successfully');
          };
          script.onerror = function(error) {
            console.error('❌ Failed to load EmulatorJS:', error);
            setIsGameStarted(false);
          };
          
          document.body.appendChild(script);
        }, 500);
        
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