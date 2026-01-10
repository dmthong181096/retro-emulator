import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
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
            <button className="dropdown-item logout" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;