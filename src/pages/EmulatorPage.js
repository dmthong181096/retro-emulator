import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getConsoleById, getConsoleCore } from '../config/Config';
import { useAuth } from '../contexts/AuthContext';
import { saveManager } from '../services/SaveManager';
import { recentGamesManager } from '../services/RecentGames';
import Layout from '../components/Layout';
import FloatingElements from '../components/FloatingElements';
import EmulatorControls from '../components/EmulatorControls';
import ErrorMessage from '../components/ErrorMessage';
import FloatingFullscreenButton from '../components/FloatingFullscreenButton';

const EmulatorPage = () => {
  const { console: consoleType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameLoaded, setIsGameLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [showFloatingElements, setShowFloatingElements] = useState(true);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  const currentConsole = getConsoleById(consoleType) || { 
    name: 'Unknown Console', 
    icon: '🎮', 
    files: [], 
    color: 'nes' 
  };

  // Check if this is a resume request
  const resumeData = location.state?.resumeGame ? {
    gameName: location.state.gameName,
    consoleType: location.state.consoleType
  } : null;

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

  // Handle resume functionality
  useEffect(() => {
    if (resumeData) {
      console.log('🎮 Resume request detected:', resumeData);
      // Show a message that this is a resume request
      // In a real implementation, you might want to:
      // 1. Show the last played ROM file name
      // 2. Auto-load the save state
      // 3. Pre-select the file if it's still available
      
      // For now, just show a message
      setError(`Tiếp tục chơi: ${resumeData.gameName}\nVui lòng chọn lại ROM file để tiếp tục.`);
    }
  }, [resumeData]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Clear resume message when file is selected
      if (resumeData && error?.includes('Tiếp tục chơi')) {
        setError(null);
      }
    }
  };

  const startGame = () => {
    if (!selectedFile) {
      setError('Vui lòng chọn ROM file trước khi bắt đầu chơi!');
      return;
    }

    setIsGameStarted(true);
    setError(null);
    
    // Track recent game
    const gameName = selectedFile.name.replace(/\.[^/.]+$/, ""); // Remove file extension
    recentGamesManager.addRecentGame(gameName, consoleType, consoleType);
    console.log('🎮 Added to recent games:', gameName);
    
    // Scroll to emulator immediately for both desktop and mobile
    setTimeout(() => {
      scrollToEmulator();
    }, 500); // Small delay to let the loading state render first
    
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
          console.log('🔄 Message received from iframe:', event.data);
          
          if (event.data.type === 'gameStarted') {
            console.log('🎮 Game started successfully');
            setIsGameLoaded(true);
            setError(null);
            
            // Hide floating elements when game starts
            setShowFloatingElements(false);
            
            // Initialize save manager with user and game info
            if (user && selectedFile) {
              console.log('💾 Initializing SaveManager:', {
                user: user.email,
                game: selectedFile.name,
                console: consoleType
              });
              saveManager.initialize(user, selectedFile.name, consoleType);
              
              // List existing saves
              setTimeout(async () => {
                const result = await saveManager.listSaves();
                if (result.success && result.saves.length > 0) {
                  console.log('💾 Available cloud saves:', result.saves);
                } else {
                  console.log('💾 No cloud saves found for this game');
                }
              }, 1000);
            } else {
              console.log('💾 SaveManager not initialized - no user or file');
            }
            
            // Add double-click fullscreen to iframe
            iframe.addEventListener('dblclick', () => {
              iframe.contentWindow.postMessage({type: 'requestFullscreen'}, '*');
            });
            
            // Show floating fullscreen button for mobile when game loads
            if (isMobileDevice()) {
              setShowFloatingButton(true);
            }
            
          } else if (event.data.type === 'gameError') {
            console.log('❌ Game error:', event.data.error);
            setIsGameStarted(false);
            setIsGameLoaded(false);
            setShowFloatingElements(true); // Show particles again when error
            setError(`Không thể tải game: ${event.data.error || 'Lỗi không xác định'}`);
            
          } else if (event.data.type === 'saveState') {
            // Cloud save from our button
            console.log('☁️ Cloud save data received:', event.data.data?.length || 0, 'bytes');
            handleSaveState(event.data.slot, event.data.data);
            
          } else if (event.data.type === 'cloudSaveError') {
            // Cloud save error
            console.log('☁️ Cloud save error:', event.data.error);
            setError(`Lỗi Cloud Save: ${event.data.error}`);
            
          } else if (event.data.type === 'cloudLoadSuccess') {
            // Cloud load success
            console.log('☁️ Cloud load success:', event.data.message);
            // Could show a success message or notification here
            
          } else if (event.data.type === 'cloudLoadError') {
            // Cloud load error
            console.log('☁️ Cloud load error:', event.data.error);
            setError(`Lỗi Cloud Load: ${event.data.error}`);
          }
        };
        
        window.addEventListener('message', messageHandler);
        
        // Cleanup message listener when component unmounts
        return () => {
          window.removeEventListener('message', messageHandler);
        };
        
      } catch (error) {
        setIsGameStarted(false);
        setError(`Lỗi khi khởi tạo game: ${error.message || 'Lỗi không xác định'}`);
      }
    }, 300);
  };

  const handleCloseError = () => {
    setError(null);
    setIsGameStarted(false);
    setIsGameLoaded(false);
    setShowFloatingElements(true); // Show particles again when error
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

  // Test function for recent games (development only)
  const handleTestRecentGames = () => {
    const testGames = [
      { name: 'Pokemon FireRed', console: 'gba' },
      { name: 'Super Mario Bros', console: 'nes' },
      { name: 'Sonic the Hedgehog', console: 'genesis' }
    ];
    
    testGames.forEach((game, index) => {
      setTimeout(() => {
        recentGamesManager.addRecentGame(game.name, game.console, game.console);
        console.log('🎮 Added test game:', game.name);
      }, index * 100);
    });
    
    alert('Added test games to recent games list! Go to home page to see them.');
  };

  const goHome = () => {
    navigate('/');
  };

  // Mobile detection function
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window);
  };

  // Scroll to center emulator on desktop
  const scrollToEmulator = () => {
    const emulatorContainer = document.querySelector('.emulator-container');
    if (emulatorContainer) {
      emulatorContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Handle save state to cloud
  const handleSaveState = async (slot, saveData) => {
    // Parse slot number if it's an object
    const actualSlot = typeof slot === 'object' ? 
      (slot.slot || slot.id || slot.number || 0) : 
      slot;

    // Ensure SaveManager is initialized with latest user state
    if (user && selectedFile) {
        // Always refresh the save manager context to be safe
        saveManager.initialize(user, selectedFile.name, consoleType);
    }

    console.log('💾 handleSaveState called:', {
      originalSlot: slot,
      actualSlot: actualSlot,
      dataType: typeof saveData,
      dataSize: saveData ? saveData.length : 0,
      userLoggedIn: !!user,
      saveManagerEnabled: saveManager.isEnabled
    });

    if (!user) {
      console.log('💾 Local save only - user not logged in');
      return;
    }

    try {
      console.log('💾 Attempting cloud save...');
      const result = await saveManager.saveToCloud(slot, saveData);
      console.log('💾 Cloud save result:', result);
      
      if (result.success) {
        if (result.fallback) {
          console.log(`⚠️ Save slot ${actualSlot} saved with fallback: ${result.message}`);
        } else {
          console.log(`✅ Save slot ${actualSlot} uploaded to cloud successfully`);
        }
      } else {
        console.warn(`❌ Save failed: ${result.error}`);
        // If it failed due to user not logged in (race condition?), try one more time
        if (result.error === 'User not logged in' && user) {
             console.log('🔄 Retrying save with immediate re-init...');
             saveManager.initialize(user, selectedFile.name, consoleType);
             await saveManager.saveToCloud(slot, saveData);
        }
      }
    } catch (error) {
      console.error('💾 Save error:', error);
    }
  };

  // Toggle fullscreen for floating button
  const handleToggleFullscreen = () => {
    const iframe = document.querySelector('#gameContainer iframe');
    if (iframe) {
      iframe.contentWindow.postMessage({type: 'requestFullscreen'}, '*');
    }
  };

  // Cloud Save - force save current state and upload to cloud
  const handleCloudSave = async () => {
    console.log('☁️ Cloud Save button clicked');
    
    const iframe = document.querySelector('#gameContainer iframe');
    if (!iframe) {
      console.error('☁️ Iframe not found');
      return;
    }

    // Tell iframe to save state and send data back
    iframe.contentWindow.postMessage({type: 'cloudSave'}, '*');
  };

  // Intercept Load State - hook into EmulatorJS load state button to see what it does
  const handleInterceptLoadState = () => {
    console.log('🕵️ Intercept Load State button clicked');
    
    const iframe = document.querySelector('#gameContainer iframe');
    if (!iframe) {
      console.error('🕵️ Iframe not found');
      return;
    }

    // Tell iframe to intercept EmulatorJS load state
    iframe.contentWindow.postMessage({type: 'interceptLoadState'}, '*');
  };

  // Debug Load State - test all load state functions manually
  const handleDebugLoadState = () => {
    console.log('🧪 Debug Load State button clicked');
    
    const iframe = document.querySelector('#gameContainer iframe');
    if (!iframe) {
      console.error('🧪 Iframe not found');
      return;
    }

    // Tell iframe to debug load state functions
    iframe.contentWindow.postMessage({type: 'debugLoadState'}, '*');
  };

  // Debug Filesystem - show files in EmulatorJS filesystem
  const handleDebugFilesystem = () => {
    console.log('🔍 Debug Filesystem button clicked');
    
    const iframe = document.querySelector('#gameContainer iframe');
    if (!iframe) {
      console.error('🔍 Iframe not found');
      return;
    }

    // Tell iframe to debug filesystem
    iframe.contentWindow.postMessage({type: 'debugFilesystem'}, '*');
  };

  // Cloud Download - download save file from cloud to local machine
  const handleCloudDownload = async () => {
    console.log('📥 Cloud Download button clicked');
    
    if (!user) {
      console.error('📥 User not logged in');
      setError('Vui lòng đăng nhập để tải file');
      return;
    }

    if (selectedFile) {
        saveManager.initialize(user, selectedFile.name, consoleType);
    }

    try {
      // Download save data from cloud
      console.log('📥 Downloading file from cloud...');
      const result = await saveManager.loadFromCloud(0);
      
      if (!result.success) {
        console.error('📥 Cloud download failed:', result.error);
        setError('Không tìm thấy save file trên cloud');
        return;
      }

      console.log('📥 File downloaded, size:', result.saveData?.length);

      // Create blob and download link
      const blob = new Blob([result.saveData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName || `${selectedFile.name}.state`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log('✅ File downloaded successfully:', link.download);
      
    } catch (error) {
      console.error('📥 Cloud download error:', error);
      setError('Lỗi khi tải file từ cloud');
    }
  };

  // Cloud Load - download from cloud and load into emulator
  const handleCloudLoad = async () => {
    console.log('☁️ Cloud Load button clicked');
    
    if (!user) {
      console.error('☁️ User not logged in');
      return;
    }

    if (selectedFile) {
        saveManager.initialize(user, selectedFile.name, consoleType);
    }

    try {
      // Step 1: Download save data from cloud
      console.log('☁️ Step 1: Downloading from cloud...');
      const result = await saveManager.loadFromCloud(0);
      
      if (!result.success) {
        console.error('☁️ Cloud load failed:', result.error);
        setError('Không tìm thấy save data trên cloud');
        return;
      }

      console.log('☁️ Step 2: Got save data, size:', result.saveData?.length);

      // Step 2: Send to iframe to write file
      const iframe = document.querySelector('#gameContainer iframe');
      if (!iframe) {
        console.error('☁️ Iframe not found');
        return;
      }

      // Send data to iframe - it will write to file and trigger load
      iframe.contentWindow.postMessage({
        type: 'cloudLoadAndApply',
        saveData: result.saveData,
        originalFileName: result.fileName // Pass original filename
      }, '*');

      console.log('☁️ Save data sent to iframe for loading');
    } catch (error) {
      console.error('☁️ Cloud load error:', error);
      setError('Lỗi khi tải save từ cloud');
    }
  };

  // Render game container content
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
      {/* Only show floating elements when game is not loaded */}
      {showFloatingElements && (
        <FloatingElements elements={[currentConsole.icon, '🎮', '⚡', '🎯']} />
      )}

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
            onCloudSave={handleCloudSave}
            onCloudLoad={handleCloudLoad}
            onCloudDownload={handleCloudDownload}
            onDebugFilesystem={handleDebugFilesystem}
            onDebugLoadState={handleDebugLoadState}
            onInterceptLoadState={handleInterceptLoadState}
            isLoggedIn={!!user}
          />

          {/* Temporary test button for development */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              <button 
                onClick={handleTestRecentGames}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🧪 Test Recent Games
              </button>
            </div>
          )}

          <div className="game-container" id="gameContainer">
            {renderGameContainer()}
          </div>
        </div>
      </div>

      <ErrorMessage error={error} onClose={handleCloseError} />
      
      {/* Floating Fullscreen Button for Mobile */}
      {showFloatingButton && (
        <FloatingFullscreenButton onToggleFullscreen={handleToggleFullscreen} />
      )}
      
      {/* Performance Monitor */}
      {/* <PerformanceMonitor isGameRunning={isGameLoaded} /> */}
    </Layout>
  );

};

export default EmulatorPage;