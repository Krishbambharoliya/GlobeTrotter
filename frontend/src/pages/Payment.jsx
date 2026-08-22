import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaWallet, FaCreditCard, FaQrcode, FaCheckCircle, FaExclamationTriangle, FaMoneyBill } from 'react-icons/fa';
import api from '../api';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('booking_id');

  const [booking, setBooking] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selection states
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, Card, Wallet
  const [successOverlay, setSuccessOverlay] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Input fields
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingRes, profileRes] = await Promise.all([
        api.get(`bookings/${bookingId}/`),
        api.get('users/profile/')
      ]);
      setBooking(bookingRes.data);
      setProfile(profileRes.data);
    } catch (err) {
      setError('Could not load transaction details. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchData();
    }
  }, [bookingId]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');

    // Client-side simulation checks
    if (paymentMethod === 'UPI' && !upiId.includes('@')) {
      setPaymentError('Please enter a valid UPI ID (e.g. user@okhdfc)');
      return;
    }
    if (paymentMethod === 'Card') {
      if (cardNumber.length < 16 || cardCvv.length < 3 || !cardExpiry) {
        setPaymentError('Please enter valid credit/debit card information');
        return;
      }
    }
    if (paymentMethod === 'Wallet') {
      const rawBal = profile?.profile?.wallet_balance ?? profile?.wallet_balance ?? 0;
      if (parseFloat(rawBal) < parseFloat(booking.total_price)) {
        setPaymentError('Insufficient Globe Trotter Wallet balance. Please use another method.');
        return;
      }
    }

    try {
      // API call to process charge
      await api.post('payments/charge/', {
        booking_id: booking.id,
        method: paymentMethod
      });

      // Show animated success checkmark
      setSuccessOverlay(true);
      setTimeout(() => {
        setSuccessOverlay(false);
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setPaymentError(err.response?.data?.error || 'Payment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Securing payment gateway...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error || 'Invalid booking transaction references.'}</div>
      </div>
    );
  }

  const roundedPrice = Math.floor(parseFloat(booking.total_price));
  const rawBalance = profile?.profile?.wallet_balance ?? profile?.wallet_balance ?? 0;
  const userWalletBalance = Math.floor(parseFloat(rawBalance) || 0);

  return (
    <div className="payment-page container py-5">
      {successOverlay && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 p-4 p-md-5 text-center bg-white shadow-lg animate-fade-in">
              <div className="text-success mb-3 animate-bounce">
                <FaCheckCircle size={75} />
              </div>
              <h3 className="fw-bold mb-1 text-dark-blue">Payment Successful!</h3>
              <p className="text-success fw-bold fs-5 mb-3">
                ₹{roundedPrice.toLocaleString('en-IN')} Deducted from Wallet
              </p>
              
              <div className="p-3 bg-light rounded-3 text-start mb-3 border">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Booking Reference:</span>
                  <span className="fw-bold text-dark font-monospace">#GT-{booking.id}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Booking Status:</span>
                  <span className="badge bg-success">CONFIRMED</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">New Wallet Balance:</span>
                  <span className="fw-bold text-success font-monospace">
                    ₹{Math.max(0, userWalletBalance - roundedPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <p className="text-muted small mb-0">✈️ E-ticket issued! Redirecting to Dashboard...</p>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4 max-w-4xl mx-auto" style={{ maxWidth: '900px' }}>
        {/* Left Column: Payment Options */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-4 text-dark-blue">Choose Payment Method</h5>

            {paymentError && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                <FaExclamationTriangle /> {paymentError}
              </div>
            )}

            <div className="d-flex flex-column gap-2 mb-4">
              {/* UPI option */}
              <button
                type="button"
                onClick={() => { setPaymentMethod('UPI'); setPaymentError(''); }}
                className={`btn text-start p-3 rounded-3 d-flex align-items-center justify-content-between border ${paymentMethod === 'UPI' ? 'border-primary bg-primary-subtle text-primary fw-bold' : 'border-light bg-light text-muted'}`}
              >
                <span className="d-flex align-items-center gap-2"><FaQrcode /> UPI / QR Scan</span>
                <span className="small">Instant</span>
              </button>

              {/* Card option */}
              <button
                type="button"
                onClick={() => { setPaymentMethod('Card'); setPaymentError(''); }}
                className={`btn text-start p-3 rounded-3 d-flex align-items-center justify-content-between border ${paymentMethod === 'Card' ? 'border-primary bg-primary-subtle text-primary fw-bold' : 'border-light bg-light text-muted'}`}
              >
                <span className="d-flex align-items-center gap-2"><FaCreditCard /> Credit / Debit Card</span>
                <span className="small">Visa, Mastercard</span>
              </button>

              {/* Wallet option */}
              <button
                type="button"
                onClick={() => { setPaymentMethod('Wallet'); setPaymentError(''); }}
                className={`btn text-start p-3 rounded-3 d-flex align-items-center justify-content-between border ${paymentMethod === 'Wallet' ? 'border-primary bg-primary-subtle text-primary fw-bold' : 'border-light bg-light text-muted'}`}
              >
                <span className="d-flex align-items-center gap-2"><FaWallet /> Wallet</span>
                <span className="small fw-bold text-success font-monospace">₹{userWalletBalance.toLocaleString('en-IN')}</span>
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              {paymentMethod === 'UPI' && (
                <div className="animate-fade-in">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Enter UPI ID</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="e.g. mobile@upi"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                  <div className="text-center py-2 bg-light rounded-3 mb-3">
                    <small className="text-muted d-block">Or scan code at counters</small>
                    <span className="fs-1">📱</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="row g-3 animate-fade-in">
                  <div className="col-12">
                    <label className="form-label small fw-bold">Card Number</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="16-digit Card Number"
                      maxLength="16"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Expiry Date</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">CVV</label>
                    <input
                      type="password"
                      className="form-control rounded-3"
                      placeholder="3-digit"
                      maxLength="3"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'Wallet' && (
                <div
                  className="p-4 rounded-4 mb-3 animate-fade-in text-start border shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderColor: '#cbd5e1'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px', color: '#64748b' }}>
                      WALLET BALANCE
                    </span>
                    <span className="badge bg-success text-white px-2.5 py-1 rounded-pill small fw-bold">Selected</span>
                  </div>
                  <div className="fs-2 fw-bold text-success font-monospace mb-2" style={{ letterSpacing: '-0.5px' }}>
                    ₹{userWalletBalance.toLocaleString('en-IN')}
                  </div>
                  <div className="d-flex justify-content-between align-items-center small text-muted border-top pt-2.5 mt-2" style={{ borderColor: '#e2e8f0' }}>
                    <span>Booking Payable Amount:</span>
                    <span className="fw-bold text-danger fs-6">₹{roundedPrice.toLocaleString('en-IN')}</span>
                  </div>
                  {userWalletBalance < roundedPrice && (
                    <div className="alert alert-danger py-2 px-3 mt-3 mb-0 small fw-semibold rounded-3 d-flex align-items-center gap-2">
                      <FaExclamationTriangle /> Insufficient wallet balance. Please add money to wallet in your Profile or select another payment method.
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-warning w-100 py-3 rounded-pill fw-bold text-white shadow-lg mt-3"
                disabled={paymentMethod === 'Wallet' && userWalletBalance < roundedPrice}
              >
                PAY ₹{roundedPrice.toLocaleString('en-IN')} NOW
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
            <h5 className="fw-bold mb-3 text-dark-blue text-start">Order Summary</h5>

            <div className="text-start bg-light p-3 rounded-3 mb-3">
              <span className="small text-muted d-block uppercase fw-bold" style={{ fontSize: '10px' }}>BOOKING TYPE</span>
              <span className="fw-bold text-primary text-uppercase">{booking.booking_type}</span>

              <span className="small text-muted d-block uppercase fw-bold mt-2" style={{ fontSize: '10px' }}>BOOKING ID</span>
              <span className="fw-bold text-dark-blue">#GT-{booking.id}</span>

              <span className="small text-muted d-block uppercase fw-bold mt-2" style={{ fontSize: '10px' }}>TRAVELERS</span>
              <span className="fw-bold text-dark-blue">
                {JSON.parse(booking.travelers_info || '[]').length} traveler(s)
              </span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Fare & Addons</span>
              <span className="fw-bold text-dark-blue">₹{Math.floor(parseFloat(booking.total_price) + parseFloat(booking.discount_amount))}</span>
            </div>

            {parseFloat(booking.discount_amount) > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span className="small">Promo Discount</span>
                <span className="fw-bold">- ₹{Math.floor(parseFloat(booking.discount_amount))}</span>
              </div>
            )}

            <hr />

            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark-blue">Total Paid</span>
              <span className="fs-4 fw-bold text-primary-blue">₹{roundedPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
