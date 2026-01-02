import React, { useState, useRef, useEffect } from 'react';

const FloatingFullscreenButton = ({ onToggleFullscreen }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 65, y: window.innerHeight / 2 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const buttonRef = useRef(null);

  // Mobile detection
  const checkMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768) ||
           ('ontouchstart' in window);
  };

  useEffect(() => {
    setIsMobile(checkMobileDevice());
  }, []);

  const handleStart = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    });
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;
    
    // Keep button within screen bounds
    const maxX = window.innerWidth - 45;
    const maxY = window.innerHeight - 45;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleClick = (e) => {
    // Only trigger click if not dragging
    if (!isDragging) {
      onToggleFullscreen();
    }
  };

  useEffect(() => {
    const handleGlobalMove = (e) => handleMove(e);
    const handleGlobalEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMove);
      document.addEventListener('mouseup', handleGlobalEnd);
      document.addEventListener('touchmove', handleGlobalMove, { passive: false });
      document.addEventListener('touchend', handleGlobalEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging, dragStart, position]);

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <div
      ref={buttonRef}
      className={`floating-fullscreen-btn ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onClick={handleClick}
    >
      🖥️
    </div>
  );
};

export default FloatingFullscreenButton;