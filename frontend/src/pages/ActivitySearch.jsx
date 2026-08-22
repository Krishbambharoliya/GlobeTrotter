import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaStar, FaClock, FaDollarSign, FaPlus, FaCompass, FaCheck } from 'react-icons/fa';
import { activitySearchResults, placeSuggestions } from '../data/mockData';

const CATEGORIES = [
  { id: 'all', label: 'All Destinations' },
  { id: 'city', label: 'Cities' },
  { id: 'activity', label: 'Activities' },
  { id: 'sightseeing', label: 'Sightseeing' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'nature', label: 'Nature' },
  { id: 'water sports', label: 'Water Sports' },
  { id: 'culture', label: 'Culture & Heritage' },
];

const ActivitySearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filterType, setFilterType] = useState('all');
  const [selected, setSelected] = useState(activitySearchResults[0] || null);
  const [addedItems, setAddedItems] = useState({});

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  const filtered = activitySearchResults.filter((item) => {
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.city && item.city.toLowerCase().includes(q)) ||
      item.country.toLowerCase().includes(q);
    
    if (filterType === 'all') return matchesQuery;
    return matchesQuery && item.type.toLowerCase() === filterType;
  });

  const handleAddToTrip = (item) => {
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      navigate(`/trips/new?activity=${encodeURIComponent(item.name)}&city=${encodeURIComponent(item.city || item.name)}`);
    }, 400);
  };

  return (
    <div className="container py-4 activity-search-page" style={{ maxWidth: '1200px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2 text-dark-blue">
            <FaCompass className="text-primary-sage" /> Explore Destinations & Experiences
          </h2>
          <p className="text-muted small mb-0">Discover curated cities, landmark tours, and outdoor adventures</p>
        </div>
        <Link to="/trips/new" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-1">
          <FaPlus size={12} /> Plan New Trip
        </Link>
      </div>

      <div className="card border-0 rounded-4 p-3 mb-4 shadow-sm" style={{ background: '#ffffff' }}>
        <form onSubmit={handleSearch} className="row g-2 align-items-center">
          <div className="col-md-9">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0"><FaSearch className="text-muted" /></span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search cities, monuments, or activities (e.g. Manali, Dubai, Taj Mahal)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary w-100 rounded-3 fw-bold">Search Experiences</button>
          </div>
        </form>

        <div className="d-flex gap-2 mt-3 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold text-nowrap transition-all ${filterType === cat.id ? 'btn-primary shadow-sm' : 'btn-outline-secondary'}`}
              onClick={() => setFilterType(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-7">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted small fw-semibold">{filtered.length} experiences found</span>
            {filterType !== 'all' && (
              <button className="btn btn-link btn-sm text-decoration-none p-0" onClick={() => setFilterType('all')}>
                Clear Filters
              </button>
            )}
          </div>

          <div className="d-flex flex-column gap-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`search-result-card card border-0 rounded-4 p-0 text-start w-100 transition-all ${selected?.id === item.id ? 'border-2 border-primary shadow-md' : 'shadow-sm'}`}
                style={{ cursor: 'pointer', overflow: 'hidden', background: '#ffffff' }}
                onClick={() => setSelected(item)}
              >
                <div className="d-flex flex-column flex-sm-row">
                  <div className="search-result-thumb" style={{ backgroundImage: `url(${item.image})`, minWidth: '160px', height: '140px', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="p-3 flex-grow-1 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="badge bg-primary-subtle text-primary fw-bold mb-1">{item.type}</span>
                          <h6 className="fw-bold text-dark-blue mb-1">{item.name}</h6>
                          <span className="text-muted small d-flex align-items-center gap-1">
                            <FaMapMarkerAlt size={11} className="text-danger" />
                            {item.city ? `${item.city}, ${item.country}` : item.country}
                          </span>
                        </div>
                        <span className="d-flex align-items-center gap-1 text-warning small fw-bold bg-warning-subtle px-2 py-1 rounded-pill">
                          <FaStar size={11} /> {item.rating}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top">
                      <div className="d-flex gap-3 text-muted small fw-semibold">
                        {item.activities && <span>{item.activities} activities</span>}
                        {item.price !== undefined && (
                          <span className="text-success fw-bold">
                            {item.price === 0 ? 'Free' : `$${item.price}`}
                          </span>
                        )}
                        {item.duration && (
                          <span className="d-flex align-items-center gap-1">
                            <FaClock size={10} /> {item.duration}
                          </span>
                        )}
                      </div>

                      <button
                        className={`btn btn-xs rounded-pill px-3 py-1 fw-bold ${addedItems[item.id] ? 'btn-success' : 'btn-outline-primary'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToTrip(item);
                        }}
                      >
                        {addedItems[item.id] ? <><FaCheck size={10} /> Added</> : <><FaPlus size={10} /> Add to Trip</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 rounded-4 p-4 shadow-lg sticky-top" style={{ top: '90px', background: '#ffffff' }}>
            {selected ? (
              <>
                <div className="search-detail-img rounded-4 mb-3 position-relative overflow-hidden" style={{ backgroundImage: `url(${selected.image})`, height: '220px', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <span className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 text-white px-3 py-1.5 rounded-pill fw-bold">
                    <FaStar className="text-warning me-1" /> {selected.rating} / 5.0
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase">{selected.type}</span>
                  <span className="text-muted small fw-semibold">
                    <FaMapMarkerAlt className="text-danger me-1" /> {selected.city ? `${selected.city}, ${selected.country}` : selected.country}
                  </span>
                </div>

                <h4 className="fw-bold text-dark-blue mb-2">{selected.name}</h4>
                <p className="text-muted small mb-4" style={{ lineHeight: '1.6' }}>
                  {selected.type === 'City'
                    ? `Explore top landmarks, local cuisine, cultural heritage sites, and guided walking tours in ${selected.name}.`
                    : `Experience unforgettable ${selected.name} with certified local guides, flexible timing, and instant confirmation.`}
                </p>
                <div className="p-3 rounded-3 bg-body-tertiary border mb-4">
                  <div className="row g-2 text-center small">
                    <div className="col-6 border-end">
                      <span className="text-muted d-block">Price / Entry</span>
                      <strong className="text-success fs-6">
                        {selected.price !== undefined ? (selected.price === 0 ? 'Free' : `$${selected.price}`) : 'Varies'}
                      </strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">Duration</span>
                      <strong className="text-dark fs-6">{selected.duration || 'Flexible'}</strong>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary rounded-pill py-2.5 px-4 fw-bold w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  onClick={() => handleAddToTrip(selected)}
                >
                  <FaPlus size={13} /> Add To Trip Itinerary
                </button>
              </>
            ) : (
              <div className="text-center py-5 text-muted">
                <FaCompass size={40} className="mb-3 text-muted" />
                <p>Select a destination or activity to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySearch;
