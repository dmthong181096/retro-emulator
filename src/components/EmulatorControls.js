import React, { useState } from 'react';

const EmulatorControls = ({ 
  selectedFile, 
  isGameLoaded, 
  isGameStarted, 
  currentConsole, 
  onFileSelect, 
  onStartGame, 
  onGoHome,
  onTestError 
}) => {
  const [showTips, setShowTips] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseTips = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowTips(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const tips = [
    { icon: '📁', title: 'Chọn ROM', desc: 'Click "Chọn ROM File" để tải game' },
    { icon: '🎮', title: 'Khởi động', desc: 'Nhấn "Chơi Game" để bắt đầu' },
    { icon: '⌨️', title: 'Điều khiển', desc: 'Arrow keys, Z (A), X (B), Enter (Start)' },
    { icon: '🖥️', title: 'Toàn màn hình', desc: 'Double-click (PC) hoặc double-tap (Mobile)' },
    { icon: '⚖️', title: 'Lưu ý bản quyền', desc: 'Chỉ sử dụng ROM từ game bạn sở hữu hợp pháp' }
  ];

  return (
    <>
      <div className="control-panel">
        <div className="control-row">
          <div className="file-input-wrapper">
            <input 
              type="file" 
              id="romFile" 
              className="file-input" 
              accept={currentConsole.files.join(',')} 
              onChange={onFileSelect}
              disabled={isGameLoaded}
            />
            <label 
              htmlFor="romFile" 
              className={`control-btn file-btn ${isGameLoaded ? 'disabled' : ''}`}
            >
              {selectedFile ? (
                <>✅ {selectedFile.name.length > 12 ? selectedFile.name.substring(0, 12) + '...' : selectedFile.name}</>
              ) : (
                <>📁 {isGameLoaded ? 'Game đã tải' : 'Chọn ROM'}</>
              )}
            </label>
          </div>
          
          <button 
            className="control-btn play-btn" 
            onClick={onStartGame} 
            disabled={!selectedFile || isGameStarted}
          >
            {isGameStarted ? (isGameLoaded ? '🎮 Đang chơi' : '🔄 Đang tải...') : '🎮 Chơi Game'}
          </button>
          
          <button className="control-btn home-btn" onClick={onGoHome}>
            🏠 Trang chủ
          </button>

          <button 
            className="control-btn info-btn" 
            onClick={() => setShowTips(true)}
            title="Hướng dẫn sử dụng"
          >
            💡 Tips
          </button>
        </div>
      </div>

      {/* Tips Modal */}
      {showTips && (
        <>
          <div 
            className={`tips-overlay ${isClosing ? 'closing' : ''}`}
            onClick={handleCloseTips}
          />
          <div className={`tips-modal ${isClosing ? 'closing' : ''}`}>
            <div className="tips-header">
              <h3>💡 Hướng dẫn sử dụng</h3>
              <button 
                className="close-btn"
                onClick={handleCloseTips}
              >
                ×
              </button>
            </div>
            
            <div className="tips-content">
              {tips.map((tip, index) => (
                <div key={index} className="tip-item">
                  <span className="tip-icon">{tip.icon}</span>
                  <div className="tip-text">
                    <strong>{tip.title}:</strong> {tip.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default EmulatorControls;