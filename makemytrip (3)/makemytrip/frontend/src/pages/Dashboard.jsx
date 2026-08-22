import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FaPlane, FaHotel, FaBus, FaSuitcase, FaCar, FaBan, FaCheck, FaCrown, FaEdit, FaHeart, FaBell, FaUsers, FaPrint, FaTrash, FaTrain, FaWallet, FaQrcode, FaCheckCircle, FaExclamationTriangle, FaMobileAlt } from 'react-icons/fa';
import { MdModeEdit, MdDeleteOutline } from 'react-icons/md';
import api from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Money to Wallet States
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('1000');
  const [addPaymentMode, setAddPaymentMode] = useState('UPI'); // UPI, QR
  const [addUpiId, setAddUpiId] = useState('');
  const [addMoneyLoading, setAddMoneyLoading] = useState(false);
  const [addMoneySuccess, setAddMoneySuccess] = useState('');
  const [addMoneyError, setAddMoneyError] = useState('');

  const handleAddWalletMoney = async (e) => {
    e.preventDefault();
    setAddMoneyError('');
    setAddMoneySuccess('');

    const val = parseFloat(addAmount);
    if (!val || val <= 0) {
      setAddMoneyError('Please enter a valid amount to add.');
      return;
    }

    if (addPaymentMode === 'UPI' && !addUpiId.trim()) {
      setAddMoneyError('Please enter your UPI ID to proceed.');
      return;
    }

    setAddMoneyLoading(true);
    try {
      const res = await api.post('payments/add-wallet/', {
        amount: val,
        method: addPaymentMode,
        upi_id: addUpiId
      });

      // Update profile state in Dashboard immediately
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          profile: {
            ...prev.profile,
            wallet_balance: res.data.new_wallet_balance
          },
          wallet_balance: res.data.new_wallet_balance
        };
      });

      setAddMoneySuccess(`₹${val.toLocaleString('en-IN')} successfully added to your Wallet balance!`);
      setTimeout(() => {
        setAddMoneySuccess('');
        setShowAddMoneyModal(false);
      }, 1600);
    } catch (err) {
      setAddMoneyError(err.response?.data?.error || 'Could not add money to wallet. Please try again.');
    } finally {
      setAddMoneyLoading(false);
    }
  };

  // Dashboard Tabs
  const [activeSubTab, setActiveSubTab] = useState('profile_view'); // profile_view, bookings, payments, wishlist, travelers, notifications, reviews, profile_edit

  // Edit Profile Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [city, setCity] = useState(localStorage.getItem('user_city') || 'Ahmedabad');

  // Change Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Payment History
  const [payments, setPayments] = useState([]);

  // Saved Travelers
  const [travelerList, setTravelerList] = useState([]);
  const [newTravName, setNewTravName] = useState('');
  const [newTravAge, setNewTravAge] = useState('');
  const [newTravGender, setNewTravGender] = useState('Male');

  // Bookings Filter
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Notifications
  const [notifications, setNotifications] = useState([]);

  // Wishlist
  const [wishlist, setWishlist] = useState([]);

  // PDF Ticket Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Reviews & Ratings
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingComment, setEditingComment] = useState('');
  const [editingRating, setEditingRating] = useState(5);

  const [searchParams] = useSearchParams();

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, bookingsRes, notifyRes, paymentsRes] = await Promise.all([
        api.get('users/profile/'),
        api.get('bookings/'),
        api.get('notifications/'),
        api.get('payments/')
      ]);

      const pData = profileRes.data;
      setProfile(pData);
      setBookings(bookingsRes.data);
      setNotifications(notifyRes.data);
      setPayments(paymentsRes.data);

      // Populate edit states
      setFirstName(pData.first_name || '');
      setLastName(pData.last_name || '');
      setEmail(pData.email || '');
      setPhoneNumber(pData.profile?.phone_number || '');
      setAvatarUrl(pData.profile?.avatar_url || '');

      // Parse travelers list from JSON
      try {
        const parsed = JSON.parse(pData.profile?.saved_travelers || '[]');
        setTravelerList(parsed);
      } catch (e) {
        setTravelerList([]);
      }

      // Load Wishlist
      setWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]'));

      // Load Reviews
      const reviewsRes = await api.get(`reviews/?user=${pData.id}`);
      setReviews(reviewsRes.data);

    } catch (err) {
      setError('Session expired. Please log in again.');
      localStorage.clear();
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchData();
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveSubTab(tab);
    }
  }, [searchParams]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('users/profile/', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber,
        avatar_url: avatarUrl,
        saved_travelers: JSON.stringify(travelerList)
      });
      setProfile(response.data);
      localStorage.setItem('first_name', response.data.first_name);
      localStorage.setItem('user_city', city);
      window.dispatchEvent(new Event('profileUpdated'));
      alert('Profile updated successfully!');
      setActiveSubTab('profile_view');
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    try {
      await api.post('users/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      setPasswordSuccess('Password changed successfully! Logging you out...');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setPasswordError(err.response.data.error);
      } else {
        setPasswordError('Failed to change password. Please check your old password.');
      }
    }
  };

  const handleAddTraveler = async (e) => {
    e.preventDefault();
    if (!newTravName || !newTravAge) return;

    const updatedList = [...travelerList, { name: newTravName, age: parseInt(newTravAge), gender: newTravGender }];
    setTravelerList(updatedList);
    setNewTravName('');
    setNewTravAge('');

    try {
      await api.put('users/profile/', {
        saved_travelers: JSON.stringify(updatedList)
      });
    } catch (err) {
      console.error("Failed to save travelers to backend", err);
    }
  };

  const handleRemoveTraveler = async (idx) => {
    const updatedList = travelerList.filter((_, i) => i !== idx);
    setTravelerList(updatedList);
    try {
      await api.put('users/profile/', {
        saved_travelers: JSON.stringify(updatedList)
      });
    } catch (err) {
      console.error("Failed to update travelers", err);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refund will be credited back to your wallet.')) {
      return;
    }

    try {
      await api.post(`bookings/${bookingId}/cancel/`);
      // Reload profile to update wallet balance, reload bookings
      const [profileRes, bookingsRes] = await Promise.all([
        api.get('users/profile/'),
        api.get('bookings/')
      ]);
      setProfile(profileRes.data);
      setBookings(bookingsRes.data);
      alert('Booking cancelled successfully. Funds returned to wallet!');
    } catch (err) {
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.post(`notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const clearWishlistItem = (id, type) => {
    const updated = wishlist.filter(w => !(w.id === id && w.type === type));
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSuccess('');
    if (!reviewBookingId) {
      alert('Please select a booking to review.');
      return;
    }
    const booking = bookings.find(b => b.id === parseInt(reviewBookingId));
    if (!booking) return;

    let category = '';
    let targetId = 0;
    if (booking.booking_type === 'flight') {
      category = 'flight';
      targetId = booking.flight_booking;
    } else if (booking.booking_type === 'hotel') {
      category = 'hotel';
      targetId = booking.hotel_booking;
    } else if (booking.booking_type === 'train') {
      category = 'train';
      targetId = booking.train_booking;
    } else if (booking.booking_type === 'package') {
      category = 'package';
      targetId = booking.package_booking;
    } else if (booking.booking_type === 'car') {
      category = 'car';
      targetId = booking.car_booking;
    } else if (booking.booking_type === 'bus') {
      category = 'bus';
      targetId = booking.bus_booking;
    }

    try {
      await api.post('reviews/', {
        category: category,
        target_id: targetId,
        rating: parseInt(reviewRating),
        comment: reviewComment
      });
      setReviewSuccess('Review submitted successfully!');
      setReviewComment('');
      setReviewBookingId('');
      // Reload reviews
      const reviewsRes = await api.get(`reviews/?user=${profile.id}`);
      setReviews(reviewsRes.data);
    } catch (err) {
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`reviews/${reviewId}/`);
      alert('Review deleted successfully!');
      const reviewsRes = await api.get(`reviews/?user=${profile.id}`);
      setReviews(reviewsRes.data);
    } catch (err) {
      const errMsg = err.response && err.response.data
        ? JSON.stringify(err.response.data)
        : err.message;
      alert('Failed to delete review: ' + errMsg);
    }
  };

  const handleUpdateReview = async (e, reviewId, category, targetId) => {
    e.preventDefault();
    try {
      await api.put(`reviews/${reviewId}/`, {
        category: category,
        target_id: targetId,
        rating: parseInt(editingRating),
        comment: editingComment
      });
      alert('Review updated successfully!');
      setEditingReviewId(null);
      const reviewsRes = await api.get(`reviews/?user=${profile.id}`);
      setReviews(reviewsRes.data);
    } catch (err) {
      const errMsg = err.response && err.response.data
        ? JSON.stringify(err.response.data)
        : err.message;
      alert('Failed to update review: ' + errMsg);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filter === 'all' || b.status === filter;
    const matchesType = typeFilter === 'all' || b.booking_type === typeFilter;
    return matchesStatus && matchesType;
  });

  const getBookingTypeCount = (type) => {
    if (type === 'all') return bookings.length;
    return bookings.filter(b => b.booking_type === type).length;
  };

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container py-5">
      {/* PDF Ticket Print Simulation Modal */}
      {selectedTicket && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1100 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden animate-fade-in">
              <div className="modal-header border-0 bg-dark text-white p-4">
                <h5 className="modal-title fw-bold">✈️ GlobeTrotter Travel E-Ticket</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTicket(null)}></button>
              </div>
              <div className="modal-body p-4 p-md-5 bg-white text-start">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap border-bottom pb-3">
                  <div>
                    <h4 className="fw-bold text-primary-blue mb-1">GlobeTrotter Confirmation</h4>
                    <span className="text-muted">Booking Reference: GT-CONF-{selectedTicket.id}</span>
                  </div>
                  <button onClick={() => window.print()} className="btn btn-outline-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-2 btn-sm">
                    <FaPrint /> Print Ticket
                  </button>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <small className="text-muted d-block font-weight-700">SERVICE CATEGORY</small>
                    <span className="fw-bold text-uppercase">{selectedTicket.booking_type}</span>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block font-weight-700">BOOKING DATE</small>
                    <span className="fw-bold">{formatDate(selectedTicket.booking_date)}</span>
                  </div>
                </div>

                {/* Service Highlights */}
                <div className="bg-light p-3 rounded-3 mb-4">
                  <h6 className="fw-bold mb-2">Item Specifications:</h6>
                  {selectedTicket.booking_type === 'flight' && selectedTicket.flight_details && (
                    <div>
                      <div className="fw-bold text-dark-blue">{selectedTicket.flight_details.airline} - {selectedTicket.flight_details.flight_number}</div>
                      <div className="small text-muted">{selectedTicket.flight_details.departure_city} ➔ {selectedTicket.flight_details.arrival_city}</div>
                      <div className="small text-muted">Seats: {selectedTicket.flight_seats || 'Not selected'} | Meal: {selectedTicket.flight_meal || 'None'} | Baggage: {selectedTicket.flight_baggage || 'Standard'}</div>
                      {JSON.parse(selectedTicket.travelers_info || '[]')[0]?.travelDate && (
                        <div className="small text-primary fw-bold mt-1">
                          📅 Travel Date: {JSON.parse(selectedTicket.travelers_info || '[]')[0].travelDate}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedTicket.booking_type === 'hotel' && selectedTicket.hotel_details && (
                    <div>
                      <div className="fw-bold text-dark-blue">{selectedTicket.hotel_details.name}</div>
                      <div className="small text-muted">{selectedTicket.hotel_details.address}, {selectedTicket.hotel_details.city}</div>
                      {JSON.parse(selectedTicket.travelers_info || '[]')[0]?.checkIn && (
                        <div className="small text-primary fw-bold mt-1">
                          📅 Stay: {JSON.parse(selectedTicket.travelers_info || '[]')[0].checkIn} to {JSON.parse(selectedTicket.travelers_info || '[]')[0].checkOut}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedTicket.booking_type === 'train' && selectedTicket.train_details && (
                    <div>
                      <div className="fw-bold text-dark-blue">{selectedTicket.train_details.name} - {selectedTicket.train_details.train_type}</div>
                      <div className="small text-muted">Seats: {selectedTicket.train_seats || 'Not selected'} ({selectedTicket.train_details.source_city} ➔ {selectedTicket.train_details.destination_city})</div>
                      {JSON.parse(selectedTicket.travelers_info || '[]')[0]?.travelDate && (
                        <div className="small text-primary fw-bold mt-1">
                          📅 Travel Date: {JSON.parse(selectedTicket.travelers_info || '[]')[0].travelDate}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedTicket.booking_type === 'bus' && selectedTicket.bus_details && (
                    <div>
                      <div className="fw-bold text-dark-blue">{selectedTicket.bus_details.operator} ({selectedTicket.bus_details.bus_type})</div>
                      <div className="small text-muted">Seats: {selectedTicket.bus_seats || 'Not selected'} ({selectedTicket.bus_details.source_city} ➔ {selectedTicket.bus_details.destination_city})</div>
                      {JSON.parse(selectedTicket.travelers_info || '[]')[0]?.travelDate && (
                        <div className="small text-primary fw-bold mt-1">
                          📅 Travel Date: {JSON.parse(selectedTicket.travelers_info || '[]')[0].travelDate}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedTicket.booking_type === 'package' && selectedTicket.package_details && (
                    <div>
                      <div className="fw-bold text-dark-blue">{selectedTicket.package_details.title}</div>
                      <div className="small text-muted">Duration: {selectedTicket.package_details.duration} ({selectedTicket.package_details.destination})</div>
                      {JSON.parse(selectedTicket.travelers_info || '[]')[0]?.departureDate && (
                        <div className="small text-primary fw-bold mt-1">
                          📅 Scheduled Departure: {JSON.parse(selectedTicket.travelers_info || '[]')[0].departureDate}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedTicket.booking_type === 'car' && selectedTicket.car_details && (
                    <div>
                      <div className="fw-bold text-dark-blue">{selectedTicket.car_details.name} ({selectedTicket.car_rental_type})</div>
                      <div className="small text-muted">Daily Rate: ₹{Math.floor(selectedTicket.car_details.daily_rate)}</div>
                      {JSON.parse(selectedTicket.travelers_info || '[]')[0]?.travelDate && (
                        <div className="small text-primary fw-bold mt-1">
                          📅 Rental Date: {JSON.parse(selectedTicket.travelers_info || '[]')[0].travelDate}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Travelers */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">Traveler List:</h6>
                  <table className="table table-bordered table-sm small">
                    <thead className="bg-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                      </tr>
                    </thead>
                    <tbody>
                      {JSON.parse(selectedTicket.travelers_info || '[]').map((t, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td className="fw-bold">{t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'N/A'}</td>
                          <td>{t.age}</td>
                          <td>{t.gender}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center border-top pt-3">
                  <div>
                    <span className="small text-muted d-block">Paid Total</span>
                    <h4 className="fw-bold text-primary-blue mb-0">₹{Math.floor(parseFloat(selectedTicket.total_price))}</h4>
                  </div>
                  <span className="badge bg-success rounded-pill px-3 py-2">ISSUED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="dashboard-outer-container">
        <div className="dashboard-layout">
          {/* Sidebar */}
          <div className="dashboard-sidebar">
            <div>
              <div className="dashboard-profile-section">
                <img
                  id="profileImage"
                  src={avatarUrl || "https://i.pravatar.cc/150?img=12"}
                  alt="Profile Avatar"
                />
                <div className="dashboard-profile-text">
                  <h3>{profile?.first_name} {profile?.last_name || 'User'}</h3>
                  <p>{profile?.is_staff ? 'Administrator' : 'User'}</p>
                </div>
              </div>

              <div className="dashboard-menu">
                <button
                  className={activeSubTab === 'profile_view' ? 'active' : ''}
                  onClick={() => setActiveSubTab('profile_view')}
                >
                  My Profile
                </button>
                <button
                  className={activeSubTab === 'bookings' ? 'active' : ''}
                  onClick={() => setActiveSubTab('bookings')}
                >
                  Booking History
                </button>
                <button
                  className={activeSubTab === 'payments' ? 'active' : ''}
                  onClick={() => setActiveSubTab('payments')}
                >
                  Payment History
                </button>
                <button
                  className={activeSubTab === 'wishlist' ? 'active' : ''}
                  onClick={() => setActiveSubTab('wishlist')}
                >
                  Wishlist
                </button>
                <button
                  className={activeSubTab === 'travelers' ? 'active' : ''}
                  onClick={() => setActiveSubTab('travelers')}
                >
                  Saved Travelers
                </button>
                <button
                  className={activeSubTab === 'notifications' ? 'active' : ''}
                  onClick={() => setActiveSubTab('notifications')}
                >
                  Notifications ({notifications.filter(n => !n.read).length})
                </button>
                <button
                  className={activeSubTab === 'reviews' ? 'active' : ''}
                  onClick={() => setActiveSubTab('reviews')}
                >
                  Ratings & Reviews
                </button>
                <button
                  className={activeSubTab === 'profile_edit' ? 'active' : ''}
                  onClick={() => setActiveSubTab('profile_edit')}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="mt-4 pt-3 border-top border-secondary-subtle">
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>💳 Wallet:</span>
                <span className="fw-bold text-dark">₹{Math.floor(parseFloat(profile?.profile?.wallet_balance || 0))}</span>
              </div>
              {profile?.is_staff && (
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="btn btn-warning w-100 btn-sm fw-bold text-white shadow-sm mt-2 rounded-3"
                >
                  🛠️ Admin Panel
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Content Panels */}
          <div className="dashboard-content-area text-start">

            {/* Tab 1: My Profile View */}
            <div className={`dashboard-page ${activeSubTab === 'profile_view' ? 'active' : ''}`}>
              <div className="card border border-light-subtle shadow-sm rounded-4 p-4 bg-white animate-fade-in">
                {/* Profile Header Block */}
                <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom flex-wrap text-center text-sm-start justify-content-center justify-content-sm-start">
                  <div className="position-relative">
                    <img
                      src={avatarUrl || "https://i.pravatar.cc/150?img=12"}
                      alt="User Avatar"
                      className="rounded-circle border img-thumbnail shadow-sm"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <h3 className="fw-bold mb-1 text-dark-blue">{profile?.first_name || 'N/A'} {profile?.last_name || ''}</h3>
                  </div>
                </div>

                {/* Account Balances Overview */}
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <div className="p-3 rounded-4 border bg-light bg-opacity-50 text-start">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="small text-muted fw-semibold text-uppercase d-block mb-1" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>WALLET BALANCE</span>
                          <h4 className="fw-bold text-success mb-0" style={{ fontSize: '20px' }}>
                            ₹{Math.floor(parseFloat(profile?.profile?.wallet_balance || 0)).toLocaleString('en-IN')}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAddMoneyModal(true)}
                          className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1.5 fw-bold"
                          style={{ fontSize: '12px', color: '#000000', borderColor: '#000000', backgroundColor: 'transparent' }}
                        >
                          + Add Money
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 rounded-4 border bg-light bg-opacity-50 text-start">
                      <span className="small text-muted fw-semibold text-uppercase d-block mb-1" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>Saved Travelers</span>
                      <h4 className="fw-bold text-dark-blue mb-0" style={{ fontSize: '20px' }}>
                        {travelerList.length} Companions
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Profile Details List */}
                <h5 className="fw-bold text-dark-blue mb-3 text-start">Personal Information</h5>
                <div className="row g-3 text-start mb-4">
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 border border-light-subtle bg-white">
                      <span className="small text-muted d-block" style={{ fontSize: '11px' }}>First Name</span>
                      <strong className="text-dark d-block mt-1" style={{ fontSize: '14px' }}>{profile?.first_name || 'N/A'}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 border border-light-subtle bg-white">
                      <span className="small text-muted d-block" style={{ fontSize: '11px' }}>Last Name</span>
                      <strong className="text-dark d-block mt-1" style={{ fontSize: '14px' }}>{profile?.last_name || 'N/A'}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 border border-light-subtle bg-white">
                      <span className="small text-muted d-block" style={{ fontSize: '11px' }}>Email Address</span>
                      <strong className="text-dark d-block mt-1 font-monospace" style={{ fontSize: '14px' }}>{profile?.email || 'N/A'}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 border border-light-subtle bg-white">
                      <span className="small text-muted d-block" style={{ fontSize: '11px' }}>Phone Number</span>
                      <strong className="text-dark d-block mt-1" style={{ fontSize: '14px' }}>{phoneNumber || 'N/A'}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 border border-light-subtle bg-white">
                      <span className="small text-muted d-block" style={{ fontSize: '11px' }}>City</span>
                      <strong className="text-dark d-block mt-1" style={{ fontSize: '14px' }}>{city || 'N/A'}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 border border-light-subtle bg-white">
                      <span className="small text-muted d-block" style={{ fontSize: '11px' }}>Membership Tier</span>
                      <strong className="text-dark d-block mt-1" style={{ fontSize: '14px' }}>{profile?.profile?.tier || 'PYT Member'}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 border border-light-subtle bg-white">
                      <span className="small text-muted d-block" style={{ fontSize: '11px' }}>Coins</span>
                      <strong className="text-muted d-block mt-1 fw-bold" style={{ fontSize: '14px' }}>Coming Soon</strong>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Navigation Button */}
                <div className="text-start">
                  <button
                    onClick={() => setActiveSubTab('profile_edit')}
                    className="btn btn-warning text-white rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm transition-all"
                  >
                    <FaEdit /> Edit Profile Info
                  </button>
                </div>
              </div>
            </div>

            {/* Tab 2: Booking History */}
            <div className={`dashboard-page ${activeSubTab === 'bookings' ? 'active' : ''}`}>
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
                <h2>Booking History</h2>
                <div className="btn-group shadow-sm bg-white p-1 rounded-pill" role="group">
                  <button type="button" className={`btn btn-sm rounded-pill px-3 ${filter === 'all' ? 'btn-primary' : 'btn-light border-0 text-muted'}`} onClick={() => setFilter('all')}>
                    All
                  </button>
                  <button type="button" className={`btn btn-sm rounded-pill px-3 ${filter === 'confirmed' ? 'btn-primary' : 'btn-light border-0 text-muted'}`} onClick={() => setFilter('confirmed')}>
                    Confirmed ({confirmedCount})
                  </button>
                  <button type="button" className={`btn btn-sm rounded-pill px-3 ${filter === 'cancelled' ? 'btn-primary' : 'btn-light border-0 text-muted'}`} onClick={() => setFilter('cancelled')}>
                    Cancelled ({cancelledCount})
                  </button>
                </div>
              </div>

              {/* Booking Type Filters */}
              <div className="d-flex flex-wrap gap-2 mb-4 p-2 bg-light rounded-4 shadow-sm align-items-center">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${typeFilter === 'all' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setTypeFilter('all')}
                >
                  🌐 All ({getBookingTypeCount('all')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${typeFilter === 'flight' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setTypeFilter('flight')}
                >
                  <FaPlane size={12} /> Flights ({getBookingTypeCount('flight')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${typeFilter === 'hotel' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setTypeFilter('hotel')}
                >
                  <FaHotel size={12} /> Hotels ({getBookingTypeCount('hotel')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${typeFilter === 'train' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setTypeFilter('train')}
                >
                  <FaTrain size={12} /> Trains ({getBookingTypeCount('train')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${typeFilter === 'bus' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setTypeFilter('bus')}
                >
                  <FaBus size={12} /> Buses ({getBookingTypeCount('bus')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${typeFilter === 'package' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setTypeFilter('package')}
                >
                  <FaSuitcase size={12} /> Packages ({getBookingTypeCount('package')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${typeFilter === 'car' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setTypeFilter('car')}
                >
                  <FaCar size={12} /> Cars ({getBookingTypeCount('car')})
                </button>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm p-4">
                  <p className="fs-5 text-muted mb-3">No bookings found.</p>
                  <button onClick={() => navigate('/')} className="btn btn-primary rounded-pill px-4 fw-semibold">
                    Plan a New Trip
                  </button>
                </div>
              ) : (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => {
                      let placeDetails = '';
                      if (booking.booking_type === 'flight' && booking.flight_details) {
                        placeDetails = `${booking.flight_details.airline} (${booking.flight_details.departure_city} ➔ ${booking.flight_details.arrival_city})`;
                      } else if (booking.booking_type === 'hotel' && booking.hotel_details) {
                        placeDetails = `${booking.hotel_details.name} (${booking.hotel_details.city})${booking.hotel_room_type ? ` • ${booking.hotel_room_type}` : ''}`;
                      } else if (booking.booking_type === 'train' && booking.train_details) {
                        placeDetails = `${booking.train_details.name} (${booking.train_details.source_city} ➔ ${booking.train_details.destination_city})`;
                      } else if (booking.booking_type === 'package' && booking.package_details) {
                        placeDetails = `${booking.package_details.title} (${booking.package_details.destination})`;
                      } else if (booking.booking_type === 'car' && booking.car_details) {
                        placeDetails = `${booking.car_details.name} (${booking.car_rental_type})`;
                      } else if (booking.booking_type === 'bus' && booking.bus_details) {
                        placeDetails = `${booking.bus_details.operator} (${booking.bus_details.source_city} ➔ ${booking.bus_details.destination_city})`;
                      } else {
                        placeDetails = `Booking: ${booking.booking_type.toUpperCase()}`;
                      }

                      return (
                        <tr key={booking.id}>
                          <td>#{booking.id}</td>
                          <td>
                            <strong>{booking.booking_type.toUpperCase()}</strong> - {placeDetails}
                            <div className="small text-muted">Date: {formatDate(booking.booking_date)} | Paid: ₹{Math.floor(parseFloat(booking.total_price))}</div>
                          </td>
                          <td>
                            <span className={`badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              {booking.status === 'confirmed' && (
                                <>
                                  <button
                                    onClick={() => setSelectedTicket(booking)}
                                    className="btn btn-outline-primary btn-sm rounded-pill px-2 py-1"
                                  >
                                    <FaPrint size={12} /> Print
                                  </button>
                                  <button
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="btn btn-outline-danger btn-sm rounded-pill px-2 py-1"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Tab 3: Payment History */}
            <div className={`dashboard-page ${activeSubTab === 'payments' ? 'active' : ''}`}>
              <h2>Payment History</h2>
              {payments.length === 0 ? (
                <p className="text-muted">No payment transactions found.</p>
              ) : (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.payment_id}</td>
                        <td>{payment.method}</td>
                        <td>₹{Math.floor(parseFloat(payment.amount))}</td>
                        <td>{formatDate(payment.created_at)}</td>
                        <td>
                          <span className={`badge ${payment.status === 'completed' ? 'bg-success' : 'bg-secondary'}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Tab 4: Wishlist */}
            <div className={`dashboard-page ${activeSubTab === 'wishlist' ? 'active' : ''}`}>
              <h2>Wishlist</h2>
              {wishlist.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm p-4">
                  <p className="fs-5 text-muted mb-2">No items saved yet.</p>
                  <p className="small text-muted">Browse flights, hotels, and packages and save to your wishlist.</p>
                </div>
              ) : (
                wishlist.map((item, idx) => (
                  <div key={idx} className="dashboard-card-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{item.name || item.title || item.operator || 'Special Trip'}</strong>
                      <div className="small text-muted">{item.type.toUpperCase()} | {item.city || item.destination || 'India'}</div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => navigate(`/booking-details?type=${item.type}&id=${item.id}`)}
                        className="btn btn-primary btn-sm rounded-pill px-3"
                      >
                        Book Now
                      </button>
                      <button
                        onClick={() => clearWishlistItem(item.id, item.type)}
                        className="btn btn-outline-danger btn-sm rounded-circle p-1"
                        style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Tab 5: Saved Travelers */}
            <div className={`dashboard-page ${activeSubTab === 'travelers' ? 'active' : ''}`}>
              <h2>Saved Travelers</h2>
              {travelerList.length === 0 ? (
                <p className="text-muted small">No saved travelers yet. Add travel companions to book faster!</p>
              ) : (
                <div className="d-flex flex-column gap-2 mb-4">
                  {travelerList.map((trav, idx) => (
                    <div key={idx} className="dashboard-card-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{trav.name}</strong>
                        <div className="small text-muted">Age: {trav.age} | Gender: {trav.gender}</div>
                      </div>
                      <button onClick={() => handleRemoveTraveler(idx)} className="btn btn-link text-danger p-0">
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <hr />

              <h5 className="fw-bold mb-3 text-dark-blue">Add Companion</h5>
              <form onSubmit={handleAddTraveler}>
                <div className="row g-3">
                  <div className="col-md-5">
                    <input
                      type="text"
                      className="dashboard-input"
                      placeholder="Full Name"
                      value={newTravName}
                      onChange={(e) => setNewTravName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <input
                      type="number"
                      className="dashboard-input"
                      placeholder="Age"
                      value={newTravAge}
                      onChange={(e) => setNewTravAge(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="dashboard-input"
                      value={newTravGender}
                      onChange={(e) => setNewTravGender(e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="col-md-1 d-flex align-items-center">
                    <button type="submit" className="dashboard-btn-save w-100">+</button>
                  </div>
                </div>
              </form>
            </div>

            {/* Tab 6: Notifications */}
            <div className={`dashboard-page ${activeSubTab === 'notifications' ? 'active' : ''}`}>
              <h2>Notifications Inbox</h2>
              {notifications.length === 0 ? (
                <p className="text-muted small">No new notifications.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkNotificationRead(n.id)}
                      className={`dashboard-card-item cursor-pointer ${n.read ? 'text-muted' : 'border-primary'}`}
                      style={{ opacity: n.read ? 0.7 : 1 }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong>{n.title}</strong>
                      </div>
                      <p className="mb-0 small">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tab 7: Reviews */}
            <div className={`dashboard-page ${activeSubTab === 'reviews' ? 'active' : ''}`}>
              <h2>Ratings & Reviews</h2>

              {/* Form to submit review */}
              <div className="mb-4 p-3 bg-light rounded-3 border">
                <h5 className="fw-bold mb-3 text-dark-blue">Write a Review</h5>
                {reviewSuccess && <div className="alert alert-success py-2 small mb-3">{reviewSuccess}</div>}
                {bookings.filter(b => b.status === 'confirmed').length === 0 ? (
                  <p className="text-muted small">You need to have at least one confirmed booking to write a review.</p>
                ) : (
                  <form onSubmit={handleSubmitReview}>
                    <div className="row g-3 mb-3">
                      <div className="col-md-8">
                        <label className="small fw-bold mb-1 d-block">Select Booking</label>
                        <select
                          className="dashboard-input"
                          required
                          value={reviewBookingId}
                          onChange={(e) => setReviewBookingId(e.target.value)}
                        >
                          <option value="">-- Choose Confirmed Booking --</option>
                          {bookings.filter(b => b.status === 'confirmed').map(b => (
                            <option key={b.id} value={b.id}>
                              #{b.id} - {b.booking_type.toUpperCase()} ({formatDate(b.booking_date)})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="small fw-bold mb-1 d-block">Rating</label>
                        <select
                          className="dashboard-input"
                          required
                          value={reviewRating}
                          onChange={(e) => setReviewRating(e.target.value)}
                        >
                          <option value="5">★★★★★ (5 Stars)</option>
                          <option value="4">★★★★☆ (4 Stars)</option>
                          <option value="3">★★★☆☆ (3 Stars)</option>
                          <option value="2">★★☆☆☆ (2 Stars)</option>
                          <option value="1">★☆☆☆☆ (1 Star)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="small fw-bold mb-1 d-block">Your Comments</label>
                      <textarea
                        className="dashboard-input"
                        rows="3"
                        placeholder="Share your travel experience..."
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      ></textarea>
                    </div>

                    <button type="submit" className="dashboard-btn-save">
                      Submit Review
                    </button>
                  </form>
                )}
              </div>

              {/* Reviews List */}
              <div className="d-flex flex-column gap-2">
                {reviews.length === 0 ? (
                  <p className="text-muted small">You haven't written any reviews yet.</p>
                ) : (
                  (showAllReviews ? reviews : reviews.slice(0, 5)).map((rev) => (
                    <div key={rev.id} className="dashboard-card-item p-3" style={{ position: 'relative' }}>
                      {editingReviewId === rev.id ? (
                        <form onSubmit={(e) => handleUpdateReview(e, rev.id, rev.category, rev.target_id)}>
                          <div className="row g-2 mb-2">
                            <div className="col-md-9">
                              <label className="small fw-bold mb-1 d-block text-muted">Edit Comment</label>
                              <textarea
                                className="dashboard-input py-1.5 px-2"
                                rows="2"
                                required
                                value={editingComment}
                                onChange={(e) => setEditingComment(e.target.value)}
                              ></textarea>
                            </div>
                            <div className="col-md-3">
                              <label className="small fw-bold mb-1 d-block text-muted">Rating</label>
                              <select
                                className="dashboard-input py-1.5 px-2"
                                required
                                value={editingRating}
                                onChange={(e) => setEditingRating(e.target.value)}
                              >
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                              </select>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm rounded-pill px-3 fw-bold" style={{ fontSize: '11px', background: 'var(--primary-sage)', border: 'none' }}>
                              Save
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                              style={{ fontSize: '11px' }}
                              onClick={() => setEditingReviewId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          {/* Absolute positioned edit/delete black icons */}
                          <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '12px' }}>
                            <button
                              className="btn btn-link p-0 border-0 d-flex align-items-center justify-content-center"
                              style={{ color: '#000000', opacity: 0.65, transition: 'opacity 0.2s' }}
                              title="Edit Review"
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.65'}
                              onClick={() => {
                                setEditingReviewId(rev.id);
                                setEditingComment(rev.comment);
                                setEditingRating(rev.rating);
                              }}
                            >
                              <MdModeEdit size={19} />
                            </button>
                            <button
                              className="btn btn-link p-0 border-0 d-flex align-items-center justify-content-center"
                              style={{ color: '#000000', opacity: 0.65, transition: 'opacity 0.2s' }}
                              title="Delete Review"
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.65'}
                              onClick={() => handleDeleteReview(rev.id)}
                            >
                              <MdDeleteOutline size={19} />
                            </button>
                          </div>

                          <div className="mb-2 text-start" style={{ paddingRight: '60px' }}>
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                              <span className="badge bg-secondary text-uppercase" style={{ fontSize: '10px' }}>{rev.category}</span>
                              <span className="small text-muted">ID: #{rev.target_id}</span>
                            </div>
                            <div className="text-warning mb-1" style={{ fontSize: '14px' }}>
                              {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                            </div>
                          </div>
                          <p className="small text-muted mb-2 font-italic">"{rev.comment}"</p>
                          <div className="d-flex justify-content-between align-items-center mt-1 border-top pt-2">
                            <small className="text-muted" style={{ fontSize: '10px' }}>
                              Posted: {new Date(rev.created_at).toDateString()}
                            </small>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}

                {reviews.length > 5 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold mx-auto d-block mt-2"
                  >
                    {showAllReviews ? 'Show Less' : `Show More (${reviews.length - 5} more)`}
                  </button>
                )}
              </div>
            </div>

            {/* Tab 8: Edit Profile */}
            <div className={`dashboard-page ${activeSubTab === 'profile_edit' ? 'active' : ''}`}>
              <h2>Edit Profile</h2>

              <div className="dashboard-edit-photo">
                <img id="editPreview" src={avatarUrl || "https://i.pravatar.cc/150?img=12"} alt="Profile Preview" />
                <input
                  id="photoInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (uploadEvent) => {
                        setAvatarUrl(uploadEvent.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <form onSubmit={handleUpdateProfile}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="small fw-bold mb-1 d-block">First Name</label>
                    <input
                      type="text"
                      className="dashboard-input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold mb-1 d-block">Last Name</label>
                    <input
                      type="text"
                      className="dashboard-input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="small fw-bold mb-1 d-block">Email Address</label>
                  <input
                    type="email"
                    className="dashboard-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="small fw-bold mb-1 d-block">Phone Number</label>
                  <input
                    type="text"
                    className="dashboard-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="small fw-bold mb-1 d-block">City</label>
                  <input
                    type="text"
                    className="dashboard-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>



                <button type="submit" className="dashboard-btn-save">
                  Save Changes
                </button>
              </form>

              <hr className="my-4" />

              <h4 className="fw-bold mb-3 mt-4 text-dark-blue">Change Password</h4>
              <form onSubmit={handleChangePassword} style={{ maxWidth: '500px' }}>
                {passwordError && <div className="alert alert-danger py-2 small mb-3">{passwordError}</div>}
                {passwordSuccess && <div className="alert alert-success py-2 small mb-3">{passwordSuccess}</div>}

                <div className="mb-3">
                  <label className="small fw-bold mb-1 d-block text-muted">Old Password</label>
                  <input
                    type="password"
                    className="dashboard-input"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="Enter old password"
                  />
                </div>

                <div className="mb-3">
                  <label className="small fw-bold mb-1 d-block text-muted">New Password</label>
                  <input
                    type="password"
                    className="dashboard-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                  />
                </div>

                <div className="mb-3">
                  <label className="small fw-bold mb-1 d-block text-muted">Confirm New Password</label>
                  <input
                    type="password"
                    className="dashboard-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                  />
                </div>

                <button type="submit" className="dashboard-btn-save mt-2">
                  Update Password
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Add Money to Wallet Modal (UPI / QR Code - Light Blue Theme) */}
      {showAddMoneyModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 p-4 text-start bg-white shadow-lg animate-fade-in" style={{ boxShadow: '0 20px 40px rgba(56, 189, 248, 0.2)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
                <h5 className="fw-bold mb-0 text-dark-blue d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                  <span className="p-2 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', background: '#e0f2fe', color: '#0ea5e9' }}>
                    <FaWallet />
                  </span>
                  Add Money to Wallet
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddMoneyModal(false)}
                ></button>
              </div>

              {addMoneySuccess && (
                <div className="alert py-2.5 px-3 small fw-bold d-flex align-items-center gap-2 mb-3 animate-fade-in" style={{ background: '#e0f2fe', borderColor: '#bae6fd', color: '#0369a1' }}>
                  <FaCheckCircle className="fs-5" style={{ color: '#0ea5e9' }} /> {addMoneySuccess}
                </div>
              )}

              {addMoneyError && (
                <div className="alert alert-danger py-2.5 px-3 small fw-bold d-flex align-items-center gap-2 mb-3 animate-fade-in">
                  <FaExclamationTriangle className="fs-5" /> {addMoneyError}
                </div>
              )}

              <form onSubmit={handleAddWalletMoney}>
                {/* Amount selection */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark-blue mb-1">Enter Top-Up Amount (₹):</label>
                  <input
                    type="number"
                    className="form-control form-control-lg rounded-3 fw-bold font-monospace"
                    placeholder="Enter amount"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    min="1"
                    style={{ color: '#0284c7', borderColor: '#bae6fd' }}
                    required
                  />
                  <div className="d-flex flex-wrap gap-2 mt-2.5">
                    {[500, 1000, 2000, 5000].map((amt) => {
                      const isActive = parseInt(addAmount) === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          className="btn btn-sm rounded-pill fw-bold"
                          onClick={() => setAddAmount(amt.toString())}
                          style={{
                            fontSize: '12px',
                            padding: '6px 16px',
                            backgroundColor: isActive ? '#38bdf8' : '#f1f5f9',
                            color: isActive ? '#ffffff' : '#475569',
                            border: isActive ? '1px solid #38bdf8' : '1px solid #e2e8f0',
                            boxShadow: isActive ? '0 4px 10px rgba(56, 189, 248, 0.3)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          +₹{amt.toLocaleString('en-IN')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Method Selector for Top-Up */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark-blue mb-1">Select Payment Mode:</label>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm flex-grow-1 p-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-bold"
                      style={{
                        backgroundColor: addPaymentMode === 'UPI' ? '#e0f2fe' : '#f8fafc',
                        color: addPaymentMode === 'UPI' ? '#0ea5e9' : '#64748b',
                        border: addPaymentMode === 'UPI' ? '2px solid #38bdf8' : '1px solid #cbd5e1',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => setAddPaymentMode('UPI')}
                    >
                      <FaMobileAlt /> Enter UPI ID
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm flex-grow-1 p-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-bold"
                      style={{
                        backgroundColor: addPaymentMode === 'QR' ? '#e0f2fe' : '#f8fafc',
                        color: addPaymentMode === 'QR' ? '#0ea5e9' : '#64748b',
                        border: addPaymentMode === 'QR' ? '2px solid #38bdf8' : '1px solid #cbd5e1',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => setAddPaymentMode('QR')}
                    >
                      <FaQrcode /> Scan QR Code
                    </button>
                  </div>
                </div>

                {addPaymentMode === 'UPI' && (
                  <div className="mb-4 animate-fade-in">
                    <label className="form-label small fw-bold text-dark-blue mb-1">Enter Your UPI ID:</label>
                    <input
                      type="text"
                      className="form-control rounded-3 py-2.5"
                      placeholder="Enter UPI ID"
                      value={addUpiId}
                      onChange={(e) => setAddUpiId(e.target.value)}
                      style={{ borderColor: '#cbd5e1' }}
                      required
                    />
                  </div>
                )}

                {addPaymentMode === 'QR' && (
                  <div className="text-center py-3 rounded-4 mb-4 border animate-fade-in" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <span className="small text-muted fw-bold d-block mb-1">Scan & Pay via GPay / PhonePe / Paytm / BHIM</span>
                    <div className="p-2.5 bg-white d-inline-block rounded-3 border shadow-sm my-1">
                      <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="130" height="130" fill="white"/>
                        <rect x="10" y="10" width="35" height="35" fill="#1e293b"/>
                        <rect x="15" y="15" width="25" height="25" fill="white"/>
                        <rect x="20" y="20" width="15" height="15" fill="#38bdf8"/>
                        <rect x="85" y="10" width="35" height="35" fill="#1e293b"/>
                        <rect x="90" y="15" width="25" height="25" fill="white"/>
                        <rect x="95" y="20" width="15" height="15" fill="#38bdf8"/>
                        <rect x="10" y="85" width="35" height="35" fill="#1e293b"/>
                        <rect x="15" y="90" width="25" height="25" fill="white"/>
                        <rect x="20" y="95" width="15" height="15" fill="#38bdf8"/>
                        <rect x="55" y="15" width="15" height="15" fill="#1e293b"/>
                        <rect x="55" y="35" width="15" height="15" fill="#38bdf8"/>
                        <rect x="75" y="55" width="15" height="15" fill="#1e293b"/>
                        <rect x="15" y="55" width="15" height="15" fill="#38bdf8"/>
                        <rect x="35" y="75" width="15" height="15" fill="#1e293b"/>
                        <rect x="55" y="75" width="25" height="25" fill="#38bdf8"/>
                        <rect x="95" y="55" width="25" height="25" fill="#1e293b"/>
                        <rect x="85" y="95" width="35" height="25" fill="#38bdf8"/>
                      </svg>
                    </div>
                    <div className="fw-bold font-monospace mt-1" style={{ color: '#0ea5e9' }}>Top-Up Amount: ₹{parseInt(addAmount || 0).toLocaleString('en-IN')}</div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn w-100 py-3 rounded-pill fw-bold text-white shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                    border: 'none',
                    boxShadow: '0 6px 16px rgba(56, 189, 248, 0.35)',
                    transition: 'all 0.3s ease'
                  }}
                  disabled={addMoneyLoading}
                >
                  {addMoneyLoading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  ) : (
                    `💳 Pay & Add ₹${parseInt(addAmount || 0).toLocaleString('en-IN')} to Wallet`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
