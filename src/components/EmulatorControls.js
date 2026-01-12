import { useState } from 'react';

const EmulatorControls = ({
  selectedFile,
  isGameLoaded,
  isGameStarted,
  currentConsole,
  onFileSelect,
  onStartGame,
  onGoHome,
  onCloudSave,
  onCloudLoad,
  onCloudDownload,
  onDebugFilesystem,
  onDebugLoadState,
  onInterceptLoadState,
  isLoggedIn
}) => {

  const [showTips, setShowTips] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCloseTips = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowTips(false);
      setIsClosing(false);
    }, 300);
  };

  const handleCloudSave = async () => {
    if (!onCloudSave) return;
    setIsSaving(true);
    try {
      await onCloudSave();
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const handleCloudLoad = async () => {
    if (!onCloudLoad) return;
    setIsLoading(true);
    try {
      await onCloudLoad();
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const tips = [
    { icon: '📁', title: 'Chọn ROM', desc: 'Click "Chọn ROM File" để tải game' },
    { icon: '🎮', title: 'Khởi động', desc: 'Nhấn "Chơi Game" để bắt đầu' },
    { icon: '⌨️', title: 'Điều khiển', desc: 'Arrow keys, Z (A), X (B), Enter (Start)' },
    { icon: '🖥️', title: 'Toàn màn hình', desc: 'Double-click (PC) hoặc double-tap (Mobile)' },
    { icon: '☁️', title: 'Cloud Save', desc: 'Đăng nhập để lưu/tải game từ cloud' },
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

        {/* Cloud Save/Load buttons - show when game is loaded */}
        {isGameLoaded && (
          <div className="control-row cloud-row">
            <button
              className="control-btn cloud-save-btn"
              onClick={handleCloudSave}
              disabled={isSaving || !isLoggedIn}
              title={!isLoggedIn ? "Vui lòng đăng nhập để sử dụng Cloud Save" : "Lưu game lên cloud"}
            >
              {isSaving ? '⏳ Đang lưu...' : '☁️ Lưu Cloud'}
            </button>

            <button
              className="control-btn cloud-load-btn"
              onClick={handleCloudLoad}
              disabled={isLoading || !isLoggedIn}
              title={!isLoggedIn ? "Vui lòng đăng nhập để sử dụng Cloud Load" : "Tải game từ cloud"}
            >
              {isLoading ? '⏳ Đang tải...' : '📥 Tải Cloud'}
            </button>

            <button
              className="control-btn cloud-download-btn"
              onClick={onCloudDownload}
              disabled={!isLoggedIn}
              title={!isLoggedIn ? "Vui lòng đăng nhập để tải file" : "Tải file save state về máy"}
            >
              📥 Tải File
            </button>

            {/* Debug buttons - only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <button
                  className="control-btn debug-btn"
                  onClick={onDebugFilesystem}
                  disabled={!isGameLoaded}
                  title="Debug: Xem files trong EmulatorJS filesystem"
                >
                  🔍 Debug FS
                </button>

                <button
                  className="control-btn debug-load-btn"
                  onClick={onDebugLoadState}
                  disabled={!isGameLoaded}
                  title="Debug: Test các function load state của EmulatorJS"
                >
                  🧪 Test Load
                </button>

                <button
                  className="control-btn intercept-btn"
                  onClick={onInterceptLoadState}
                  disabled={!isGameLoaded}
                  title="Debug: Intercept EmulatorJS load state button"
                >
                  🕵️ Intercept
                </button>
              </>
            )}

            {!isLoggedIn && (
              <div className="cloud-login-hint">
                <small>💡 Đăng nhập để sử dụng Cloud Save/Load</small>
              </div>
            )}
          </div>
        )}
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