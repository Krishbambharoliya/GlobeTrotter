import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGlobeAmericas, FaPlane, FaUsers, FaShieldAlt } from 'react-icons/fa';

const About = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="container py-5 text-center" style={{ maxWidth: '900px' }}>
      <h2 className="fw-bold text-dark-blue mb-3">About Globe Trotter</h2>
      <p className="text-muted fs-5 mb-5" style={{ lineHeight: '1.7' }}>
        Globe Trotter is your ultimate all-in-one travel ecosystem designed to make trip planning effortless, smart, and memorable. Whether you're exploring domestic retreats or international destinations, Globe Trotter brings flights, hotels, trains, buses, car rentals, and curated tour packages together in one seamless platform.
      </p>

      <div className="row g-4 mb-5 text-start">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 text-primary d-flex align-items-center justify-content-center">
                <FaGlobeAmericas size={24} />
              </div>
              <h5 className="fw-bold text-dark-blue mb-0">End-to-End Itinerary Builder</h5>
            </div>
            <p className="text-muted small mb-0">
              Build personalized day-by-day itineraries with integrated cost estimators, activity schedules, and budget tracking so you never overspend on vacation.
            </p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 text-success d-flex align-items-center justify-content-center">
                <FaPlane size={24} />
              </div>
              <h5 className="fw-bold text-dark-blue mb-0">Multi-Modal Booking Engines</h5>
            </div>
            <p className="text-muted small mb-0">
              Search and reserve flights, luxury hotels, train tickets, sleeper buses, and self-drive car rentals with real-time seat mapping and instant confirmations.
            </p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle bg-danger bg-opacity-10 p-3 text-danger d-flex align-items-center justify-content-center">
                <FaUsers size={24} />
              </div>
              <h5 className="fw-bold text-dark-blue mb-0">Vibrant Traveler Community</h5>
            </div>
            <p className="text-muted small mb-0">
              Connect with thousands of fellow travelers in the Globe Trotter Community tab to share reviews, discover hidden gems, and copy public itineraries with a single click.
            </p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 text-warning d-flex align-items-center justify-content-center">
                <FaShieldAlt size={24} />
              </div>
              <h5 className="fw-bold text-dark-blue mb-0">Secure Wallet & VIP Loyalty</h5>
            </div>
            <p className="text-muted small mb-0">
              Enjoy instant refunds, encrypted payments, digital wallet top-ups, and exclusive member tier benefits including Black VIP status rewards.
            </p>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-3">
        <Link to="/" className="btn btn-primary rounded-pill px-4 py-2.5 fw-bold shadow-sm">
          Explore Globe Trotter
        </Link>
        <Link to="/community" className="btn btn-outline-primary rounded-pill px-4 py-2.5 fw-bold">
          Join Community
        </Link>
      </div>
    </div>
  );
};

export default About;
