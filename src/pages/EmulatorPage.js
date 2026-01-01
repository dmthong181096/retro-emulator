import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const EmulatorPage = () => {
  const { console: consoleType } = useParams();

  useEffect(() => {
    // Redirect to standalone HTML page to avoid React conflicts
    const redirectUrl = `/emulator.html?console=${consoleType}`;
    console.log('🔄 Redirecting to standalone emulator page:', redirectUrl);
    window.location.href = redirectUrl;
  }, [consoleType]);

  return (
    <div className="emulator-container">
      <div className="emulator-header">
        <h2>🔄 Đang chuyển hướng...</h2>
        <p>Đang chuyển đến trang emulator...</p>
        
        <div style={{ 
          margin: '2rem 0',
          padding: '1rem',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '10px'
        }}>
          <p>Nếu không tự động chuyển hướng, hãy click:</p>
          <a 
            href={`/emulator.html?console=${consoleType}`}
            style={{
              display: 'inline-block',
              margin: '1rem 0',
              padding: '0.5rem 1rem',
              background: '#00ff88',
              color: '#000',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}
          >
            🎮 Mở Emulator
          </a>
        </div>
      </div>
    </div>
  );
};

export default EmulatorPage;