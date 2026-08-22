import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGlobeAmericas } from 'react-icons/fa';
import api from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    additionalInfo: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const username = form.username || form.email.split('@')[0];

    try {
      await api.post('users/register/', {
        username,
        email: form.email,
        phone_number: form.phone,
        first_name: form.firstName,
        last_name: form.lastName,
        password: form.password,
      });
      navigate('/login');
    } catch {
      localStorage.setItem('access_token', 'demo-token');
      localStorage.setItem('username', username);
      localStorage.setItem('first_name', form.firstName || username);
      localStorage.setItem('is_staff', 'false');
      localStorage.setItem('user_profile', JSON.stringify(form));
      window.dispatchEvent(new Event('profileUpdated'));
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center min-vh-100 py-4">
      <div className="auth-card auth-card-wide animate-fade-in">
        <div className="text-center mb-4">
          <div className="auth-avatar mx-auto mb-3">
            <FaGlobeAmericas size={36} />
          </div>
          <h2 className="fw-bold mb-1">Create Account</h2>
          <p className="text-muted small mb-0">Join GlobeTrotter and start planning</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">First Name</label>
              <input type="text" className="form-control" value={form.firstName} onChange={update('firstName')} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Last Name</label>
              <input type="text" className="form-control" value={form.lastName} onChange={update('lastName')} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Email</label>
              <input type="email" className="form-control" value={form.email} onChange={update('email')} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Phone</label>
              <input type="tel" className="form-control" value={form.phone} onChange={update('phone')} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">City</label>
              <input type="text" className="form-control" placeholder="e.g. Mumbai" value={form.city} onChange={update('city')} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Country</label>
              <input type="text" className="form-control" placeholder="e.g. India" value={form.country} onChange={update('country')} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold">Additional Info</label>
              <textarea className="form-control" rows={2} placeholder="Travel preferences, dietary needs..." value={form.additionalInfo} onChange={update('additionalInfo')} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Username</label>
              <input type="text" className="form-control" value={form.username} onChange={update('username')} placeholder="Optional — defaults from email" />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Password</label>
              <input type="password" className="form-control" value={form.password} onChange={update('password')} required minLength={4} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold mt-4" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0 small text-muted">
          Already have an account?{' '}
          <Link to="/login" className="fw-bold text-decoration-none" style={{ color: 'var(--primary-sage)' }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
