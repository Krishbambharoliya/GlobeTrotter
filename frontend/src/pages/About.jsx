import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="container py-5 text-center" style={{ maxWidth: '800px' }}>
      <h2 className="fw-bold text-dark-blue mb-4">About GlobeTrotter</h2>
      <p className="text-muted fs-5 mb-4">
        This is a premium pair-programmed web application developed to showcase highly responsive travel listings, interactive seat-mappers, and AI-enabled travel itinerary calculations.
      </p>

      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-start">
        <h5 className="fw-bold mb-3">Key Built-in Milestones</h5>
        <ul>
          <li><strong>JWT Auth & Profiles:</strong> Access tokens paired with custom member tiers (Black VIP status) and mock MFA OTP verification routes.</li>
          <li><strong>Advanced Travel Engines:</strong> Live price updates across flights, hotels, buses, packages, and car rentals.</li>
          <li><strong>Responsive Booking Add-ons:</strong> Select aircraft seat matrices or bus layouts visually.</li>
          <li><strong>Real-time Analytics Dashboard:</strong> Revenue distributions, user counts, and CRUD control modules.</li>
          <li><strong>Contextual AI chatbot:</strong> Rule-based chat advisors and budget analyzers.</li>
        </ul>
      </div>

      <Link to="/" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
        Return Home
      </Link>
    </div>
  );
};

export default About;
