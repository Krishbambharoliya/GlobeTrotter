import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FaCalendarAlt, FaDollarSign, FaFileAlt, FaGlobe, FaChevronLeft, FaMapMarkerAlt, FaPlus, FaCheck } from 'react-icons/fa';
import api from '../api';
import { placeSuggestions } from '../data/mockData';

const CreateTrip = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paramDest = searchParams.get('dest') || searchParams.get('city') || '';
  const paramName = searchParams.get('name') || (paramDest ? `${paramDest} Tour & Vacation` : searchParams.get('activity') ? `Trip including ${searchParams.get('activity')}` : '');
  const paramDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const paramDays = parseInt(searchParams.get('days') || '5', 10);
  const paramBudget = searchParams.get('budget') || '20000';

  const calcEndDate = (start, days) => {
    const d = new Date(start);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [name, setName] = useState(paramName);
  const [description, setDescription] = useState(searchParams.get('activity') ? `Exploring ${searchParams.get('activity')} and local highlights in ${paramDest}` : `Multi-day travel adventure exploring ${paramDest || 'curated destinations'}.`);
  const [startDate, setStartDate] = useState(paramDate);
  const [endDate, setEndDate] = useState(calcEndDate(paramDate, paramDays));
  const [budgetLimit, setBudgetLimit] = useState(paramBudget);
  const [coverPhoto, setCoverPhoto] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(paramDest);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const places = ['Paris, France', 'New York, USA', 'Tokyo, Japan', 'Kyoto, Japan', 'Bali, Indonesia', 'London, UK'];

  const toggleSuggestion = (id) => {
    setSelectedSuggestions((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

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

    const selectedPlaces = placeSuggestions.filter((p) => selectedSuggestions.includes(p.id));

    try {
      const payload = {
        name,
        description: description || (selectedPlace ? `Trip to ${selectedPlace}` : ''),
        start_date: startDate,
        end_date: endDate,
        budget_limit: budgetLimit ? parseFloat(budgetLimit) : 0.0,
        cover_photo: coverPhoto || selectedPlaces[0]?.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
        is_public: false,
        stops: selectedPlace
          ? [{ city_name: selectedPlace.split(',')[0]?.trim(), country_name: selectedPlace.split(',')[1]?.trim() || '', activities: [] }]
          : [],
      };

      const res = await api.post('trips/', payload);
      navigate(`/trips/${res.data.id}/edit`);
    } catch {
      const mockId = Date.now();
      const mockTrip = { id: mockId, ...{ name, startDate, endDate, selectedPlace, selectedSuggestions } };
      const stored = JSON.parse(localStorage.getItem('mock_trips') || '[]');
      stored.push(mockTrip);
      localStorage.setItem('mock_trips', JSON.stringify(stored));
      navigate(`/trips/${mockId}/edit`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 create-trip-page" style={{ maxWidth: '900px' }}>
      <div className="mb-3">
        <Link to="/trips" className="text-decoration-none d-flex align-items-center gap-1 text-muted fw-medium small">
          <FaChevronLeft size={12} /> Back to Trips
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 dash-card">
        <h3 className="fw-bold mb-2">Create a New Trip</h3>
        <p className="text-muted small mb-4">Name your trip, pick dates, choose a destination, and add suggested places.</p>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Trip Name *</label>
            <div className="input-group">
              <span className="input-group-text border-end-0"><FaGlobe size={13} className="text-muted" /></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="e.g. Summer Vacation in Europe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">Start Date *</label>
              <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">End Date *</label>
              <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Place Selector</label>
            <div className="input-group">
              <span className="input-group-text border-end-0"><FaMapMarkerAlt size={13} className="text-muted" /></span>
              <select className="form-select border-start-0" value={selectedPlace} onChange={(e) => setSelectedPlace(e.target.value)}>
                <option value="">Select a destination...</option>
                {places.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Suggested Places & Activities</label>
            <div className="row g-3">
              {placeSuggestions.map((place) => {
                const isSelected = selectedSuggestions.includes(place.id);
                return (
                  <div className="col-6 col-md-4" key={place.id}>
                    <button
                      type="button"
                      className={`suggestion-card w-100 border-0 p-0 text-start ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleSuggestion(place.id)}
                    >
                      <div className="suggestion-img" style={{ backgroundImage: `url(${place.image})` }}>
                        {isSelected && (
                          <span className="suggestion-check"><FaCheck size={12} /></span>
                        )}
                      </div>
                      <div className="p-2">
                        <h6 className="fw-bold small mb-0 text-truncate">{place.name}</h6>
                        <small className="text-muted">{place.city} · {place.type}</small>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Description / Notes</label>
            <textarea className="form-control" rows={2} placeholder="Trip goals, packing lists..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Budget Limit (₹)</label>
            <div className="input-group">
              <span className="input-group-text border-end-0">₹</span>
              <input type="number" step="0.01" className="form-control border-start-0" placeholder="e.g. 3000" value={budgetLimit} onChange={(e) => setBudgetLimit(e.target.value)} />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Cover Photo URL (optional)</label>
            <input type="url" className="form-control" placeholder="https://images.unsplash.com/..." value={coverPhoto} onChange={(e) => setCoverPhoto(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold shadow-sm" disabled={loading}>
            {loading ? 'Creating...' : 'Create Trip & Build Itinerary'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
