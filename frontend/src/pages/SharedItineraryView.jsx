import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api';
import { FaCalendarAlt, FaCopy, FaGlobe, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const SharedItineraryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [collapsedStops, setCollapsedStops] = useState({});

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchPublicItinerary();
  }, [id]);

  const fetchPublicItinerary = async () => {
    setLoading(true);
    try {
      // Use direct axios to allow unauthenticated access
      const res = await axios.get(`http://127.0.0.1:8000/api/trips/public-detail/${id}/`);
      setTrip(res.data);
    } catch (err) {
      console.error(err);
      setError('Itinerary not found or is set to private by the author.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!token) {
      alert('Please log in or register first to copy this itinerary to your profile!');
      return;
    }
    try {
      const res = await api.post(`trips/${id}/copy/`);
      alert('Itinerary copied successfully! Redirecting to your trips dashboard...');
      navigate('/trips');
    } catch (err) {
      console.error(err);
      alert('Failed to copy itinerary.');
    }
  };

  const toggleStopCollapse = (stopIndex) => {
    setCollapsedStops(prev => ({
      ...prev,
      [stopIndex]: !prev[stopIndex]
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning py-4 rounded-4 shadow-sm">{error || 'This itinerary is private.'}</div>
        <Link to="/trips" className="btn btn-primary rounded-pill px-4 fw-bold">Browse Public Templates</Link>
      </div>
    );
  }

  // Cost calculations
  const categories = {
    Transport: 0,
    Lodging: 0,
    Meals: 0,
    Sightseeing: 0,
    Food: 0,
    Adventure: 0,
    Custom: 0
  };

  let totalCost = 0;
  trip.stops?.forEach(stop => {
    stop.activities?.forEach(act => {
      const c = parseFloat(act.cost) || 0;
      totalCost += c;
      const cat = act.category || 'Custom';
      if (categories[cat] !== undefined) {
        categories[cat] += c;
      } else {
        categories['Custom'] += c;
      }
    });
  });

  const totalDays = trip.stops ? trip.stops.length : 0;

  return (
    <div className="container py-5" style={{ maxWidth: '1000px' }}>
      
      {/* Copy Panel Banner */}
      <div className="alert alert-info d-flex justify-content-between align-items-center flex-wrap gap-2.5 rounded-4 shadow-sm mb-4">
        <div>
          <h6 className="fw-bold mb-0.5 text-dark-blue">Shared Community Itinerary</h6>
          <p className="mb-0 small text-muted">You are viewing a travel plan shared by <strong>@{trip.user_username}</strong>. You can copy it to your account to edit.</p>
        </div>
        <button onClick={handleCopy} className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-1.5 shadow-sm btn-sm">
          <FaCopy /> Copy Itinerary to My Account
        </button>
      </div>

      {/* Hero Header */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <div 
          style={{ 
            height: '240px',
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.25)), url(${trip.cover_photo || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '24px'
          }}
        >
          <div className="text-white w-100">
            <h1 className="fw-bold mb-2">{trip.name}</h1>
            <p className="opacity-90 mb-3 small max-width-600">{trip.description || 'No description provided.'}</p>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span className="badge bg-secondary-subtle text-dark small d-inline-flex align-items-center gap-1">
                <FaCalendarAlt size={11} /> {trip.start_date} to {trip.end_date}
              </span>
              <span className="badge bg-light text-dark small">{totalDays} Stops</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Side: Day Timeline */}
        <div className="col-lg-7">
          <h4 className="fw-bold text-dark-blue mb-3">Day-wise Timeline</h4>
          
          <div className="d-flex flex-column gap-3.5 position-relative">
            {trip.stops?.length === 0 ? (
              <div className="bg-white p-4 rounded-4 shadow-sm border text-muted">
                No stops scheduled on this itinerary.
              </div>
            ) : (
              trip.stops.map((stop, index) => {
                const isCollapsed = collapsedStops[index];
                return (
                  <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden" key={index}>
                    <div 
                      onClick={() => toggleStopCollapse(index)}
                      className="card-header bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center cursor-pointer hover-bg-light"
                      style={{ cursor: 'pointer' }}
                    >
                      <div>
                        <h5 className="fw-bold text-dark-blue mb-1">
                          Day {index + 1}: {stop.city_name}, {stop.country_name}
                        </h5>
                        <span className="text-muted small"><FaCalendarAlt size={11} className="me-1" /> {stop.date}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-secondary-subtle text-dark small">{stop.activities?.length || 0} activities</span>
                        {isCollapsed ? <FaChevronDown size={12} className="text-muted" /> : <FaChevronUp size={12} className="text-muted" />}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="card-body border-top px-4 py-3 bg-white">
                        {stop.activities?.length === 0 ? (
                          <p className="text-muted small mb-0">No activities scheduled for this stop.</p>
                        ) : (
                          <div className="timeline-activity-list d-flex flex-column gap-3">
                            {stop.activities.map((act, actIdx) => (
                              <div className="d-flex gap-3 position-relative pb-2 border-left" key={actIdx}>
                                <div className="timeline-bullet rounded-circle bg-primary mt-1.5" style={{ width: '10px', height: '10px', flexShrink: 0 }}></div>
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                      <h6 className="fw-bold mb-0.5 text-dark-blue">{act.name}</h6>
                                      <span className="badge bg-light text-muted small me-2">{act.category}</span>
                                      <span className="text-muted small">{act.start_time} | {act.duration_hours}h</span>
                                    </div>
                                    <span className="fw-bold text-primary-blue small">${(parseFloat(act.cost) || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Cost Breakdown */}
        <div className="col-lg-5">
          <h4 className="fw-bold text-dark-blue mb-3">Itinerary Summary</h4>
          
          <div className="d-flex flex-column gap-4">
            
            {/* Total */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
              <span className="text-muted small block text-center">Estimated Total Price</span>
              <h2 className="fw-bold text-primary-blue mt-1 mb-0 text-center">${totalCost.toFixed(2)}</h2>
            </div>

            {/* Expenses breakdown */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
              <h6 className="fw-bold text-dark-blue mb-3">Expenses by Category</h6>
              <div className="d-flex flex-column gap-3">
                {Object.entries(categories).map(([cat, val]) => {
                  if (val === 0) return null;
                  const pct = totalCost > 0 ? Math.round((val / totalCost) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small fw-semibold text-dark-blue">{cat}</span>
                        <span className="small text-muted">${val.toFixed(2)} ({pct}%)</span>
                      </div>
                      <div className="progress" style={{ height: '5px' }}>
                        <div 
                          className="progress-bar bg-primary" 
                          role="progressbar" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedItineraryView;
