import { useState, useEffect } from 'react';

const EmulatorControls = ({
  selectedFile,
  isGameLoaded,
  isGameStarted,
  currentConsole,
  onFileSelect,
  onStartGame,
  onGoHome,
  onTestError,
  onCloudSave,
  onCloudLoad,
  onCloudDownload,
  onDebugFilesystem,
  onDebugLoadState,
  onInterceptLoadState,
  isLoggedIn,
  cloudSaveStatus,
  cloudLoadStatus
}) => {

  const [showTips, setShowTips] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto-hide success messages after 3 seconds
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showLoadSuccess, setShowLoadSuccess] = useState(false);

  // Update success states based on props
  useEffect(() => {
    if (cloudSaveStatus === 'success') {
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  }, [cloudSaveStatus]);

  useEffect(() => {
    if (cloudLoadStatus === 'success') {
      setShowLoadSuccess(true);
      setTimeout(() => setShowLoadSuccess(false), 3000);
    }
  }, [cloudLoadStatus]);

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
    } catch (error) {
      // Error will be handled by parent component
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const handleCloudLoad = async () => {
    if (!onCloudLoad) return;
    setIsLoading(true);
    try {
      await onCloudLoad();
    } catch (error) {
      // Error will be handled by parent component
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handleCloudDownload = async () => {
    if (!onCloudDownload) return;
    setIsDownloading(true);
    try {
      await onCloudDownload();
    } catch (error) {
      // Error will be handled by parent component
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
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
              onClick={handleCloudDownload}
              disabled={isDownloading || !isLoggedIn}
              title={!isLoggedIn ? "Vui lòng đăng nhập để tải file" : "Tải file save state về máy"}
            >
              {isDownloading ? '⏳ Đang tải...' : '📥 Tải File'}
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

            {/* Success Messages */}
            {showSaveSuccess && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                <span>Đã lưu lên cloud thành công!</span>
              </div>
            )}

            {showLoadSuccess && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                <span>Đã tải từ cloud thành công!</span>
              </div>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {(isSaving || isLoading || isDownloading) && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <div className="loading-text">
                {isSaving && "Đang lưu lên cloud..."}
                {isLoading && "Đang tải từ cloud..."}
                {isDownloading && "Đang tải file..."}
              </div>
              <div className="loading-progress">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              </div>
            </div>
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