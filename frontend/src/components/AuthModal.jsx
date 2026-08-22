import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const getErrorMessage = (err, defaultMsg) => {
  if (!err.response) {
    return 'Network error. Please check if the backend server is running.';
  }
  const data = err.response.data;
  if (data) {
    if (typeof data === 'string') {
      if (data.includes('<!DOCTYPE html>') || data.includes('<html')) {
        return `Server error (${err.response.status}). Please try again later.`;
      }
      return data.slice(0, 150);
    }
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (typeof data === 'object') {
      return Object.values(data)
        .map((val) => (Array.isArray(val) ? val.join(' ') : String(val)))
        .join(' ');
    }
  }
  return defaultMsg;
};

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [authView, setAuthView] = useState('login'); // 'login', 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setAuthView('login');
      setError('');
      setSuccess('');
      setUsername('');
      setPassword('');
      setEmail('');
      setPhoneNumber('');
      setFirstName('');
      setLastName('');
      setCity('');
      setCountry('');
      setAdditionalInfo('');
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (authView === 'login') {
      try {
        const response = await api.post('users/login/', { username, password });
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('username', username);

        const profileRes = await api.get('users/profile/');
        localStorage.setItem('first_name', profileRes.data.first_name || username);
        localStorage.setItem('is_staff', profileRes.data.is_staff ? 'true' : 'false');

        setSuccess('Logged in successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } catch (err) {
        setError(getErrorMessage(err, 'Incorrect username or password. Please try again.'));
      }
    } else if (authView === 'register') {
      try {
        await api.post('users/register/', {
          username,
          email,
          phone_number: phoneNumber,
          first_name: firstName,
          last_name: lastName,
          password
        });
        setSuccess('Registration successful! Please login.');
        setAuthView('login');
        setPassword('');
      } catch (err) {
        setError(getErrorMessage(err, 'Registration failed. Please try again.'));
      }
    }
  };

  return (
    <div className="modal show d-block animate-fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 20000 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div className="modal-body p-0">
            <div className="p-4 p-md-5 text-start">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark-blue mb-0">
                  {authView === 'login' && 'Login to GlobeTrotter'}
                  {authView === 'register' && 'Register on GlobeTrotter'}
                </h4>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              {success && <div className="alert alert-success py-2 small">{success}</div>}

              <form onSubmit={handleSubmit}>
                {authView === 'login' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Email / Username</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter email or username"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-bold">Password</label>
                      <input
                        type="password"
                        className="form-control rounded-3"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                      />
                    </div>
                  </>
                )}

                {authView === 'register' && (
                  <>
                    <div className="mb-2">
                      <label className="form-label small fw-bold">Username</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose username"
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small fw-bold">Email</label>
                      <input
                        type="email"
                        className="form-control rounded-3"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small fw-bold">Phone Number</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter mobile number"
                      />
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="form-label small fw-bold">First Name</label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First Name"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Last Name</label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last Name"
                        />
                      </div>
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="form-label small fw-bold">City</label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Country</label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div className="mb-2">
                      <label className="form-label small fw-bold">Additional Information</label>
                      <textarea
                        className="form-control rounded-3"
                        rows={2}
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        placeholder="Travel preferences, dietary rules, etc."
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-bold">Password</label>
                      <input
                        type="password"
                        className="form-control rounded-3"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
                      />
                    </div>
                  </>
                )}



                <p className="text-muted small text-center mb-3" style={{ fontSize: '12px' }}>
                  By proceeding, you agree to our{' '}
                  <Link to="/terms" onClick={onClose} className="fw-semibold" style={{ color: 'var(--primary-sage)', textDecoration: 'none' }}>Terms & Conditions</Link>{' '}
                  and{' '}
                  <Link to="/privacy" onClick={onClose} className="fw-semibold" style={{ color: 'var(--primary-sage)', textDecoration: 'none' }}>Privacy Policy</Link>.
                </p>

                <button
                  type="submit"
                  className="btn w-100 py-3 rounded-pill fw-bold text-white shadow-sm"
                  style={{ background: 'var(--primary-sage, #2d4a3e)' }}
                >
                  {authView === 'login' && 'Login'}
                  {authView === 'register' && 'Register'}
                </button>
              </form>

              <div className="mt-4 text-center">
                {authView === 'login' && (
                  <button
                    onClick={() => {
                      setAuthView('register');
                      setError('');
                      setSuccess('');
                    }}
                    className="btn btn-link text-primary p-0 border-0 fs-6 text-decoration-none fw-bold"
                  >
                    Don't have an account? Sign Up
                  </button>
                )}
                {authView === 'register' && (
                  <button
                    onClick={() => {
                      setAuthView('login');
                      setError('');
                      setSuccess('');
                    }}
                    className="btn btn-link text-primary p-0 border-0 fs-6 text-decoration-none fw-bold"
                  >
                    Already have an account? Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
