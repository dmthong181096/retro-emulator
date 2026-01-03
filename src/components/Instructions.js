import React, { useState } from 'react';

const Instructions = () => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const instructions = [
    { id: 'rom', icon: '📁', title: 'Chọn ROM', desc: 'Click "Chọn ROM File"' },
    { id: 'play', icon: '🎮', title: 'Khởi động', desc: 'Nhấn "Chơi Game"' },
    { id: 'controls', icon: '⌨️', title: 'Điều khiển', desc: 'Arrow keys, Z (A), X (B), Enter (Start)' },
    { id: 'fullscreen', icon: '🖥️', title: 'Toàn màn hình', desc: 'Double-click (PC) hoặc double-tap (Mobile)' }
  ];

  return (
    <div className="instructions-compact">
      <div className="instructions-title">
        <span>💡 Quick Tips:</span>
      </div>
      
      <div className="instructions-hints">
        {instructions.map((item) => (
          <div 
            key={item.id}
            className="hint-item"
            onMouseEnter={() => setActiveTooltip(item.id)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <span className="hint-icon">{item.icon}</span>
            <span className="hint-title">{item.title}</span>
            
            {activeTooltip === item.id && (
              <div className="tooltip">
                {item.desc}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="legal-compact">
        <span>⚖️ Chỉ sử dụng ROM bạn sở hữu hợp pháp</span>
      </div>
    </div>
  );
};

export default Instructions;