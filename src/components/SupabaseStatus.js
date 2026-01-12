import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const SupabaseStatus = () => {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState('');

  useEffect(() => {
    const checkSupabaseConnection = async () => {
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
          if (error.message.includes('Failed to fetch') || 
              error.message.includes('CORS')) {
            setStatus('cors-error');
            setDetails('CORS/Network error - check Supabase configuration');
          } else {
            setStatus('error');
            setDetails(`Connection error: ${error.message}`);
          }
        } else {
          setStatus('connected');
          setDetails('Supabase connected successfully');
        }
      } catch (error) {
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