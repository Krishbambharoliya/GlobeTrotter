import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGlobe, FaTrain, FaPlane, FaHotel, FaCar, FaSuitcase, FaUserCheck, FaChevronRight } from 'react-icons/fa';

const About = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="about-page container py-5" style={{ maxWidth: '960px' }}>
      {/* Header Banner */}
      <div className="text-center mb-5">
        <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2 fw-bold text-uppercase mb-3" style={{ letterSpacing: '1px' }}>
          Welcome to GlobeTrotter
        </span>
        <h1 className="fw-bold display-5 text-dark-blue mb-3">Redefining How You Travel</h1>
        <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '720px', lineHeight: '1.7' }}>
          GlobeTrotter is your all-in-one luxury travel platform designed to make discovering, booking, and planning journeys effortless across India and destinations worldwide.
        </p>
      </div>

      {/* Mission Card */}
      <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 mb-5 bg-gradient text-white position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1f352b 0%, #2d4a3e 100%)' }}>
        <div className="row align-items-center">
          <div className="col-md-8">
            <h3 className="fw-bold mb-3 text-white">Our Vision & Mission</h3>
            <p className="mb-0 text-white-50 fs-6" style={{ lineHeight: '1.8' }}>
              We believe that every journey should be as memorable as the destination. Whether you're searching for live Indian Railway train schedules across 7,000+ stations, booking top-rated luxury hotels, securing flight tickets, or creating custom day-by-day itineraries, GlobeTrotter brings all your travel needs into one seamless experience.
            </p>
          </div>
          <div className="col-md-4 text-center mt-4 mt-md-0">
            <FaGlobe size={90} className="text-white-50 opacity-50" />
          </div>
        </div>
      </div>

      {/* Core Platform Pillars */}
      <h3 className="fw-bold text-dark-blue text-center mb-4">What Makes GlobeTrotter Special</h3>
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-elevation transition-all">
            <div className="d-flex align-items-center justify-content-center rounded-3 mb-3 bg-success-subtle text-success" style={{ width: '50px', height: '50px' }}>
              <FaTrain size={24} />
            </div>
            <h5 className="fw-bold text-dark-blue mb-2">7,000+ Indian Stations</h5>
            <p className="text-muted small mb-0">
              Live autocomplete searching across all Indian Railway junctions, district stations, and live platform status updates.
            </p>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-elevation transition-all">
            <div className="d-flex align-items-center justify-content-center rounded-3 mb-3 bg-primary-subtle text-primary" style={{ width: '50px', height: '50px' }}>
              <FaPlane size={24} />
            </div>
            <h5 className="fw-bold text-dark-blue mb-2">Flights & Stays</h5>
            <p className="text-muted small mb-0">
              Instant searching and booking across major domestic and international airlines, boutique hotels, and luxury resorts.
            </p>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-elevation transition-all">
            <div className="d-flex align-items-center justify-content-center rounded-3 mb-3 bg-warning-subtle text-warning" style={{ width: '50px', height: '50px' }}>
              <FaSuitcase size={24} />
            </div>
            <h5 className="fw-bold text-dark-blue mb-2">AI Itinerary Builder</h5>
            <p className="text-muted small mb-0">
              Build day-by-day travel schedules, track expense budgets with visual bar charts, and share your trips with friends.
            </p>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-elevation transition-all">
            <div className="d-flex align-items-center justify-content-center rounded-3 mb-3 bg-danger-subtle text-danger" style={{ width: '50px', height: '50px' }}>
              <FaCar size={24} />
            </div>
            <h5 className="fw-bold text-dark-blue mb-2">Buses & Car Rentals</h5>
            <p className="text-muted small mb-0">
              Reserve self-drive SUVs, chauffeur-driven cars, and AC intercity sleeper buses with seat layout selection.
            </p>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-elevation transition-all">
            <div className="d-flex align-items-center justify-content-center rounded-3 mb-3 bg-info-subtle text-info" style={{ width: '50px', height: '50px' }}>
              <FaGlobe size={24} />
            </div>
            <h5 className="fw-bold text-dark-blue mb-2">100+ Languages</h5>
            <p className="text-muted small mb-0">
              Real-time Google Translate multi-language engine supporting Hindi, Gujarati, English, Marathi, Tamil, and 100+ tongues.
            </p>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-elevation transition-all">
            <div className="d-flex align-items-center justify-content-center rounded-3 mb-3 bg-secondary-subtle text-secondary" style={{ width: '50px', height: '50px' }}>
              <FaUserCheck size={24} />
            </div>
            <h5 className="fw-bold text-dark-blue mb-2">VIP Member Tiers</h5>
            <p className="text-muted small mb-0">
              Unlock exclusive rewards, Black VIP status discounts, and priority concierge customer support.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action Footer */}
      <div className="text-center pt-3">
        <Link to="/" className="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-lg d-inline-flex align-items-center gap-2">
          Start Exploring Now <FaChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default About;
