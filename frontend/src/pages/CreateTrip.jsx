import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { FaCalendarAlt, FaDollarSign, FaFileAlt, FaGlobe, FaChevronLeft } from 'react-icons/fa';

const CreateTrip = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      setError('Please fill in Trip Name, Start Date, and End Date.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start Date cannot be after End Date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        budget_limit: budgetLimit ? parseFloat(budgetLimit) : 0.00,
        cover_photo: coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
        is_public: false,
        stops: []
      };

      const res = await api.post('trips/', payload);
      // Redirect to edit page to build stops and activities
      navigate(`/trips/${res.data.id}/edit`);
    } catch (err) {
      console.error(err);
      setError('Failed to create trip. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '600px' }}>
      <div className="mb-4">
        <Link to="/trips" className="text-decoration-none d-flex align-items-center gap-1 text-muted fw-medium small">
          <FaChevronLeft size={12} /> Back to Trips
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
        <h3 className="fw-bold text-dark-blue mb-2">Plan a New Trip</h3>
        <p className="text-muted small mb-4">Set your basic details to start building a day-by-day travel timeline.</p>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Trip Name */}
          <div className="mb-3">
            <label className="form-label small fw-bold">Trip Name *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><FaGlobe size={13} className="text-muted" /></span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="e.g. Summer Vacation in Europe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label small fw-bold">Description / Notes</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><FaFileAlt size={13} className="text-muted" /></span>
              <textarea
                className="form-control bg-light border-start-0"
                rows="3"
                placeholder="Describe your trip goals, packing lists, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label small fw-bold">Start Date *</label>
              <input
                type="date"
                className="form-control bg-light"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label small fw-bold">End Date *</label>
              <input
                type="date"
                className="form-control bg-light"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Budget */}
          <div className="mb-3">
            <label className="form-label small fw-bold">Overall Budget Limit ($)</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><FaDollarSign size={13} className="text-muted" /></span>
              <input
                type="number"
                step="0.01"
                className="form-control bg-light border-start-0"
                placeholder="e.g. 3000 (0 for no limit)"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
              />
            </div>
          </div>

          {/* Cover Photo URL */}
          <div className="mb-4">
            <label className="form-label small fw-bold">Cover Photo URL (optional)</label>
            <input
              type="url"
              className="form-control bg-light"
              placeholder="https://images.unsplash.com/... (Default used if blank)"
              value={coverPhoto}
              onChange={(e) => setCoverPhoto(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              'Start Planning Stops'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
