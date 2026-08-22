import React, { useState, useEffect } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaHeadphones, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import api from '../api';

const Contact = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Support Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    try {
      await api.post('support/contact/', { name, email, subject, message });
      setFormSuccess('Thank you! Your message has been sent to our customer care team.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="container py-5 text-start animate-fade-in">
      {/* Header */}
      <div className="text-center mb-5 mt-3">
        <h2 className="fw-bold text-dark-blue mb-2" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '2.5rem', letterSpacing: '-0.5px' }}>
          Support Hub
        </h2>
        <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '600px' }}>
          Get in touch with our customer service team or search through frequently asked questions. We are here to help you 24/7.
        </p>
      </div>

      <div className="row g-4 mb-5">
        {/* Left Column: Premium Contact details */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white" style={{ transition: 'all 0.3s ease' }}>
            <h5 className="fw-bold mb-4 text-dark-blue d-flex align-items-center gap-2">
              <FaHeadphones size={22} className="text-primary" style={{ color: 'var(--primary-sage)' }} /> Contact Information
            </h5>

            <div className="d-flex flex-column gap-4">
              <div className="d-flex align-items-start gap-3 p-3 rounded-4 hover-shadow" style={{ background: '#fdfbf7', border: '1px solid #f2edd5', transition: 'all 0.3s ease' }}>
                <div className="d-flex align-items-center justify-content-center bg-white text-primary border rounded-circle shadow-sm" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                  <FaPhoneAlt size={18} style={{ color: 'var(--primary-sage)' }} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark-blue" style={{ fontSize: '15px' }}>Call Us</h6>
                  <p className="text-muted small mb-1 fw-medium">+1-800-PFT-CARE (Toll Free)</p>
                  <p className="text-muted small mb-0">+91-124-4628747 (International)</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 rounded-4 hover-shadow" style={{ background: '#fdfbf7', border: '1px solid #f2edd5', transition: 'all 0.3s ease' }}>
                <div className="d-flex align-items-center justify-content-center bg-white text-primary border rounded-circle shadow-sm" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                  <FaEnvelope size={18} style={{ color: 'var(--primary-sage)' }} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark-blue" style={{ fontSize: '15px' }}>Email Support</h6>
                  <p className="text-muted small mb-1 fw-medium">support@globetrotter.com</p>
                  <p className="text-muted small mb-0">corporate@globetrotter.com</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 rounded-4 hover-shadow" style={{ background: '#fdfbf7', border: '1px solid #f2edd5', transition: 'all 0.3s ease' }}>
                <div className="d-flex align-items-center justify-content-center bg-white text-primary border rounded-circle shadow-sm" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                  <FaMapMarkerAlt size={18} style={{ color: 'var(--primary-sage)' }} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark-blue" style={{ fontSize: '15px' }}>Corporate Office</h6>
                  <p className="text-muted small mb-1 fw-medium">GlobeTrotter Travel Systems Pvt. Ltd.</p>
                  <p className="text-muted small mb-0">DLF Cyber City, Phase III, Gurgaon, Haryana, India</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 rounded-4 hover-shadow" style={{ background: '#fdfbf7', border: '1px solid #f2edd5', transition: 'all 0.3s ease' }}>
                <div className="d-flex align-items-center justify-content-center bg-white text-primary border rounded-circle shadow-sm" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                  <FaClock size={18} style={{ color: 'var(--primary-sage)' }} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark-blue" style={{ fontSize: '15px' }}>Business Hours</h6>
                  <p className="text-muted small mb-1 fw-medium">Support Desk: 24/7 Available</p>
                  <p className="text-muted small mb-0">Office: Monday - Friday (9 AM - 6 PM)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Send Message form */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white" style={{ transition: 'all 0.3s ease' }}>
            <h5 className="fw-bold mb-4 text-dark-blue d-flex align-items-center gap-2">
              <FaPaperPlane size={20} className="text-primary" style={{ color: 'var(--primary-sage)' }} /> Send Us a Message
            </h5>

            {formSuccess && (
              <div className="alert alert-success border-0 rounded-3 py-3 px-4 mb-4 d-flex align-items-center gap-2 shadow-sm animate-fade-in" style={{ backgroundColor: '#eefcf5', color: '#1b6b45' }}>
                <FaCheckCircle size={20} style={{ color: '#1b6b45' }} />
                <span className="small fw-semibold">{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Your Name</label>
                  <input type="text" className="form-control rounded-3 px-3 py-2.5" placeholder="Enter name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Email Address</label>
                  <input type="email" className="form-control rounded-3 px-3 py-2.5" placeholder="Enter email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Subject</label>
                <input type="text" className="form-control rounded-3 px-3 py-2.5" placeholder="Subject of query" required value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">Message</label>
                <textarea className="form-control rounded-3 px-3 py-2.5" rows="4" placeholder="Write your detailed message here..." required value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn btn-primary rounded-pill px-4 py-2.5 fw-bold d-flex align-items-center gap-2 shadow" style={{ background: 'var(--primary-sage)', border: 'none' }}>
                <FaPaperPlane size={14} /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
