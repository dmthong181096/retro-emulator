import React from 'react';

const EmulatorControls = ({ 
  selectedFile, 
  isGameLoaded, 
  isGameStarted, 
  currentConsole, 
  onFileSelect, 
  onStartGame, 
  onGoHome 
}) => {
  return (
    <div className="controls-section">
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
        onClick={onStartGame} 
        disabled={!selectedFile || isGameStarted}
      >
        {isGameStarted ? (isGameLoaded ? '🎮 Đang chơi' : '🔄 Đang tải...') : '🎮 Chơi Game'}
      </button>
      
      <button className="control-button home" onClick={onGoHome}>
        🏠 Trang chủ
      </button>
    </div>
  );
};

export default EmulatorControls;