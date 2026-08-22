import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { FaChevronLeft, FaTrash, FaPlus, FaPlusCircle, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaSearch, FaDollarSign } from 'react-icons/fa';

const ItineraryBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [preSeededDestinations, setPreSeededDestinations] = useState([]);
  
  // Searching destinations state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTripDetails();
    fetchDestinations();
  }, [id]);

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`trips/${id}/`);
      setTrip(res.data);
      setStops(res.data.stops || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load trip details. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const res = await api.get('destinations/');
      setPreSeededDestinations(res.data);
    } catch (err) {
      console.error('Error fetching destinations:', err);
    }
  };

  // Search logic for destinations
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = preSeededDestinations.filter(d => 
      d.city_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.country_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery, preSeededDestinations]);

  // Total cost calculation
  const calculateTotalCost = () => {
    let total = 0;
    stops.forEach(stop => {
      stop.activities?.forEach(act => {
        total += parseFloat(act.cost) || 0;
      });
    });
    return total;
  };

  const totalCost = calculateTotalCost();
  const budgetLimit = trip ? parseFloat(trip.budget_limit) || 0 : 0;
  const isOverBudget = budgetLimit > 0 && totalCost > budgetLimit;

  // Add stop function
  const handleAddStop = (dest) => {
    const newStop = {
      city_name: dest.city_name,
      country_name: dest.country_name,
      cost_index: dest.cost_index || '$$',
      popularity: dest.popularity || 'High',
      date: trip ? trip.start_date : new Date().toISOString().split('T')[0],
      order: stops.length,
      activities: dest.activities ? dest.activities.map((a, i) => ({
        name: a.name,
        category: a.category,
        cost: a.cost,
        duration_hours: a.duration_hours,
        start_time: '09:00 AM',
        order: i
      })) : []
    };
    setStops([...stops, newStop]);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleAddCustomStop = () => {
    if (!searchQuery.trim()) return;
    const newStop = {
      city_name: searchQuery,
      country_name: 'Custom',
      cost_index: '$$',
      popularity: 'Medium',
      date: trip ? trip.start_date : new Date().toISOString().split('T')[0],
      order: stops.length,
      activities: []
    };
    setStops([...stops, newStop]);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleRemoveStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const moveStop = (index, direction) => {
    const newStops = [...stops];
    if (direction === 'up' && index > 0) {
      const temp = newStops[index];
      newStops[index] = newStops[index - 1];
      newStops[index - 1] = temp;
    } else if (direction === 'down' && index < newStops.length - 1) {
      const temp = newStops[index];
      newStops[index] = newStops[index + 1];
      newStops[index + 1] = temp;
    }
    // Update order values
    const ordered = newStops.map((stop, idx) => ({ ...stop, order: idx }));
    setStops(ordered);
  };

  // Stop Details editing
  const handleStopFieldChange = (index, field, value) => {
    const updated = [...stops];
    updated[index][field] = value;
    setStops(updated);
  };

  // Activity actions
  const handleAddActivity = (stopIndex) => {
    const updated = [...stops];
    if (!updated[stopIndex].activities) {
      updated[stopIndex].activities = [];
    }
    const newAct = {
      name: 'New Activity',
      category: 'Sightseeing',
      cost: 0.00,
      duration_hours: 1.0,
      start_time: '10:00 AM',
      order: updated[stopIndex].activities.length
    };
    updated[stopIndex].activities.push(newAct);
    setStops(updated);
  };

  const handleActivityFieldChange = (stopIndex, actIndex, field, value) => {
    const updated = [...stops];
    updated[stopIndex].activities[actIndex][field] = value;
    setStops(updated);
  };

  const handleRemoveActivity = (stopIndex, actIndex) => {
    const updated = [...stops];
    updated[stopIndex].activities = updated[stopIndex].activities.filter((_, i) => i !== actIndex);
    setStops(updated);
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`trips/${id}/`, {
        stops: stops
      });
      alert('Itinerary saved successfully!');
      navigate(`/trips/${id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to save itinerary changes.');
    } finally {
      setSaving(false);
    }
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

  if (error) {
    return <div className="alert alert-danger m-5">{error}</div>;
  }

  return (
    <div className="container py-5" style={{ maxWidth: '1000px' }}>
      <div className="mb-4">
        <Link to="/trips" className="text-decoration-none d-flex align-items-center gap-1 text-muted fw-medium small">
          <FaChevronLeft size={12} /> Back to Trips
        </Link>
      </div>

      {trip && (
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold text-dark-blue mb-1">Builder: {trip.name}</h2>
            <p className="text-muted mb-0">{trip.start_date} to {trip.end_date} | Budget: ${budgetLimit.toFixed(2)}</p>
          </div>
          <button 
            onClick={handleSaveChanges} 
            className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Itinerary'}
          </button>
        </div>
      )}

      {/* Budget Warning Banner */}
      {isOverBudget && (
        <div className="alert alert-danger d-flex align-items-center gap-3 rounded-4 shadow-sm mb-4">
          <FaExclamationTriangle size={24} className="text-danger animate-pulse" />
          <div>
            <h6 className="fw-bold mb-0">Budget Alert: Over budget!</h6>
            <p className="mb-0 small text-muted">Your current itinerary totals <strong>${totalCost.toFixed(2)}</strong>, exceeding your set limit of <strong>${budgetLimit.toFixed(2)}</strong>.</p>
          </div>
        </div>
      )}

      {/* Destination Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white position-relative">
        <h5 className="fw-bold mb-3 text-dark-blue">Add City / Stop to Itinerary</h5>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
          <input
            type="text"
            className="form-control bg-light border-start-0"
            placeholder="Search popular cities (e.g. Paris, Tokyo, London, Goa...)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
        </div>

        {showResults && searchQuery.trim() && (
          <div className="list-group position-absolute w-100 start-0 mt-1 shadow-lg rounded-4 overflow-hidden" style={{ zIndex: 10, top: '100%', padding: '0 24px' }}>
            <div className="bg-white border rounded-4 overflow-hidden">
              {searchResults.length > 0 ? (
                searchResults.map((dest, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddStop(dest)}
                    className="list-group-item list-group-item-action border-0 px-4 py-3 d-flex justify-content-between align-items-center hover-bg-light"
                  >
                    <div>
                      <h6 className="fw-bold mb-0 text-dark-blue">{dest.city_name}, {dest.country_name}</h6>
                      <span className="text-muted small">Popularity: {dest.popularity} | Cost index: {dest.cost_index}</span>
                    </div>
                    <span className="badge bg-primary rounded-pill px-2 py-1 small">Add Stop + Seeded Activities</span>
                  </button>
                ))
              ) : (
                <button
                  onClick={handleAddCustomStop}
                  className="list-group-item list-group-item-action border-0 px-4 py-3 text-primary fw-bold hover-bg-light text-start"
                >
                  Add Custom City "{searchQuery}" +
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Itinerary Stops List */}
      <div className="d-flex flex-column gap-4">
        {stops.length === 0 ? (
          <div className="text-center py-5 text-muted card border-0 rounded-4 shadow-sm bg-white p-4">
            No stops added yet. Search and add a destination above to start building your day-by-day planner.
          </div>
        ) : (
          stops.map((stop, stopIndex) => (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-4" key={stopIndex}>
              
              {/* Stop Header */}
              <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 flex-wrap gap-2">
                <div>
                  <h4 className="fw-bold text-dark-blue mb-1">
                    Stop #{stopIndex + 1}: {stop.city_name}, {stop.country_name}
                  </h4>
                  <div className="d-flex align-items-center gap-3 flex-wrap mt-1">
                    <span className="text-muted small">Cost index: <strong>{stop.cost_index}</strong> | Popularity: <strong>{stop.popularity}</strong></span>
                    <div className="d-flex align-items-center gap-1.5">
                      <span className="text-muted small">Date:</span>
                      <input
                        type="date"
                        className="form-control form-control-sm bg-light py-0.5"
                        style={{ width: '135px', display: 'inline-block' }}
                        value={stop.date}
                        onChange={(e) => handleStopFieldChange(stopIndex, 'date', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-1.5">
                  <button 
                    disabled={stopIndex === 0} 
                    onClick={() => moveStop(stopIndex, 'up')} 
                    className="btn btn-sm btn-outline-secondary rounded-circle"
                  >
                    <FaArrowUp size={11} />
                  </button>
                  <button 
                    disabled={stopIndex === stops.length - 1} 
                    onClick={() => moveStop(stopIndex, 'down')} 
                    className="btn btn-sm btn-outline-secondary rounded-circle"
                  >
                    <FaArrowDown size={11} />
                  </button>
                  <button 
                    onClick={() => handleRemoveStop(stopIndex)} 
                    className="btn btn-sm btn-outline-danger rounded-circle"
                  >
                    <FaTrash size={11} />
                  </button>
                </div>
              </div>

              {/* Stop Activities */}
              <div>
                <h6 className="fw-bold text-muted small uppercase mb-2">Activities & Budget Items</h6>
                
                {stop.activities?.map((act, actIndex) => (
                  <div className="row g-2 mb-3 align-items-center border-bottom pb-2" key={actIndex}>
                    {/* Name */}
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control form-control-sm bg-light"
                        placeholder="Activity name"
                        value={act.name}
                        onChange={(e) => handleActivityFieldChange(stopIndex, actIndex, 'name', e.target.value)}
                      />
                    </div>
                    {/* Category */}
                    <div className="col-md-2 col-4">
                      <select
                        className="form-select form-select-sm bg-light"
                        value={act.category}
                        onChange={(e) => handleActivityFieldChange(stopIndex, actIndex, 'category', e.target.value)}
                      >
                        <option value="Sightseeing">Sightseeing</option>
                        <option value="Lodging">Lodging</option>
                        <option value="Transport">Transport</option>
                        <option value="Meals">Meals</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Food">Food</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                    {/* Cost */}
                    <div className="col-md-2 col-4">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light"><FaDollarSign size={10} /></span>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control bg-light"
                          placeholder="Cost"
                          value={act.cost}
                          onChange={(e) => handleActivityFieldChange(stopIndex, actIndex, 'cost', e.target.value)}
                        />
                      </div>
                    </div>
                    {/* Duration / Start Time */}
                    <div className="col-md-2 col-3">
                      <input
                        type="text"
                        className="form-control form-control-sm bg-light"
                        placeholder="Time (09:00 AM)"
                        value={act.start_time}
                        onChange={(e) => handleActivityFieldChange(stopIndex, actIndex, 'start_time', e.target.value)}
                      />
                    </div>
                    {/* Delete Action */}
                    <div className="col-md-2 col-1 text-end">
                      <button 
                        onClick={() => handleRemoveActivity(stopIndex, actIndex)} 
                        className="btn btn-sm btn-light text-danger rounded-circle"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => handleAddActivity(stopIndex)} 
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold mt-2 d-flex align-items-center gap-1.5"
                >
                  <FaPlusCircle size={13} /> Add Activity
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ItineraryBuilder;
