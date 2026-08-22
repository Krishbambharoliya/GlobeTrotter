import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { FaCalendarAlt, FaPlus, FaEye, FaEdit, FaTrash, FaShareAlt, FaCopy, FaGlobeAmericas } from 'react-icons/fa';
import { mockTrips, categorizeTrips, getTripStatus } from '../data/mockData';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [publicTrips, setPublicTrips] = useState([]);
  const [tab, setTab] = useState('my-trips');
  const [statusFilter, setStatusFilter] = useState('all'); // all, ongoing, upcoming, completed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingMock, setUsingMock] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchTrips();
  }, [tab]);

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'my-trips') {
        if (!token) {
          setTrips(mockTrips);
          setUsingMock(true);
          setLoading(false);
          return;
        }
        const res = await api.get('trips/');
        setTrips(res.data.length ? res.data : mockTrips);
        setUsingMock(!res.data.length);
      } else {
        const res = await api.get('trips/public/');
        setPublicTrips(res.data.length ? res.data : mockTrips.filter((t) => t.is_public));
      }
    } catch (err) {
      console.error(err);
      if (tab === 'my-trips') {
        setTrips(mockTrips);
        setUsingMock(true);
      } else {
        setPublicTrips(mockTrips.filter((t) => t.is_public));
      }
    } finally {
      setLoading(false);
    }
  };

  const categorized = useMemo(() => categorizeTrips(trips), [trips]);

  const displayedTrips = useMemo(() => {
    if (statusFilter === 'all') return trips;
    return categorized[statusFilter] || [];
  }, [trips, statusFilter, categorized]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;
    try {
      await api.delete(`trips/${id}/`);
      setTrips(trips.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete trip.');
    }
  };

  const handleCopy = async (id) => {
    if (!token) {
      alert('Please log in first to copy templates to your account!');
      return;
    }
    try {
      const res = await api.post(`trips/${id}/copy/`);
      alert('Trip copied successfully to your account!');
      setTab('my-trips');
    } catch (err) {
      alert('Error copying trip.');
    }
  };

  const togglePublic = async (trip) => {
    try {
      const res = await api.patch(`trips/${trip.id}/`, { is_public: !trip.is_public });
      setTrips(trips.map(t => t.id === trip.id ? res.data : t));
    } catch (err) {
      alert('Failed to update sharing setting.');
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '1200px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark-blue mb-1">Explore & Plan Trips</h2>
          <p className="text-muted mb-0">Design personalized itineraries, estimate costs, and track budget breakdown expenses.</p>
        </div>
        <Link to="/trips/new" className="btn btn-primary rounded-pill px-4 py-2.5 fw-bold shadow-sm d-flex align-items-center gap-2">
          <FaPlus /> Plan New Trip
        </Link>
      </div>

      {/* Featured 1-Click Quick Trip Presets */}
      <div className="card border-0 rounded-4 p-4 mb-4 shadow-sm" style={{ background: 'var(--warm-card, #ffffff)' }}>
        <h5 className="fw-bold text-dark-blue mb-2">⚡ Quick 1-Click Trip Presets</h5>
        <p className="text-muted small mb-3">Select a popular destination below to instantly pre-fill a multi-day itinerary template:</p>
        <div className="row g-2">
          {[
            { name: 'Goa Beach Escape', city: 'Goa', days: 5, budget: 15000, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
            { name: 'Manali Snow Expedition', city: 'Manali', days: 6, budget: 22000, img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=400&q=80' },
            { name: 'Kashmir Paradise Tour', city: 'Srinagar', days: 7, budget: 25000, img: 'https://images.unsplash.com/photo-1566837430420-9de97abaf222?auto=format&fit=crop&w=400&q=80' },
            { name: 'Dubai Desert & Luxury', city: 'Dubai', days: 5, budget: 65000, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80' },
          ].map((preset, i) => (
            <div key={i} className="col-6 col-md-3">
              <div
                className="rounded-3 p-3 text-white transition-all hover-elevation"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%), url(${preset.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '110px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/trips/new?dest=${encodeURIComponent(preset.city)}&name=${encodeURIComponent(preset.name)}&days=${preset.days}&budget=${preset.budget}`)}
              >
                <h6 className="fw-bold mb-0 text-white text-truncate">{preset.name}</h6>
                <span className="small text-white-50" style={{ fontSize: '11px' }}>{preset.days} Days • ₹{preset.budget.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex border-bottom mb-3 flex-wrap">
        <button
          className={`btn border-0 rounded-0 px-4 py-2 fw-semibold ${tab === 'my-trips' ? 'border-bottom border-primary border-3 text-primary' : 'text-muted'}`}
          onClick={() => setTab('my-trips')}
        >
          My Trips ({trips.length})
        </button>
        <button
          className={`btn border-0 rounded-0 px-4 py-2 fw-semibold ${tab === 'public-templates' ? 'border-bottom border-primary border-3 text-primary' : 'text-muted'}`}
          onClick={() => setTab('public-templates')}
        >
          Community Templates ({publicTrips.length || mockTrips.length})
        </button>
      </div>

      {tab === 'my-trips' && (
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {[
            { key: 'all', label: 'All', count: trips.length },
            { key: 'ongoing', label: 'Ongoing', count: categorized.ongoing.length },
            { key: 'upcoming', label: 'Upcoming', count: categorized.upcoming.length },
            { key: 'completed', label: 'Completed', count: categorized.completed.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${statusFilter === key ? 'btn-primary shadow-sm' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter(key)}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      )}

      {usingMock && tab === 'my-trips' && (
        <div className="alert alert-info py-2 small rounded-4">Showing sample trips — connect backend or login for live data.</div>
      )}
      {error && <div className="alert alert-warning py-3 text-center rounded-4 shadow-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {tab === 'my-trips' && (
            <div className="row g-4">
              {displayedTrips.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <div className="bg-white p-5 rounded-4 border shadow-sm max-width-500 mx-auto">
                    <FaGlobeAmericas size={48} className="text-primary-blue mb-3 animate-bounce" />
                    <h5 className="fw-bold">No trips planned yet!</h5>
                    <p className="text-muted small">Ready to start your next adventure? Build a day-wise itinerary now.</p>
                    <Link to="/trips/new" className="btn btn-primary rounded-pill px-4 fw-bold btn-sm mt-2 shadow-sm">
                      Create Trip
                    </Link>
                  </div>
                </div>
              ) : (
                displayedTrips.map((trip) => {
                  const budgetNum = parseFloat(trip.budget_limit) || 0;
                  const totalCostNum = parseFloat(trip.total_cost) || 0;
                  const percent = budgetNum > 0 ? Math.min(100, Math.round((totalCostNum / budgetNum) * 100)) : 0;
                  const isOverBudget = totalCostNum > budgetNum && budgetNum > 0;
                  const status = getTripStatus(trip);
                  const statusBadge = { ongoing: 'success', upcoming: 'primary', completed: 'secondary' }[status];

                  return (
                    <div className="col-lg-4 col-md-6" key={trip.id}>
                      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-shadow" style={{ transition: 'all 0.3s' }}>
                        <span className={`badge bg-${statusBadge} position-absolute top-0 end-0 m-2 z-1 text-capitalize`}>{status}</span>
                        <div 
                          className="ratio ratio-16x9 bg-light text-white d-flex align-items-end p-3" 
                          style={{ 
                            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1)), url(${trip.cover_photo || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="position-absolute bottom-0 start-0 p-3 w-100">
                            <h5 className="fw-bold mb-1 text-truncate text-white">{trip.name}</h5>
                            <span className="badge bg-secondary-subtle text-dark small d-inline-flex align-items-center gap-1">
                              <FaCalendarAlt size={11} /> {trip.start_date} to {trip.end_date}
                            </span>
                          </div>
                        </div>
                        <div className="card-body d-flex flex-column justify-content-between p-4">
                          <div>
                            <p className="text-muted small text-truncate-2 mb-3">{trip.description || 'No description provided.'}</p>
                            
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted small">Stops:</span>
                              <span className="fw-bold small text-dark">{trip.stops?.length || 0} Cities</span>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="text-muted small">Estimated Cost:</span>
                              <span className="fw-bold text-primary-blue">₹{totalCostNum.toLocaleString('en-IN')}</span>
                            </div>

                            {budgetNum > 0 && (
                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="text-muted small">Budget: ₹{budgetNum.toLocaleString('en-IN')}</span>
                                  <span className={`small fw-bold ${isOverBudget ? 'text-danger' : 'text-success'}`}>{percent}%</span>
                                </div>
                                <div className="progress" style={{ height: '6px' }}>
                                  <div 
                                    className={`progress-bar ${isOverBudget ? 'bg-danger' : 'bg-success'}`}
                                    role="progressbar" 
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="d-flex align-items-center justify-content-between pt-3 border-top gap-1 flex-wrap">
                            <div className="d-flex gap-1">
                              <Link to={`/trips/${trip.id}`} className="btn btn-sm btn-outline-primary rounded-circle" title="View details">
                                <FaEye size={13} />
                              </Link>
                              <Link to={`/trips/${trip.id}/edit`} className="btn btn-sm btn-outline-secondary rounded-circle" title="Edit itinerary">
                                <FaEdit size={13} />
                              </Link>
                              <button onClick={() => handleDelete(trip.id)} className="btn btn-sm btn-outline-danger rounded-circle" title="Delete trip">
                                <FaTrash size={13} />
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => togglePublic(trip)} 
                              className={`btn btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1 ${trip.is_public ? 'btn-success' : 'btn-outline-success'}`}
                              title={trip.is_public ? 'Make Private' : 'Make Public'}
                            >
                              <FaShareAlt size={11} /> {trip.is_public ? 'Public' : 'Share'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === 'public-templates' && (
            <div className="row g-4">
              {publicTrips.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">No public itineraries shared by the community yet.</p>
                </div>
              ) : (
                publicTrips.map((trip) => (
                  <div className="col-lg-4 col-md-6" key={trip.id}>
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                      <div 
                        className="ratio ratio-16x9 bg-light text-white d-flex align-items-end p-3" 
                        style={{ 
                          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1)), url(${trip.cover_photo || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="position-absolute bottom-0 start-0 p-3 w-100">
                          <h5 className="fw-bold mb-1 text-truncate text-white">{trip.name}</h5>
                          <span className="badge bg-secondary-subtle text-dark small d-inline-flex align-items-center gap-1">
                            By @{trip.user_username}
                          </span>
                        </div>
                      </div>
                      <div className="card-body d-flex flex-column justify-content-between p-4">
                        <div>
                          <p className="text-muted small text-truncate-2 mb-3">{trip.description || 'No description provided.'}</p>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted small">Stops:</span>
                            <span className="fw-bold small text-dark">{trip.stops?.length || 0} Cities</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small">Estimated Cost:</span>
                            <span className="fw-bold text-primary-blue">₹{(parseFloat(trip.total_cost) || 0).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                          <Link to={`/trips/shared/${trip.id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold">
                            View Itinerary
                          </Link>
                          {token && (
                            <button onClick={() => handleCopy(trip.id)} className="btn btn-sm btn-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-sm">
                              <FaCopy size={11} /> Copy Trip
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TripList;
