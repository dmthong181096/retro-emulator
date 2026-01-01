import React from 'react';

const ConsoleCard = ({ console, onClick }) => {
  return (
    <div
      className="console-card"
      data-console={console.id}
      onClick={() => onClick(console.id)}
    >
      <div className="console-content">
        <div className="console-info">
          <div className="console-icon">{console.icon}</div>
          <h3 className="console-name">{console.name}</h3>
          <p className="console-description">{console.description}</p>
        </div>
        <div className="supported-files">
          <div className="files-label">📁 Định dạng hỗ trợ</div>
          <div className="files-list">{console.files.join(', ')}</div>
        </div>
      </div>
    </div>
  );
};

export default ConsoleCard;