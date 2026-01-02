import React, { useState } from 'react';

const Instructions = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="instructions">
      <div 
        className="instructions-header" 
        onClick={() => setShowInstructions(!showInstructions)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <h3>🎮 Hướng dẫn sử dụng {showInstructions ? '▼' : '▶'}</h3>
      </div>
      
      {showInstructions && (
        <div className="instructions-content">
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
                <strong>Toàn màn hình:</strong> Double-click (PC) hoặc double-tap (Mobile) vào màn hình game
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
      )}
    </div>
  );
};

export default Instructions;