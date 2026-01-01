import React from 'react';

const ErrorMessage = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="error-overlay">
      <div className="error-message">
        <div className="error-header">
          <span className="error-icon">❌</span>
          <h3>Lỗi khi tải game</h3>
          <button className="error-close" onClick={onClose}>×</button>
        </div>
        <div className="error-content">
          <p className="error-text">{error}</p>
          <div className="error-suggestions">
            <h4>💡 Gợi ý khắc phục:</h4>
            <ul>
              <li>Kiểm tra file ROM có đúng định dạng không</li>
              <li>Thử chọn file ROM khác</li>
              <li>Đảm bảo file không bị hỏng</li>
              <li>Refresh trang và thử lại</li>
            </ul>
          </div>
        </div>
        <div className="error-actions">
          <button className="error-button" onClick={onClose}>
            🔄 Thử lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;