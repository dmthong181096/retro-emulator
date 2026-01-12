import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-profile')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  if (!user) return null;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    const confirmed = window.confirm('Bạn có chắc muốn đăng xuất?');
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      const result = await logout();
      if (result.success) {
        console.log('✅ Đăng xuất thành công');
      } else {
        console.error('❌ Lỗi đăng xuất:', result.error);
        alert('Lỗi đăng xuất: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Lỗi đăng xuất:', error);
      alert('Lỗi đăng xuất');
    } finally {
      setIsLoggingOut(false);
      setShowDropdown(false);
    }
  };

  return (
    <div className="user-profile">
      <div 
        className="user-avatar"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="avatar-icon">👤</span>
        <span className="user-name">{user.name}</span>
        <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
      </div>

      {showDropdown && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="user-info">
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <div className="dropdown-items">
            <button className="dropdown-item">
              💾 Cloud Saves
            </button>
            <button className="dropdown-item">
              ⚙️ Settings
            </button>
            <button 
              className={`dropdown-item logout ${isLoggingOut ? 'loading' : ''}`}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? '🔄 Đang đăng xuất...' : '🚪 Đăng xuất'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;