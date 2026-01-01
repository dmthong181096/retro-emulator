import React from 'react';

const ErrorMessage = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="error-overlay">
      <div className="error-card">
        <div className="error-icon">😔</div>
        <h3 className="error-title">Oops! Có lỗi xảy ra</h3>
        <p className="error-description">{error}</p>
        <button className="error-retry-btn" onClick={onClose}>
          Thử lại
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;