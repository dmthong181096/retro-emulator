import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { login, register } = useAuth();

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      resetForm();
    }, 300);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setIsLogin(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(email, password, confirmPassword);
      }

      if (result.success) {
        handleClose();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={`auth-overlay ${isClosing ? 'closing' : ''}`}
        onClick={handleClose}
      />
      <div className={`auth-modal ${isClosing ? 'closing' : ''}`}>
        <div className="auth-header">
          <h3>{isLogin ? '🔐 Đăng nhập' : '📝 Đăng ký'}</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="auth-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Ít nhất 6 ký tự"
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Xác nhận Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Nhập lại password"
                  minLength={6}
                />
              </div>
            )}

            {error && (
              <div className="auth-error">
                ⚠️ {error}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : (isLogin ? '🔐 Đăng nhập' : '📝 Đăng ký')}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? (
              <p>
                Chưa có tài khoản? 
                <button 
                  type="button" 
                  className="switch-btn"
                  onClick={() => setIsLogin(false)}
                >
                  Đăng ký ngay
                </button>
              </p>
            ) : (
              <p>
                Đã có tài khoản? 
                <button 
                  type="button" 
                  className="switch-btn"
                  onClick={() => setIsLogin(true)}
                >
                  Đăng nhập
                </button>
              </p>
            )}
          </div>

          <div className="auth-info">
            <h4>💾 Cloud Save Features:</h4>
            <ul>
              <li>✅ Lưu game states lên cloud</li>
              <li>✅ Sync across devices</li>
              <li>✅ Backup tự động</li>
              <li>✅ Access từ bất cứ đâu</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;