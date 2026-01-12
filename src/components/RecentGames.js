import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { recentGamesManager } from '../services/RecentGames';
import { getConsoleById } from '../config/Config';

const RecentGames = () => {
  const [recentGames, setRecentGames] = useState([]);
  const [showFileDialog, setShowFileDialog] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const games = recentGamesManager.getRecentGames();
    setRecentGames(games);

    // Add stagger animation to recent games
    if (games.length > 0) {
      // Animate the section first
      setTimeout(() => {
        const section = document.querySelector('.recent-games-section');
        if (section) {
          section.classList.add('animate');
        }
      }, 200);

      // Animate title
      setTimeout(() => {
        const title = document.querySelector('.recent-games-title');
        if (title) {
          title.classList.add('animate');
        }
      }, 400);

      // Then animate individual cards with stagger
      setTimeout(() => {
        const cards = document.querySelectorAll('.recent-game-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('animate');
          }, index * 150); // Stagger delay
        });
      }, 600); // Start after title animation
    }
  }, []);

  const handleResumeGame = async (game) => {
    console.log('🎮 Resume game clicked:', game.gameName);
    
    // Try to auto-load ROM from IndexedDB first
    if (game.hasStoredROM && game.romId) {
      console.log('🚀 Attempting auto-load from IndexedDB...');
      
      try {
        const result = await recentGamesManager.tryAutoLoadROM(game);
        
        if (result.success) {
          console.log('✅ Auto-load successful! Navigating to game...');
          
          // Show success toast
          if (window.showToast) {
            window.showToast(`🚀 Tự động tải: ${game.gameName}`, 'success');
          }
          
          // Navigate with the auto-loaded file
          navigate(`/emulator/${game.consoleId}`, {
            state: { 
              resumeGame: true,
              gameName: game.gameName,
              consoleType: game.consoleType,
              autoLoadFile: result.file,
              fileMatched: true,
              autoLoaded: true,
              method: 'indexeddb'
            }
          });
          return;
        } else {
          console.log('❌ Auto-load failed:', result.reason);
          
          // Show error toast
          if (window.showToast) {
            window.showToast('ROM không tìm thấy. Vui lòng chọn lại file.', 'warning');
          }
          
          // Fallback to file dialog
          setShowFileDialog(game);
          return;
        }
      } catch (error) {
        console.error('Auto-load error:', error);
        if (window.showToast) {
          window.showToast('Lỗi khi tự động tải ROM', 'error');
        }
        setShowFileDialog(game);
        return;
      }
    } 
    
    // If game has file info but no stored ROM, show file dialog
    else if (game.fileInfo) {
      console.log('📁 No stored ROM, showing file dialog...');
      setShowFileDialog(game);
    } 
    
    // No file info at all, navigate normally (old behavior)
    else {
      console.log('ℹ️ No file info, navigating normally...');
      navigate(`/emulator/${game.consoleId}`, {
        state: { 
          resumeGame: true,
          gameName: game.gameName,
          consoleType: game.consoleType
        }
      });
    }
  };

  const handleFileSelection = async (event) => {
    const file = event.target.files[0];
    const game = showFileDialog;
    
    console.log('🔍 File selected:', file ? file.name : 'No file');
    console.log('🔍 Game info:', game ? game.gameName : 'No game');
    
    if (!file || !game) return;

    // Validate if selected file matches the expected file
    const validation = await recentGamesManager.validateRecentGame(game, file);
    
    console.log('🔍 Validation result:', validation);
    
    if (validation.valid) {
      // File matches! Navigate with the file
      console.log('✅ File matches! Auto-loading...');
      navigate(`/emulator/${game.consoleId}`, {
        state: { 
          resumeGame: true,
          gameName: game.gameName,
          consoleType: game.consoleType,
          autoLoadFile: file,
          fileMatched: true
        }
      });
    } else {
      // File doesn't match, but user can still play it
      const confirmed = window.confirm(
        `File được chọn không khớp với file gốc.\n\n` +
        `Mong đợi: ${game.fileInfo.name} (${recentGamesManager.formatFileSize(game.fileInfo.size)})\n` +
        `Được chọn: ${file.name} (${recentGamesManager.formatFileSize(file.size)})\n\n` +
        `Bạn có muốn chơi file này không?`
      );
      
      if (confirmed) {
        console.log('⚠️ File mismatch but user confirmed. Loading...');
        navigate(`/emulator/${game.consoleId}`, {
          state: { 
            resumeGame: true,
            gameName: game.gameName,
            consoleType: game.consoleType,
            autoLoadFile: file,
            fileMatched: false
          }
        });
      }
    }
    
    setShowFileDialog(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveGame = (gameId, event) => {
    event.stopPropagation();
    recentGamesManager.removeRecentGame(gameId);
    setRecentGames(recentGamesManager.getRecentGames());
  };

  const handleCancelFileDialog = () => {
    setShowFileDialog(null);
  };

  if (recentGames.length === 0) {
    return null;
  }

  return (
    <div className="recent-games-section">
      <h2 className="recent-games-title">
        🕹️ Tiếp tục chơi
      </h2>
      <div className="recent-games-grid">
        {recentGames.map((game) => {
          const console = getConsoleById(game.consoleId);
          const hasStoredROM = game.hasStoredROM && game.romId;
          const hasFileInfo = !!game.fileInfo;
          
          return (
            <div 
              key={game.id}
              className={`recent-game-card ${hasStoredROM ? 'has-stored-rom' : hasFileInfo ? 'has-file-info' : ''}`}
              onClick={() => handleResumeGame(game)}
            >
              <div className="recent-game-header">
                <span className="console-icon">{console?.icon || '🎮'}</span>
                <div className="game-status">
                  {hasStoredROM && (
                    <span className="rom-status stored" title="ROM đã lưu - tự động tải ngay lập tức">
                      🚀
                    </span>
                  )}
                  {!hasStoredROM && hasFileInfo && (
                    <span className="rom-status file-info" title="Có thông tin file - cần chọn lại">
                      📁
                    </span>
                  )}
                  <button 
                    className="remove-game-btn"
                    onClick={(e) => handleRemoveGame(game.id, e)}
                    title="Xóa khỏi danh sách"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="recent-game-info">
                <h3 className="game-name">{game.gameName}</h3>
                <p className="console-name">{console?.name || game.consoleType}</p>
                {hasFileInfo && (
                  <p className="file-info">
                    📄 {game.fileInfo.name} ({recentGamesManager.formatFileSize(game.fileInfo.size)})
                  </p>
                )}
                <div className="game-meta">
                  <span className="last-played">
                    {recentGamesManager.formatLastPlayed(game.lastPlayed)}
                  </span>
                  <span className="play-count">
                    {game.playCount} lần chơi
                  </span>
                </div>
              </div>
              
              <div className="resume-overlay">
                <div className="resume-icon">
                  {hasFileInfo ? '🚀' : '▶️'}
                </div>
                <span>{hasFileInfo ? 'Tự động tải' : 'Tiếp tục'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* File Selection Dialog */}
      {showFileDialog && (
        <>
          <div className="file-dialog-overlay" onClick={handleCancelFileDialog} />
          <div className="file-dialog">
            <div className="file-dialog-header">
              <h3>🎮 Chọn ROM file</h3>
              <button 
                className="close-dialog-btn"
                onClick={handleCancelFileDialog}
              >
                ✕
              </button>
            </div>
            
            <div className="file-dialog-content">
              <div className="expected-file-info">
                <h4>📁 File mong đợi:</h4>
                <div className="file-details">
                  <p><strong>Tên:</strong> {showFileDialog.fileInfo.name}</p>
                  <p><strong>Kích thước:</strong> {recentGamesManager.formatFileSize(showFileDialog.fileInfo.size)}</p>
                  <p><strong>Loại:</strong> {showFileDialog.fileInfo.type}</p>
                </div>
              </div>
              
              <div className="file-selection">
                <p>Vui lòng chọn ROM file để tiếp tục chơi:</p>
                <div className="file-input-wrapper">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={getConsoleById(showFileDialog.consoleId)?.files.join(',') || '*'}
                    onChange={handleFileSelection}
                    className="file-input"
                    id="resume-file-input"
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="file-input-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📁 Chọn file ROM
                  </button>
                </div>
                <div className="file-hint">
                  <small>Chọn file ROM từ vị trí bạn đã lưu trước đó</small>
                </div>
              </div>
              
              <div className="dialog-actions">
                <button 
                  className="cancel-btn"
                  onClick={handleCancelFileDialog}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecentGames;