import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, saveLoginInfo, getSavedLoginInfo, saveToken } from '../services/authService';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState('username'); // username, both
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 初始化时加载保存的登录信息
  useEffect(() => {
    const savedInfo = getSavedLoginInfo();
    if (savedInfo.username) {
      setUsername(savedInfo.username);
      setRememberMe(savedInfo.password ? 'both' : 'username');
    }
    if (savedInfo.password) {
      setPassword(savedInfo.password);
    }
  }, []);

  // 处理登录提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password, rememberMe);
      if (result.code === 0) {
        // 保存登录信息
        saveLoginInfo(username, password, rememberMe);
        // 保存令牌
        saveToken(result.token);
        // 跳转到主页面
        navigate('/main');
      } else {
        setError(result.message || '登录失败，请重试');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 处理记住密码选项变化
  const handleRememberMeChange = (value) => {
    setRememberMe(value);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">工程项目管理系统</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">用户名</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">密码</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>
          
          <div className="remember-options">
            <label className="remember-option">
              <input
                type="radio"
                name="rememberMe"
                value="username"
                checked={rememberMe === 'username'}
                onChange={() => handleRememberMeChange('username')}
              />
              记住用户名
            </label>
            <label className="remember-option">
              <input
                type="radio"
                name="rememberMe"
                value="both"
                checked={rememberMe === 'both'}
                onChange={() => handleRememberMeChange('both')}
              />
              记住用户名和密码
            </label>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="login-hint">
          <p>测试用户名：a</p>
          <p>测试密码：a</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;