import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const SupabaseStatus = () => {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState('');
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      // Collect debug info
      const debug = {
        environment: process.env.NODE_ENV,
        hasUrl: !!process.env.REACT_APP_SUPABASE_URL,
        hasKey: !!process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
        urlPreview: process.env.REACT_APP_SUPABASE_URL ? 
          `${process.env.REACT_APP_SUPABASE_URL.substring(0, 30)}...` : 'undefined',
        keyPreview: process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? 
          `${process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY.substring(0, 20)}...` : 'undefined'
      };
      
      setDebugInfo(debug);
      console.log('🔍 SupabaseStatus Debug Info:', debug);

      try {
        // Test if supabase is real or mock
        if (!supabase || !supabase.auth || typeof supabase.auth.getSession !== 'function') {
          setStatus('mock');
          setDetails('Using mock authentication (Supabase not configured)');
          return;
        }

        // Try to make a simple request
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('❌ Supabase connection error:', error);
          if (error.message.includes('Failed to fetch') || 
              error.message.includes('CORS')) {
            setStatus('cors-error');
            setDetails('CORS/Network error - check Supabase configuration');
          } else {
            setStatus('error');
            setDetails(`Connection error: ${error.message}`);
          }
        } else {
          console.log('✅ Supabase connection successful:', data);
          setStatus('connected');
          setDetails('Supabase connected successfully');
        }
      } catch (error) {
        console.log('❌ Supabase connection exception:', error);
        setStatus('error');
        setDetails(`Connection failed: ${error.message}`);
      }
    };

    checkSupabaseConnection();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking': return '🔄';
      case 'connected': return '✅';
      case 'mock': return '🔧';
      case 'cors-error': return '🌐';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'mock': return '#FF9800';
      case 'cors-error': return '#F44336';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px 15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '5px'
      }}>
        <span style={{ fontSize: '16px' }}>{getStatusIcon()}</span>
        <strong style={{ color: getStatusColor() }}>
          Supabase: {status.toUpperCase()}
        </strong>
      </div>
      <div style={{ fontSize: '11px', opacity: 0.8 }}>
        {details}
      </div>
      
      {/* Debug info - only show in development or when there's an issue */}
      {(process.env.NODE_ENV === 'development' || status !== 'connected') && (
        <div style={{ 
          fontSize: '10px', 
          marginTop: '8px', 
          padding: '6px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          <div>🔧 Debug Info:</div>
          <div>• ENV: {debugInfo.environment}</div>
          <div>• URL: {debugInfo.hasUrl ? '✅' : '❌'} {debugInfo.urlPreview}</div>
          <div>• KEY: {debugInfo.hasKey ? '✅' : '❌'} {debugInfo.keyPreview}</div>
        </div>
      )}
      
      {status === 'cors-error' && (
        <div style={{ 
          fontSize: '10px', 
          marginTop: '5px', 
          padding: '5px',
          background: 'rgba(255,152,0,0.2)',
          borderRadius: '4px'
        }}>
          💡 Check your Supabase project settings and API key
        </div>
      )}
    </div>
  );
};

export default SupabaseStatus;