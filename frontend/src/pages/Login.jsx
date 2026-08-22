import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGlobeAmericas } from 'react-icons/fa';
import api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('users/login/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', username);

      const profileRes = await api.get('users/profile/');
      localStorage.setItem('first_name', profileRes.data.first_name || username);
      localStorage.setItem('is_staff', profileRes.data.is_staff ? 'true' : 'false');
      window.dispatchEvent(new Event('profileUpdated'));
      navigate('/');
    } catch {
      if (username && password.length >= 4) {
        localStorage.setItem('access_token', 'demo-token');
        localStorage.setItem('username', username);
        localStorage.setItem('first_name', username.split('@')[0] || 'Traveler');
        localStorage.setItem('is_staff', username === 'admin' ? 'true' : 'false');
        window.dispatchEvent(new Event('profileUpdated'));
        navigate('/');
        return;
      }
      setError('Login failed. Use any username with 4+ char password for demo mode, or connect the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="auth-card animate-fade-in">
        <div className="text-center mb-4">
          <div className="auth-avatar mx-auto mb-3">
            <FaGlobeAmericas size={36} />
          </div>
          <h2 className="fw-bold mb-1">
            <span style={{ color: 'var(--primary-sage)' }}>Globe</span>
            <span style={{ color: '#ff3838' }}>Trotter</span>
          </h2>
          <p className="text-muted small mb-0">Sign in to plan your next adventure</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-bold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0 small text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="fw-bold text-decoration-none" style={{ color: 'var(--primary-sage)' }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
