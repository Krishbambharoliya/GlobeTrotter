import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { FaChevronLeft, FaCalendarAlt, FaDollarSign, FaCopy, FaShareAlt, FaGlobe, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ItineraryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [collapsedStops, setCollapsedStops] = useState({});

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`trips/${id}/`);
      setTrip(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load itinerary. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareToggle = async () => {
    try {
      const res = await api.patch(`trips/${id}/`, { is_public: !trip.is_public });
      setTrip(res.data);
    } catch (err) {
      alert('Failed to update share setting.');
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/trips/shared/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
    return <div className="alert alert-danger m-5">{error || 'Trip not found.'}</div>;
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
  let totalDuration = 0;

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
      totalDuration += parseFloat(act.duration_hours) || 0;
    });
  });

  const budgetLimit = parseFloat(trip.budget_limit) || 0;
  const isOverBudget = budgetLimit > 0 && totalCost > budgetLimit;

  // Calendar events generator for calendar view display
  const totalDays = trip.stops ? trip.stops.length : 0;

  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'calendar'

  return (
    <div className="container py-5" style={{ maxWidth: '1000px' }}>
      
      {/* Back and Edit buttons */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/trips" className="text-decoration-none d-flex align-items-center gap-1 text-muted fw-medium small">
          <FaChevronLeft size={12} /> Back to My Trips
        </Link>
        <Link to={`/trips/${id}/edit`} className="btn btn-outline-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-1.5 btn-sm">
          <FaEdit /> Edit Planner
        </Link>
      </div>

      {/* Hero Header */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <div 
          style={{ 
            height: '250px',
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

        {/* Action Panel: Sharing */}
        <div className="card-body bg-light border-top d-flex justify-content-between align-items-center flex-wrap gap-2.5 p-3">
          <div className="d-flex align-items-center gap-2">
            <button 
              onClick={handleShareToggle}
              className={`btn btn-sm rounded-pill px-3.5 fw-bold d-flex align-items-center gap-1.5 ${trip.is_public ? 'btn-success' : 'btn-outline-secondary'}`}
            >
              <FaGlobe size={12} /> {trip.is_public ? 'Public Sharing On' : 'Make Public'}
            </button>
            {trip.is_public && (
              <button 
                onClick={copyShareLink} 
                className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
              >
                <FaCopy size={11} /> {copiedLink ? 'Copied!' : 'Copy Share Link'}
              </button>
            )}
          </div>
          {trip.is_public && (
            <span className="text-muted small">Anyone with the link can view your itinerary.</span>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Left Side: Day Timeline or Calendar Grid */}
        <div className="col-lg-7">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold text-dark-blue mb-0">Itinerary Flow</h4>
            <div className="btn-group btn-group-sm rounded-pill p-1 bg-light border">
              <button 
                onClick={() => setViewMode('timeline')}
                className={`btn btn-sm rounded-pill fw-bold ${viewMode === 'timeline' ? 'btn-primary shadow-sm' : 'btn-light border-0 text-muted'}`}
              >
                Timeline View
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`btn btn-sm rounded-pill fw-bold ${viewMode === 'calendar' ? 'btn-primary shadow-sm' : 'btn-light border-0 text-muted'}`}
              >
                Calendar View
              </button>
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
              <h6 className="fw-bold text-dark-blue mb-3">Calendar Grid View ({trip.start_date})</h6>
              <div className="row g-2 text-center font-monospace mb-2 fw-bold text-muted small">
                <div className="col">Sun</div><div className="col">Mon</div><div className="col">Tue</div><div className="col">Wed</div><div className="col">Thu</div><div className="col">Fri</div><div className="col">Sat</div>
              </div>
              <div className="d-flex flex-column gap-3 mt-3">
                {trip.stops?.map((stop, sIdx) => (
                  <div className="p-3 border rounded-3 bg-light text-start" key={sIdx}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="badge bg-primary rounded-pill">Day {sIdx + 1} - {stop.date}</span>
                      <strong className="text-dark-blue">{stop.city_name}</strong>
                    </div>
                    {stop.activities?.map((act, aIdx) => (
                      <div className="small text-muted border-top pt-1 mt-1 d-flex justify-content-between" key={aIdx}>
                        <span>• {act.name} ({act.start_time})</span>
                        <span className="fw-semibold text-dark">${(parseFloat(act.cost) || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3.5 position-relative">
            {trip.stops?.length === 0 ? (
              <div className="bg-white p-4 rounded-4 shadow-sm border text-muted">
                No stops added yet. Edit this trip to add stops and activities.
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
          )}
        </div>

        {/* Right Side: Cost Breakdown & Budget */}
        <div className="col-lg-5">
          <h4 className="fw-bold text-dark-blue mb-3">Trip Budget & Cost Analysis</h4>
          
          <div className="d-flex flex-column gap-4">
            
            {/* Summary Metrics */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
              <div className="row g-3 text-center">
                <div className="col-6 border-end">
                  <span className="text-muted small block">Total Cost</span>
                  <h3 className="fw-bold text-primary-blue mt-1 mb-0">${totalCost.toFixed(2)}</h3>
                </div>
                <div className="col-6">
                  <span className="text-muted small block">Average / Stop</span>
                  <h3 className="fw-bold text-dark-blue mt-1 mb-0">
                    ${(totalDays > 0 ? totalCost / totalDays : 0).toFixed(0)}
                  </h3>
                </div>
              </div>
            </div>

            {/* Budget status progress */}
            {budgetLimit > 0 && (
              <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                <h6 className="fw-bold text-dark-blue mb-2.5">Budget Allocation</h6>
                <div className="d-flex justify-content-between align-items-center mb-1.5">
                  <span className="text-muted small">Target Budget: ${budgetLimit.toFixed(2)}</span>
                  <span className={`fw-bold small ${isOverBudget ? 'text-danger' : 'text-success'}`}>
                    {Math.round((totalCost / budgetLimit) * 100)}%
                  </span>
                </div>
                <div className="progress mb-2.5" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${isOverBudget ? 'bg-danger' : 'bg-success'}`}
                    role="progressbar" 
                    style={{ width: `${Math.min(100, Math.round((totalCost / budgetLimit) * 100))}%` }}
                  ></div>
                </div>
                {isOverBudget ? (
                  <div className="d-flex align-items-center gap-1.5 text-danger small">
                    <span className="small">⚠️ Warning: You are over budget by ${(totalCost - budgetLimit).toFixed(2)}!</span>
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-1.5 text-success small">
                    <span className="small">Within budget! You have ${(budgetLimit - totalCost).toFixed(2)} remaining.</span>
                  </div>
                )}
              </div>
            )}

            {/* Category Cost List (Progress representation) */}
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
                {totalCost === 0 && (
                  <span className="text-muted small text-center">Add activities with costs to display breakdown.</span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;
