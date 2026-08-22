import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';
import api from '../api';
import { regionalCards, mockTrips } from '../data/mockData';

const Landing = () => {
  const navigate = useNavigate();
  const [previousTrips, setPreviousTrips] = useState([]);
  const [firstName, setFirstName] = useState('Traveler');

  useEffect(() => {
    setFirstName(localStorage.getItem('first_name') || 'Traveler');
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await api.get('trips/');
      setPreviousTrips(res.data.slice(0, 4));
    } catch {
      setPreviousTrips(mockTrips.slice(0, 4));
    }
  };

  return (
    <div className="landing-page pb-5">
      {/* Hero Banner */}
      <section
        className="landing-hero mb-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(9, 13, 22, 0.55), rgba(9, 13, 22, 0.75)), url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80)',
        }}
      >
        <div className="container py-5">
          <div className="landing-hero-content animate-fade-in">
            <span className="badge rounded-pill mb-3 px-3 py-2" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
              Welcome back, {firstName}
            </span>
            <h1 className="display-5 fw-bold text-white mb-3">Plan your next unforgettable journey</h1>
            <p className="text-white-50 mb-4 lead" style={{ maxWidth: '560px' }}>
              Discover destinations, build day-by-day itineraries, track budgets, and share with the GlobeTrotter community.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary rounded-pill px-4 py-2 fw-bold" onClick={() => navigate('/trips/new')}>
                Start Planning
              </button>
              <button type="button" className="btn btn-outline-light rounded-pill px-4 py-2 fw-bold" onClick={() => navigate('/community')}>
                Explore Community
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Regional Cards Row */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Explore by Region</h4>
            <Link to="/search" className="small fw-semibold text-decoration-none" style={{ color: 'var(--primary-sage)' }}>
              View all <FaChevronRight size={10} />
            </Link>
          </div>
          <div className="row g-3 regional-cards-row">
            {regionalCards.map((region) => (
              <div className="col-6 col-md-4 col-lg" key={region.id}>
                <button
                  type="button"
                  className="regional-card w-100 border-0 p-0 text-start"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(region.name)}`)}
                >
                  <div
                    className="regional-card-img"
                    style={{ backgroundImage: `url(${region.image})` }}
                  />
                  <div className="regional-card-body">
                    <h6 className="fw-bold mb-0">{region.name}</h6>
                    <small className="text-muted">{region.trips} trips</small>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Previous Trips Section */}
        <section>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Your Trips</h4>
            <Link to="/trips" className="small fw-semibold text-decoration-none" style={{ color: 'var(--primary-sage)' }}>
              See all trips <FaChevronRight size={10} />
            </Link>
          </div>

          {previousTrips.length === 0 ? (
            <div className="card border-0 rounded-4 p-5 text-center dash-card">
              <p className="text-muted mb-3">No trips yet. Start your first adventure!</p>
              <button type="button" className="btn btn-primary rounded-pill px-4 fw-bold" onClick={() => navigate('/trips/new')}>
                Plan a Trip
              </button>
            </div>
          ) : (
            <div className="row g-3">
              {previousTrips.map((trip) => (
                <div className="col-md-6 col-lg-3" key={trip.id}>
                  <Link to={`/trips/${trip.id}`} className="text-decoration-none">
                    <div className="card border-0 rounded-4 overflow-hidden h-100 landing-trip-card hover-up">
                      <div
                        className="landing-trip-img"
                        style={{
                          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7), transparent), url(${trip.cover_photo || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'})`,
                        }}
                      />
                      <div className="card-body p-3">
                        <h6 className="fw-bold mb-1 text-truncate">{trip.name}</h6>
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <FaCalendarAlt size={11} />
                          <span>{trip.start_date}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-muted small mt-1">
                          <FaMapMarkerAlt size={11} />
                          <span>{trip.stops?.[0]?.city_name || 'Multi-city'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Landing;
