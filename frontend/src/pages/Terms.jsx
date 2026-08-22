import React from 'react';

const Terms = () => {
  return (
    <div className="container py-5 text-start" style={{ maxWidth: '800px' }}>
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
        <h2 className="fw-bold text-dark-blue mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Terms & Conditions</h2>
        <p className="text-muted small mb-4">Last updated: July 5, 2026</p>
        
        <hr className="mb-4" style={{ borderColor: 'var(--border-color)' }} />
        
        <div className="terms-content text-muted" style={{ fontSize: '15px', lineHeight: '1.7' }}>
          <section className="mb-4">
            <h5 className="fw-bold text-dark-blue mb-2" style={{ fontSize: '18px' }}>1. Agreement to Terms</h5>
            <p>
              Welcome to GlobeTrotter. By accessing or using our website, mobile application, or services, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please refrain from using our services.
            </p>
          </section>

          <section className="mb-4">
            <h5 className="fw-bold text-dark-blue mb-2" style={{ fontSize: '18px' }}>2. Use of Services</h5>
            <p>
              You must be at least 18 years of age to book travel services on our website. You are responsible for ensuring that all details provided (such as passenger names, contact numbers, and payment details) are accurate.
            </p>
          </section>

          <section className="mb-4">
            <h5 className="fw-bold text-dark-blue mb-2" style={{ fontSize: '18px' }}>3. Booking & Payment Policies</h5>
            <p>
              All bookings made through GlobeTrotter are subject to availability. Prices quoted are subject to change before confirmation. Payments must be settled in full to secure tickets or hotel reservations. Any additional charges imposed by vendors/operators are the sole responsibility of the customer.
            </p>
          </section>

          <section className="mb-4">
            <h5 className="fw-bold text-dark-blue mb-2" style={{ fontSize: '18px' }}>4. Cancellation & Refund Policy</h5>
            <p>
              Cancellations and modifications are governed by the respective rules of airline operators, hotels, rail authorities, and vehicle rental companies. GlobeTrotter reserves the right to charge standard processing fees for facilitating any cancellations or refunds.
            </p>
          </section>

          <section className="mb-4">
            <h5 className="fw-bold text-dark-blue mb-2" style={{ fontSize: '18px' }}>5. Limitation of Liability</h5>
            <p>
              GlobeTrotter acts as an intermediary agent facilitating travel bookings. We do not control or operate third-party hotels, flights, trains, or car fleets, and are not liable for service delays, quality issues, injuries, damages, or losses resulting from third-party vendor default.
            </p>
          </section>

          <section className="mb-0">
            <h5 className="fw-bold text-dark-blue mb-2" style={{ fontSize: '18px' }}>6. Governing Law</h5>
            <p>
              These terms are governed by and construed in accordance with the laws of India. Any disputes arising from the use of our services shall be subject to the exclusive jurisdiction of the courts in Gurugram, Haryana.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
