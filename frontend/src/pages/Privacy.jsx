import React from 'react';

const Privacy = () => {
  return (
    <div className="container py-5 text-start" style={{ maxWidth: '800px' }}>
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
        <h2 className="fw-bold text-dark-blue mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Privacy Policy</h2>
        <p className="text-muted small mb-4">Last updated: July 5, 2026</p>
        
        <hr className="mb-4" style={{ borderColor: 'var(--border-color)' }} />
        
        <div className="privacy-content text-muted" style={{ fontSize: '15px', lineHeight: '1.7' }}>
          <section className="mb-4">
            <h5 className="fw-bold text-dark-blue mb-2" style={{ fontSize: '18px' }}>1. Information We Collect</h5>
            <p>
              We collect personal details that you provide voluntarily, including your name, email address, phone number, city, and passport details. We also collect transactional and payment history details for bookings.
            </p>
          </section>

          <section className="mb-4">
            <h5 className="fw-bold text-dark-blue mb-2" style={{ fontSize: '18px' }}>2. How We Use Your Information</h5>
            <p>
              Your information is used primarily to process, verify, and confirm bookings with airlines, hotels, transport providers, and vehicle operators. We also use your contact details to send tickets, travel alerts, and promotional offers.
            </p>
          </section>

          <section className="mb-4">
            <h5 className="fw-bold text-dark-blue mb-2" style={{ fontSize: '18px' }}>3. Data Sharing and Third Parties</h5>
            <p>
              We share relevant details with third-party service providers (such as Indigo, Taj Hotels, or Indian Railways) to secure your reservations. We do not sell or lease your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-4">
            <h5 className="fw-bold text-dark-blue mb-2" style={{ fontSize: '18px' }}>4. Data Security</h5>
            <p>
              We employ strict technical and administrative security controls (including industry-standard SSL encryption and secure database tokens) to prevent unauthorized access, loss, or leakage of your travel profile information.
            </p>
          </section>

          <section className="mb-0">
            <h5 className="fw-bold text-dark-blue mb-2" style={{ fontSize: '18px' }}>5. Your Privacy Rights</h5>
            <p>
              You can access, modify, or update your personal information at any time from your User Dashboard. If you wish to delete your account or request data portability, please contact our support team at support@globetrotter.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
