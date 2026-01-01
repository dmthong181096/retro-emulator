import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsoleById, getConsoleCore } from '../config/Config';
import Layout from '../components/Layout';
import FloatingElements from '../components/FloatingElements';
import EmulatorControls from '../components/EmulatorControls';
import ErrorMessage from '../components/ErrorMessage';

const EmulatorPage = () => {
  const { console: consoleType } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameLoaded, setIsGameLoaded] = useState(false);
  const [error, setError] = useState(null);

  const currentConsole = getConsoleById(consoleType) || { 
    name: 'Unknown Console', 
    icon: '🎮', 
    files: [], 
    color: 'nes' 
  };

  useEffect(() => {
    // Add fade-in animation to main elements
    const animateElements = () => {
      const header = document.querySelector('.emulator-header');
      const container = document.querySelector('.emulator-container');
      const instructions = document.querySelector('.instructions');
      
      const elements = [header, container, instructions].filter(el => el);
      
      elements.forEach((element, index) => {
        if (element) {
          element.style.opacity = '0';
          element.style.transform = 'translateY(30px)';
          
          setTimeout(() => {
            element.style.transition = 'all 0.8s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
          }, index * 150);
        }
      });
    };

    // Start animations after a short delay
    setTimeout(animateElements, 100);

    // Cleanup function
    const cleanup = () => {
      
      // Reset states
      setIsGameStarted(false);
      setIsGameLoaded(false);
      setError(null);
      
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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const startGame = () => {
    if (!selectedFile) {
      setError('Vui lòng chọn ROM file trước khi bắt đầu chơi!');
      return;
    }

    setIsGameStarted(true);
    setError(null);
    
    // Add delay to ensure DOM is ready
    setTimeout(() => {
      try {        
        // Create object URL for the file
        const gameUrl = URL.createObjectURL(selectedFile);
        
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
        
        // Create URL with parameters
        const params = new URLSearchParams({
          gameUrl: gameUrl,
          core: getConsoleCore(consoleType),
          gameId: `${selectedFile.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
          gameName: selectedFile.name
        });
        
        iframe.src = `/emulator-iframe.html?${params.toString()}`;
        
        iframe.onload = function() {

        };
        
        gameContainer.appendChild(iframe);
        
        // Listen for messages from iframe
        const messageHandler = (event) => {
          if (event.data.type === 'gameStarted') {
            setIsGameLoaded(true);
            setError(null);
          } else if (event.data.type === 'gameError') {
            console.error('❌ Game error in iframe:', event.data.error);
            setIsGameStarted(false);
            setIsGameLoaded(false);
            setError(`Không thể tải game: ${event.data.error || 'Lỗi không xác định'}`);
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
        setError(`Lỗi khi khởi tạo game: ${error.message || 'Lỗi không xác định'}`);
      }
    }, 300);
  };

  const handleCloseError = () => {
    setError(null);
    setIsGameStarted(false);
    setIsGameLoaded(false);
  };

  const handleTestError = () => {
    const testErrors = [
      'File ROM không hợp lệ hoặc bị hỏng',
      'Không thể tải core emulator cho console này',
      'Lỗi kết nối mạng khi tải EmulatorJS',
      'File ROM quá lớn hoặc định dạng không được hỗ trợ',
      'Trình duyệt không hỗ trợ WebAssembly',
      'Lỗi bộ nhớ: Không đủ RAM để chạy game'
    ];
    
    const randomError = testErrors[Math.floor(Math.random() * testErrors.length)];
    setError(randomError);
  };

  const goHome = () => {
    navigate('/');
  };

  const renderGameContainer = () => {
    if (isGameStarted && selectedFile) {
      return (
        <div className="game-placeholder">
          <div className="game-placeholder-icon">🔄</div>
          <h3>Đang tải game: {selectedFile.name}</h3>
          <p>Vui lòng đợi trong giây lát...</p>
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
    <Layout>
      <FloatingElements elements={[currentConsole.icon, '🎮', '⚡', '🎯']} />

      <div className="emulator-header">
        <h1 className={`console-title ${currentConsole.color}`}>
          {currentConsole.icon} {currentConsole.name}
        </h1>
        <p className="console-subtitle">Chọn ROM file và nhấn "Chơi Game" để bắt đầu</p>
        <p className="supported-formats-text">Hỗ trợ: {currentConsole.files.join(', ')}</p>
      </div>

      <div className="main-content">
        <div className="emulator-container">
          <EmulatorControls
            selectedFile={selectedFile}
            isGameLoaded={isGameLoaded}
            isGameStarted={isGameStarted}
            currentConsole={currentConsole}
            onFileSelect={handleFileSelect}
            onStartGame={startGame}
            onGoHome={goHome}
            onTestError={handleTestError}
          />

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

      <ErrorMessage error={error} onClose={handleCloseError} />
    </Layout>
  );
};

export default EmulatorPage;