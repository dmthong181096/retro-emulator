import React, { useState, useEffect, useRef } from 'react';

const PerformanceMonitor = ({ isGameRunning }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsed: 0,
    memoryTotal: 0,
    cpuUsage: 0,
    gameTime: 0
  });
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const animationFrameRef = useRef(null);

  // Start monitoring when game starts
  useEffect(() => {
    if (isGameRunning && !startTimeRef.current) {
      startTimeRef.current = Date.now();
      startMonitoring();
      startFpsCounter();
    } else if (!isGameRunning) {
      stopMonitoring();
      stopFpsCounter();
      startTimeRef.current = null;
    }

    return () => {
      stopMonitoring();
      stopFpsCounter();
    };
  }, [isGameRunning]);

  const startMonitoring = () => {
    intervalRef.current = setInterval(() => {
      updateMetrics();
    }, 1000); // Update every second
  };

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startFpsCounter = () => {
    frameCountRef.current = 0;
    lastFpsUpdateRef.current = performance.now();
    countFrames();
  };

  const stopFpsCounter = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const countFrames = () => {
    frameCountRef.current++;
    animationFrameRef.current = requestAnimationFrame(countFrames);
  };

  const updateMetrics = () => {
    // Calculate FPS using requestAnimationFrame
    const now = performance.now();
    const deltaTime = now - lastFpsUpdateRef.current;
    const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
    
    // Reset frame counter
    frameCountRef.current = 0;
    lastFpsUpdateRef.current = now;

    // Get memory usage (if available)
    let memoryUsed = 0;
    let memoryTotal = 0;
    if (performance.memory) {
      memoryUsed = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      memoryTotal = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
    }

    // Calculate game time
    const gameTime = startTimeRef.current 
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;

    setMetrics({
      fps: fps > 0 && fps < 200 ? fps : 60, // Cap at reasonable range
      memoryUsed,
      memoryTotal,
      gameTime
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceStatus = () => {
    if (metrics.memoryUsed > 500) return 'warning';
    if (metrics.fps < 30) return 'warning';
    return 'good';
  };

  // Don't show if game is not running
  if (!isGameRunning) return null;

  return (
    <div className={`performance-monitor ${isVisible ? 'visible' : 'hidden'}`}>
      <div 
        className="performance-toggle"
        onClick={() => setIsVisible(!isVisible)}
      >
        📊
      </div>
      
      {isVisible && (
        <div className={`performance-panel ${getPerformanceStatus()}`}>
          <div className="performance-header">
            <span>Performance Monitor</span>
            <button onClick={() => setIsVisible(false)}>×</button>
          </div>
          
          <div className="performance-metrics">
            <div className="metric">
              <span className="metric-label">Game Time:</span>
              <span className="metric-value">{formatTime(metrics.gameTime)}</span>
            </div>
            
            <div className="metric">
              <span className="metric-label">Browser FPS:</span>
              <span className="metric-value">{metrics.fps}</span>
            </div>
            
            {performance.memory && (
              <div className="metric">
                <span className="metric-label">Memory:</span>
                <span className="metric-value">
                  {metrics.memoryUsed}MB / {metrics.memoryTotal}MB
                </span>
              </div>
            )}
            
            <div className="metric">
              <span className="metric-label">Status:</span>
              <span className={`metric-value status-${getPerformanceStatus()}`}>
                {getPerformanceStatus() === 'good' ? '✅ Good' : '⚠️ Check'}
              </span>
            </div>
          </div>
          
          <div className="performance-tips">
            <div className="info">ℹ️ Browser FPS - not game internal FPS</div>
            {metrics.memoryUsed > 500 && (
              <div className="tip">💡 High memory usage detected</div>
            )}
            {metrics.fps < 30 && (
              <div className="tip">💡 Low FPS detected</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;