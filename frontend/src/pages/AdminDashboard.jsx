import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaPlane, FaHotel, FaBus, FaSuitcase, FaTag, FaStar, FaUsers, FaPlus, FaTrash, FaEdit, FaCheckCircle, FaTimesCircle, FaCoins, FaTicketAlt, FaUserCheck, FaBuilding, FaDatabase, FaPercent, FaEye, FaCar, FaEnvelope } from 'react-icons/fa';
import { MdMonetizationOn, MdReceiptLong, MdPeople, MdFlight, MdHotel, MdTrain, MdCardTravel, MdDirectionsCar, MdDirectionsBus, MdConfirmationNumber, MdModeEdit, MdDeleteOutline } from 'react-icons/md';
import api from '../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, flights, hotels, buses, packages, coupons, users

  // Items lists
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [buses, setBuses] = useState([]);
  const [packages, setPackages] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [trains, setTrains] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [cars, setCars] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit / Add Form Modal states
  const [editItem, setEditItem] = useState(null); // holds item being edited
  const [isAddMode, setIsAddMode] = useState(false); // true if adding new item
  const [formFields, setFormFields] = useState({});
  const [formErrors, setFormErrors] = useState('');

  // Profile states
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [activeGraphType, setActiveGraphType] = useState('revenue'); // revenue, bookings, accounts
  const [viewItem, setViewItem] = useState(null);
  const [viewType, setViewType] = useState(null); // 'booking' or 'user'
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const checkAdminAuth = () => {
    const token = localStorage.getItem('access_token');
    const isStaff = localStorage.getItem('is_staff') === 'true';
    const username = localStorage.getItem('username');
    if (!token || (!isStaff && username !== 'admin')) {
      alert("Access Denied: Admin credentials required.");
      navigate('/');
    }
  };

  const [selectedAnalyticsYear, setSelectedAnalyticsYear] = useState(new Date().getFullYear());

  const fetchAnalytics = async (yearVal) => {
    try {
      const yr = yearVal || selectedAnalyticsYear;
      const res = await api.get(`bookings/analytics/?year=${yr}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  };

  const fetchInventoryData = async (yearVal) => {
    setLoading(true);
    try {
      const yr = yearVal || selectedAnalyticsYear;
      await fetchAnalytics(yr);

      const [flightsRes, hotelsRes, busesRes, packagesRes, couponsRes, usersRes, bookingsRes, trainsRes, inquiriesRes, carsRes] = await Promise.all([
        api.get('flights/').catch(err => { console.error("Failed to load flights", err); return { data: [] }; }),
        api.get('hotels/').catch(err => { console.error("Failed to load hotels", err); return { data: [] }; }),
        api.get('buses/').catch(err => {
          console.warn("Buses endpoint not found in backend, returning simulated bus registry.");
          return {
            data: [
              { id: 1, operator: "IntrCity SmartBus", source_city: "Delhi", destination_city: "Manali", bus_type: "AC Sleeper (2+1)", price: 1200 },
              { id: 2, operator: "Zingbus", source_city: "Mumbai", destination_city: "Goa", bus_type: "Volvo Multi-Axle A/C Semi Sleeper", price: 1450 },
              { id: 3, operator: "VRL Travels", source_city: "Bangalore", destination_city: "Pune", bus_type: "Volvo A/C Multi-Axle Sleeper", price: 1800 },
              { id: 4, operator: "National Travels", source_city: "Delhi", destination_city: "Jaipur", bus_type: "Mercedes Benz A/C Multi-Axle Semi Sleeper", price: 850 }
            ]
          };
        }),
        api.get('packages/').catch(err => { console.error("Failed to load packages", err); return { data: [] }; }),
        api.get('promotions/coupons/').catch(err => { console.error("Failed to load coupons", err); return { data: [] }; }),
        api.get('users/admin/list/').catch(err => { console.error("Failed to load users", err); return { data: [] }; }),
        api.get('bookings/?all=true').catch(err => { console.error("Failed to load bookings", err); return { data: [] }; }),
        api.get('trains/').catch(err => { console.error("Failed to load trains", err); return { data: [] }; }),
        api.get('support/inquiries/').catch(err => { console.error("Failed to load inquiries", err); return { data: [] }; }),
        api.get('cars/').catch(err => { console.error("Failed to load cars", err); return { data: [] }; })
      ]);

      setFlights(flightsRes.data);
      setHotels(hotelsRes.data);
      setBuses(busesRes.data);
      setPackages(packagesRes.data);
      setCoupons(couponsRes.data);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setTrains(trainsRes.data);
      setInquiries(inquiriesRes.data);
      setCars(carsRes.data);

      try {
        const profileRes = await api.get('users/profile/');
        setProfile(profileRes.data);
        setAvatarUrl(profileRes.data.profile?.avatar_url || '');
      } catch (profileErr) {
        console.error("Failed to load admin profile details", profileErr);
      }
    } catch (err) {
      console.error("Failed to load inventory logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAuth();
    fetchInventoryData();
  }, []);

  useEffect(() => {
    if (analytics) {
      fetchAnalytics(selectedAnalyticsYear);
    }
  }, [selectedAnalyticsYear]);

  useEffect(() => {
    setEditItem(null);
    setIsAddMode(false);
  }, [activeTab]);

  const handleDelete = async (cat, id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    setActionLoading(true);
    try {
      let endpoint = '';
      if (cat === 'flight') endpoint = `flights/${id}/`;
      else if (cat === 'hotel') endpoint = `hotels/${id}/`;
      else if (cat === 'bus') endpoint = `buses/${id}/`;
      else if (cat === 'train') endpoint = `trains/${id}/`;
      else if (cat === 'package') endpoint = `packages/${id}/`;
      else if (cat === 'coupon') endpoint = `promotions/coupons/${id}/`;
      else if (cat === 'user') endpoint = `users/admin/detail/${id}/`;
      else if (cat === 'inquiry') endpoint = `support/inquiries/${id}/`;
      else if (cat === 'car') endpoint = `cars/${id}/`;

      await api.delete(endpoint);
      alert("Deleted successfully!");
      fetchInventoryData();
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.detail || err.response?.data?.message || "Check permissions."));
    } finally {
      setActionLoading(false);
    }
  };

  const formatForDateTimeLocal = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getDefaultDateTime = (addHours = 0) => {
    const d = new Date();
    d.setHours(d.getHours() + addHours);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleOpenEdit = (item, tabType) => {
    setEditItem(item);
    setIsAddMode(false);
    setFormErrors('');
    const formatted = { ...item };
    if (formatted.departure_time) formatted.departure_time = formatForDateTimeLocal(formatted.departure_time);
    if (formatted.arrival_time) formatted.arrival_time = formatForDateTimeLocal(formatted.arrival_time);
    setFormFields(formatted);
  };

  const handleOpenAdd = (tabType) => {
    setEditItem(null);
    setIsAddMode(true);
    setFormErrors('');

    // Set initial structures based on category tab
    if (tabType === 'flights') {
      setFormFields({
        flight_number: '6E-101',
        airline: 'IndiGo',
        departure_city: 'Delhi',
        arrival_city: 'Mumbai',
        departure_time: getDefaultDateTime(2),
        arrival_time: getDefaultDateTime(5),
        price: '4500'
      });
    } else if (tabType === 'hotels') {
      setFormFields({
        name: '',
        city: 'Delhi',
        address: '',
        price_per_night: '3500',
        rating: '4.5',
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
      });
    } else if (tabType === 'buses') {
      setFormFields({
        operator: 'IntrCity SmartBus',
        bus_number: 'BUS-101',
        source_city: 'Delhi',
        destination_city: 'Manali',
        departure_time: getDefaultDateTime(2),
        arrival_time: getDefaultDateTime(12),
        price: '1200',
        bus_type: 'AC Sleeper (2+1)',
        total_seats: 30,
        available_seats: 30
      });
    } else if (tabType === 'trains') {
      setFormFields({
        name: 'Vande Bharat Express',
        train_number: '20901',
        source_city: 'Delhi',
        destination_city: 'Varanasi',
        departure_time: getDefaultDateTime(2),
        arrival_time: getDefaultDateTime(10),
        price: '1650',
        train_type: 'Vande Bharat EC',
        total_seats: 60,
        available_seats: 60
      });
    } else if (tabType === 'packages') {
      setFormFields({
        title: '',
        destination: 'Goa',
        price: '15000',
        rating: '4.5',
        duration: '5 Days / 4 Nights',
        image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
        description: '',
        category: 'Domestic'
      });
    } else if (tabType === 'coupons') {
      setFormFields({
        code: '',
        discount_percentage: '10.00',
        max_discount: '500.00',
        active: true,
        description: ''
      });
    } else if (tabType === 'users') {
      setFormFields({
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        is_staff: false,
        is_active: true
      });
    } else if (tabType === 'cars') {
      setFormFields({
        name: '',
        car_type: 'Sedan',
        transmission: 'Automatic',
        fuel_type: 'Petrol',
        rental_type: 'Self Drive',
        hourly_rate: '150.00',
        daily_rate: '1500.00',
        image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2',
        features: '["AC", "Airbags", "GPS"]'
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFormErrors('');
    try {
      let endpoint = '';
      if (activeTab === 'flights') endpoint = isAddMode ? 'flights/' : `flights/${editItem.id}/`;
      else if (activeTab === 'hotels') endpoint = isAddMode ? 'hotels/' : `hotels/${editItem.id}/`;
      else if (activeTab === 'buses') endpoint = isAddMode ? 'buses/' : `buses/${editItem.id}/`;
      else if (activeTab === 'trains') endpoint = isAddMode ? 'trains/' : `trains/${editItem.id}/`;
      else if (activeTab === 'packages') endpoint = isAddMode ? 'packages/' : `packages/${editItem.id}/`;
      else if (activeTab === 'coupons') endpoint = isAddMode ? 'promotions/coupons/' : `promotions/coupons/${editItem.id}/`;
      else if (activeTab === 'users') endpoint = isAddMode ? 'users/admin/list/' : `users/admin/detail/${editItem.id}/`;
      else if (activeTab === 'cars') endpoint = isAddMode ? 'cars/' : `cars/${editItem.id}/`;

      if (isAddMode) {
        await api.post(endpoint, formFields);
      } else {
        await api.put(endpoint, formFields);
      }

      alert(isAddMode ? "Item added successfully!" : "Item updated successfully!");
      setEditItem(null);
      setIsAddMode(false);
      fetchInventoryData();
    } catch (err) {
      const errData = err.response?.data;
      let errMsg = "Submission failed: Please review input formatting.";
      if (errData) {
        if (typeof errData === 'string') errMsg = errData;
        else if (errData.detail) errMsg = errData.detail;
        else if (errData.error) errMsg = errData.error;
        else if (typeof errData === 'object') {
          const msgs = Object.entries(errData)
            .map(([k, v]) => `${k.replace('_', ' ')}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ');
          errMsg = msgs || errMsg;
        }
      }
      setFormErrors(errMsg);
      alert("Submission failed:\n" + errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleUserStatus = async (user) => {
    setActionLoading(true);
    try {
      await api.put(`users/admin/detail/${user.id}/`, {
        username: user.username,
        is_active: !user.is_active
      });
      alert(`User ${user.username} status toggled!`);
      fetchInventoryData();
    } catch (err) {
      alert("Failed to toggle status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? Refund will be credited back to the user's wallet.")) return;
    setActionLoading(true);
    try {
      await api.post(`bookings/${bookingId}/cancel/`);
      alert("Booking cancelled successfully!");
      fetchInventoryData();
    } catch (err) {
      alert("Failed to cancel booking: " + (err.response?.data?.detail || err.response?.data?.message || "Check permissions."));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2 text-muted">Running admin analytical processes...</p>
      </div>
    );
  }

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
    const matchesType = bookingTypeFilter === 'all' || b.booking_type === bookingTypeFilter;
    return matchesStatus && matchesType;
  });

  const getBookingTypeCount = (type) => {
    if (type === 'all') return bookings.length;
    return bookings.filter(b => b.booking_type === type).length;
  };

  return (
    <div className="container py-5">
      <div className="dashboard-outer-container">
        <div className="dashboard-layout">
          {/* Sidebar */}
          <div className="dashboard-sidebar">
            <div>
              <div className="dashboard-profile-section">
                <img
                  id="profileImage"
                  src={avatarUrl || "https://i.pravatar.cc/150?img=12"}
                  alt="Admin Avatar"
                />
                <div className="dashboard-profile-text">
                  <h3>{profile?.first_name || 'Admin'} {profile?.last_name || ''}</h3>
                  <p>System Administrator</p>
                </div>
              </div>

              <div className="dashboard-menu">
                <button
                  className={activeTab === 'analytics' ? 'active' : ''}
                  onClick={() => setActiveTab('analytics')}
                >
                  Live Analytics
                </button>
                <button
                  className={activeTab === 'bookings' ? 'active' : ''}
                  onClick={() => setActiveTab('bookings')}
                >
                  Bookings Database
                </button>
                <button
                  className={activeTab === 'flights' ? 'active' : ''}
                  onClick={() => setActiveTab('flights')}
                >
                  Flight Inventory
                </button>
                <button
                  className={activeTab === 'hotels' ? 'active' : ''}
                  onClick={() => setActiveTab('hotels')}
                >
                  Hotel Registry
                </button>
                <button
                  className={activeTab === 'buses' ? 'active' : ''}
                  onClick={() => setActiveTab('buses')}
                >
                  Bus Systems
                </button>
                <button
                  className={activeTab === 'trains' ? 'active' : ''}
                  onClick={() => setActiveTab('trains')}
                >
                  Train Registry
                </button>
                <button
                  className={activeTab === 'packages' ? 'active' : ''}
                  onClick={() => setActiveTab('packages')}
                >
                  Holiday Packages
                </button>
                <button
                  className={activeTab === 'cars' ? 'active' : ''}
                  onClick={() => setActiveTab('cars')}
                >
                  Car Rentals Registry
                </button>
                <button
                  className={activeTab === 'coupons' ? 'active' : ''}
                  onClick={() => setActiveTab('coupons')}
                >
                  Promo Coupons
                </button>
                <button
                  className={activeTab === 'users' ? 'active' : ''}
                  onClick={() => setActiveTab('users')}
                >
                  Accounts Management
                </button>
                <button
                  className={activeTab === 'inquiries' ? 'active' : ''}
                  onClick={() => setActiveTab('inquiries')}
                >
                  Customer Inquiries
                </button>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="mt-4 pt-3 border-top border-secondary-subtle">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-warning w-100 btn-sm fw-bold text-white shadow-sm mt-2 rounded-3"
              >
                Return User Dashboard
              </button>
            </div>
          </div>

          {/* Dynamic Content Panels */}
          <div className="dashboard-content-area text-start">
            {actionLoading && <div className="alert alert-info py-2 small">Processing update requests...</div>}

            {/* Analytics Panel */}
            <div className={`dashboard-page ${activeTab === 'analytics' ? 'active' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 fw-bold" style={{ color: '#0284c7' }}>Live Analytical Statistics</h2>
                <span className="badge bg-white text-muted border px-3 py-2 rounded-pill fw-semibold shadow-sm">
                  🔄 Auto-updated live
                </span>
              </div>

              {analytics && (
                <div className="animate-fade-in">

                  {/* KPI Cards */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="card border border-light-subtle shadow-sm rounded-4 p-4 position-relative overflow-hidden hover-up bg-white">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="text-muted fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.5px', fontSize: '11px' }}>Total Revenue</h6>
                            <h2 className="fw-bold mb-0 text-dark-blue" style={{ fontSize: '30px' }}>₹{Math.floor(analytics.total_revenue).toLocaleString('en-IN')}</h2>
                          </div>
                          <span className="d-flex align-items-center justify-content-center border rounded-circle" style={{ width: '54px', height: '54px', backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}>
                            <MdMonetizationOn size={24} />
                          </span>
                        </div>
                        <div className="mt-3 small text-muted">
                          Confirmed sales transaction flow
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="card border border-light-subtle shadow-sm rounded-4 p-4 position-relative overflow-hidden hover-up bg-white">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="text-muted fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.5px', fontSize: '11px' }}>Total Bookings</h6>
                            <h2 className="fw-bold mb-0 text-dark-blue" style={{ fontSize: '30px' }}>{analytics.total_bookings}</h2>
                          </div>
                          <span className="d-flex align-items-center justify-content-center border rounded-circle" style={{ width: '54px', height: '54px', backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}>
                            <MdReceiptLong size={24} />
                          </span>
                        </div>
                        <div className="mt-3 small text-muted">
                          Successful platform bookings
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="card border border-light-subtle shadow-sm rounded-4 p-4 position-relative overflow-hidden hover-up bg-white">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="text-muted fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.5px', fontSize: '11px' }}>Total Accounts</h6>
                            <h2 className="fw-bold mb-0 text-dark-blue" style={{ fontSize: '30px' }}>{analytics.total_users}</h2>
                          </div>
                          <span className="d-flex align-items-center justify-content-center border rounded-circle" style={{ width: '54px', height: '54px', backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}>
                            <MdPeople size={24} />
                          </span>
                        </div>
                        <div className="mt-3 small text-muted fw-semibold">
                          Normal Users: {analytics.total_normal_users || 0} | Staff Admins: {analytics.total_staff || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue category split bars & Monthly flow grid */}
                  <div className="row g-4 mb-4">

                    {/* Category split bars */}
                    <div className="col-md-6">
                      <div className="card border border-light-subtle shadow-sm rounded-4 p-4 h-100 bg-white">
                        <h5 className="fw-bold text-dark-blue mb-4 d-flex align-items-center gap-2">
                          Sales Split by Category
                        </h5>
                        <div className="d-flex flex-column gap-3">
                          {Object.entries(analytics.category_stats).map(([cat, stats]) => {
                            const pct = analytics.total_revenue > 0 ? (stats.revenue / analytics.total_revenue) * 100 : 0;
                            const icons = {
                              flight: <MdFlight size={18} />,
                              hotel: <MdHotel size={18} />,
                              train: <MdTrain size={18} />,
                              bus: <MdDirectionsBus size={18} />,
                              package: <MdCardTravel size={18} />,
                              car: <MdDirectionsCar size={18} />
                            };
                            const colors = {
                              flight: '#0ea5e9', // Sky blue
                              hotel: '#38bdf8', // Light sky blue
                              train: '#7dd3fc', // Lighter sky blue
                              bus: '#38bdf8',
                              package: '#bae6fd', // Very light sky blue
                              car: '#e0f2fe' // Softest sky blue
                            };
                            const icon = icons[cat] || <span style={{ fontSize: '18px' }}>🌐</span>;
                            const barColor = colors[cat] || '#0ea5e9';

                            return (
                              <div key={cat} className="p-3 rounded-3 border border-light-subtle bg-light bg-opacity-25 transition-all hover-shadow">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="d-flex align-items-center justify-content-center border rounded-circle" style={{ width: '36px', height: '36px', backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}>
                                      {icon}
                                    </span>
                                    <span className="fw-bold text-capitalize text-dark" style={{ fontSize: '14px' }}>{cat}s</span>
                                    <span className="badge bg-white text-muted border rounded-pill fw-normal" style={{ fontSize: '11px' }}>{stats.count} bookings</span>
                                  </div>
                                  <div className="text-end">
                                    <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>₹{Math.floor(stats.revenue).toLocaleString('en-IN')}</span>
                                    <span className="text-muted ms-2 small">({Math.round(pct)}%)</span>
                                  </div>
                                </div>
                                <div className="progress rounded-pill" style={{ height: '8px', backgroundColor: '#f1f5f9' }}>
                                  <div
                                    className="progress-bar rounded-pill transition-all duration-500"
                                    role="progressbar"
                                    style={{
                                      width: `${pct}%`,
                                      backgroundColor: barColor,
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Chart simulation */}
                    <div className="col-md-6">
                      <div className="card border border-light-subtle shadow-sm rounded-4 p-4 h-100 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                          <h5 className="fw-bold text-dark-blue mb-0">Monthly Trend Analytics</h5>

                          {/* Toggle Pills */}
                          <div className="btn-group shadow-sm bg-light p-1 rounded-pill" role="group">
                            <button
                              type="button"
                              className={`btn btn-sm rounded-pill px-3 py-1 fw-bold ${activeGraphType === 'revenue' ? 'btn-primary text-white' : 'btn-light border-0 text-muted'}`}
                              style={{ fontSize: '11px', transition: 'all 0.2s' }}
                              onClick={() => setActiveGraphType('revenue')}
                            >
                              Revenue
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm rounded-pill px-3 py-1 fw-bold ${activeGraphType === 'bookings' ? 'btn-primary text-white' : 'btn-light border-0 text-muted'}`}
                              style={{ fontSize: '11px', transition: 'all 0.2s' }}
                              onClick={() => setActiveGraphType('bookings')}
                            >
                              Bookings
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm rounded-pill px-3 py-1 fw-bold ${activeGraphType === 'accounts' ? 'btn-primary text-white' : 'btn-light border-0 text-muted'}`}
                              style={{ fontSize: '11px', transition: 'all 0.2s' }}
                              onClick={() => setActiveGraphType('accounts')}
                            >
                              Accounts
                            </button>
                          </div>
                        </div>

                        <div className="position-relative d-flex justify-content-between align-items-stretch" style={{ height: '220px', paddingBottom: '20px' }}>

                          {/* Grid backdrop */}
                          <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-between" style={{ pointerEvents: 'none', top: 0, left: 0, paddingBottom: '20px' }}>
                            <div className="border-bottom border-dashed w-100" style={{ borderColor: '#f1f5f9' }}></div>
                            <div className="border-bottom border-dashed w-100" style={{ borderColor: '#f1f5f9' }}></div>
                            <div className="border-bottom border-dashed w-100" style={{ borderColor: '#f1f5f9' }}></div>
                            <div className="border-bottom border-dashed w-100" style={{ borderColor: '#f1f5f9' }}></div>
                          </div>

                          {(() => {
                            const activeData = activeGraphType === 'revenue'
                              ? (analytics.revenue_graph || [])
                              : activeGraphType === 'bookings'
                                ? (analytics.bookings_graph || [])
                                : (analytics.accounts_graph || []);

                            const maxVal = Math.max(...activeData.map(g => g.value)) || 1;

                            return activeData.map((graph, idx) => {
                              const heightPct = (graph.value / maxVal) * 150;

                              // Format graph bar color to light sky blue gradient
                              const barGradient = 'linear-gradient(180deg, #bae6fd 0%, #38bdf8 100%)';

                              // Format values in labels
                              const labelVal = activeGraphType === 'revenue'
                                ? `₹${Math.round(graph.value / 1000)}k`
                                : graph.value;

                              const tooltipVal = activeGraphType === 'revenue'
                                ? `₹${Math.floor(graph.value).toLocaleString('en-IN')}`
                                : `${graph.value} ${activeGraphType}`;

                              return (
                                <div key={idx} className="d-flex flex-column align-items-center justify-content-end flex-grow-1 h-100 position-relative group" style={{ zIndex: 2 }}>
                                  <span className="small text-muted mb-2 fw-semibold" style={{ fontSize: '10px' }}>
                                    {labelVal}
                                  </span>
                                  <div
                                    className="rounded-top w-50 animate-bar"
                                    style={{
                                      height: `${heightPct}px`,
                                      minHeight: '2px',
                                      background: barGradient,
                                      transition: 'all 0.3s ease',
                                      cursor: 'pointer'
                                    }}
                                    title={`${activeGraphType.toUpperCase()} for ${graph.month}: ${tooltipVal}`}
                                  ></div>
                                  <span className="small mt-2 fw-bold text-muted" style={{ fontSize: '11px' }}>{graph.month}</span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Month-wise Breakdown Table */}
                  <div className="card border border-light-subtle shadow-sm rounded-4 p-4 mb-4 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                      <h5 className="fw-bold text-dark-blue mb-0 d-flex align-items-center gap-2">
                        📊 Month-wise Revenue & Bookings Summary
                      </h5>
                      {analytics && analytics.available_years && (
                        <div className="d-flex align-items-center gap-2">
                          <span className="small text-muted fw-bold" style={{ fontSize: '12px' }}>Select Year:</span>
                          <select
                            className="form-select form-select-sm rounded-pill px-3 fw-bold border-secondary-subtle bg-light"
                            style={{ width: '110px', fontSize: '12px', cursor: 'pointer' }}
                            value={selectedAnalyticsYear}
                            onChange={(e) => setSelectedAnalyticsYear(parseInt(e.target.value))}
                          >
                            {analytics.available_years.map((yr) => (
                              <option key={yr} value={yr}>
                                {yr}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {analytics && (
                      <div className="d-flex flex-wrap gap-3 mb-3 p-3 bg-light rounded-4 border border-light-subtle align-items-center">
                        <div className="small text-muted fw-semibold">
                          Selected Year ({selectedAnalyticsYear}) Total Revenue: <span className="fw-bold text-success">₹{Math.floor(analytics.selected_year_revenue || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="small text-muted fw-semibold border-start ps-3">
                          Total Bookings: <span className="fw-bold text-dark-blue">{analytics.selected_year_bookings || 0} bookings</span>
                        </div>
                      </div>
                    )}

                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
                        <thead className="table-light">
                          <tr>
                            <th className="fw-bold" style={{ color: '#0284c7' }}>Month</th>
                            <th className="fw-bold" style={{ color: '#0284c7' }}>Total Revenue</th>
                            <th className="fw-bold" style={{ color: '#0284c7' }}>Total Bookings</th>
                            <th className="fw-bold" style={{ color: '#0284c7' }}>New Accounts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(analytics.revenue_graph || []).map((item, idx) => {
                            const revVal = item.value;
                            const bookVal = analytics.bookings_graph[idx]?.value || 0;
                            const accVal = analytics.accounts_graph[idx]?.value || 0;
                            
                            return (
                              <tr key={idx}>
                                <td className="fw-bold text-dark">{item.month}</td>
                                <td className="fw-bold text-success">₹{Math.floor(revVal).toLocaleString('en-IN')}</td>
                                <td className="fw-semibold text-dark-blue">{bookVal} bookings</td>
                                <td className="text-muted">{accVal} registrations</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Inventory Summary insights */}
                  <div className="card border border-light-subtle shadow-sm rounded-4 p-4 mb-2 bg-white">
                    <h5 className="fw-bold text-dark-blue mb-4 d-flex align-items-center gap-2">
                      Database Inventory Overview
                    </h5>
                    <div className="row g-3 row-cols-2 row-cols-md-5">
                      <div className="col">
                        <div className="p-3 rounded-4 text-center border bg-white border-light-subtle shadow-sm h-100 transition-all hover-up">
                          <span className="d-flex align-items-center justify-content-center mx-auto mb-2 border rounded-circle" style={{ width: '46px', height: '46px', backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}>
                            <MdFlight size={20} />
                          </span>
                          <span className="small text-muted fw-bold">Active Flights</span>
                          <h3 className="fw-bold mb-0 mt-1 text-dark-blue">{flights.length}</h3>
                        </div>
                      </div>
                      <div className="col">
                        <div className="p-3 rounded-4 text-center border bg-white border-light-subtle shadow-sm h-100 transition-all hover-up">
                          <span className="d-flex align-items-center justify-content-center mx-auto mb-2 border rounded-circle" style={{ width: '46px', height: '46px', backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}>
                            <MdHotel size={20} />
                          </span>
                          <span className="small text-muted fw-bold">Hotels Registered</span>
                          <h3 className="fw-bold mb-0 mt-1 text-dark-blue">{hotels.length}</h3>
                        </div>
                      </div>
                      <div className="col">
                        <div className="p-3 rounded-4 text-center border bg-white border-light-subtle shadow-sm h-100 transition-all hover-up">
                          <span className="d-flex align-items-center justify-content-center mx-auto mb-2 border rounded-circle" style={{ width: '46px', height: '46px', backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}>
                            <MdDirectionsBus size={20} />
                          </span>
                          <span className="small text-muted fw-bold">Buses Active</span>
                          <h3 className="fw-bold mb-0 mt-1 text-dark-blue">{buses.length}</h3>
                        </div>
                      </div>
                      <div className="col">
                        <div className="p-3 rounded-4 text-center border bg-white border-light-subtle shadow-sm h-100 transition-all hover-up">
                          <span className="d-flex align-items-center justify-content-center mx-auto mb-2 border rounded-circle" style={{ width: '46px', height: '46px', backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}>
                            <MdTrain size={20} />
                          </span>
                          <span className="small text-muted fw-bold">Trains Active</span>
                          <h3 className="fw-bold mb-0 mt-1 text-dark-blue">{trains.length}</h3>
                        </div>
                      </div>
                      <div className="col">
                        <div className="p-3 rounded-4 text-center border bg-white border-light-subtle shadow-sm h-100 transition-all hover-up">
                          <span className="d-flex align-items-center justify-content-center mx-auto mb-2 border rounded-circle" style={{ width: '46px', height: '46px', backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}>
                            <MdConfirmationNumber size={20} />
                          </span>
                          <span className="small text-muted fw-bold">Promo Coupons</span>
                          <h3 className="fw-bold mb-0 mt-1 text-dark-blue">{coupons.length}</h3>
                        </div>
                      </div>
                      <div className="col">
                        <div className="p-3 rounded-4 text-center border bg-white border-light-subtle shadow-sm h-100 transition-all hover-up">
                          <span className="d-flex align-items-center justify-content-center mx-auto mb-2 border rounded-circle" style={{ width: '46px', height: '46px', backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}>
                            <MdDirectionsCar size={20} />
                          </span>
                          <span className="small text-muted fw-bold">Cars Available</span>
                          <h3 className="fw-bold mb-0 mt-1 text-dark-blue">{cars.length}</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Form Modal overlays (rendered inline for self-contained UI) */}
            {(editItem || isAddMode) && (
              <div className="card border-0 shadow-lg rounded-4 p-4 mb-4 bg-white border-2 border-primary-subtle animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#0284c7' }}>
                    <FaPlus className="text-primary" />
                    {isAddMode ? `Add New ${activeTab.slice(0, -1).toUpperCase()} Entry` : `Edit ${activeTab.slice(0, -1).toUpperCase()} ID #${editItem.id}`}
                  </h5>
                  <button type="button" onClick={() => { setEditItem(null); setIsAddMode(false); setFormErrors(''); }} className="btn-close" aria-label="Close"></button>
                </div>

                {formErrors && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 fw-bold">
                    ⚠️ {formErrors}
                  </div>
                )}

                <form onSubmit={handleFormSubmit}>
                  <div className="row g-3">
                    {Object.keys(formFields).map((field) => {
                      if (field === 'id' || field === 'profile' || field === 'booked_seats') return null;

                      let inputElement = null;
                      const fieldLabel = field.replace('_', ' ').toUpperCase();

                      if (field === 'departure_time' || field === 'arrival_time') {
                        inputElement = (
                          <input
                            type="datetime-local"
                            className="dashboard-input form-control rounded-3"
                            value={formFields[field] || ''}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                            required
                          />
                        );
                      } else if (field === 'airline') {
                        inputElement = (
                          <select
                            className="dashboard-input form-select rounded-3"
                            value={formFields[field] || 'IndiGo'}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                          >
                            <option value="IndiGo">IndiGo</option>
                            <option value="Air India">Air India</option>
                            <option value="Vistara">Vistara</option>
                            <option value="SpiceJet">SpiceJet</option>
                            <option value="Akasa Air">Akasa Air</option>
                            <option value="AirAsia">AirAsia</option>
                          </select>
                        );
                      } else if (field === 'bus_type') {
                        inputElement = (
                          <select
                            className="dashboard-input form-select rounded-3"
                            value={formFields[field] || 'AC Sleeper (2+1)'}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                          >
                            <option value="AC Sleeper (2+1)">AC Sleeper (2+1)</option>
                            <option value="Volvo Multi-Axle A/C Semi Sleeper">Volvo Multi-Axle A/C Semi Sleeper</option>
                            <option value="Volvo A/C Multi-Axle Sleeper">Volvo A/C Multi-Axle Sleeper</option>
                            <option value="Mercedes Benz A/C Semi Sleeper">Mercedes Benz A/C Semi Sleeper</option>
                            <option value="AC Seater (2+2)">AC Seater (2+2)</option>
                            <option value="Non-AC Sleeper">Non-AC Sleeper</option>
                          </select>
                        );
                      } else if (field === 'train_type') {
                        inputElement = (
                          <select
                            className="dashboard-input form-select rounded-3"
                            value={formFields[field] || 'Vande Bharat EC'}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                          >
                            <option value="Vande Bharat EC">Vande Bharat EC</option>
                            <option value="Rajdhani 1AC/2AC/3AC">Rajdhani Express (1AC/2AC/3AC)</option>
                            <option value="Superfast Express 3AC/SL">Superfast Express (3AC/SL)</option>
                            <option value="Tejas Express">Tejas Express</option>
                            <option value="Shatabdi Chair Car">Shatabdi (EC/CC)</option>
                          </select>
                        );
                      } else if (field === 'transmission') {
                        inputElement = (
                          <select
                            className="dashboard-input form-select rounded-3"
                            value={formFields[field] || 'Automatic'}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                          >
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                          </select>
                        );
                      } else if (field === 'fuel_type') {
                        inputElement = (
                          <select
                            className="dashboard-input form-select rounded-3"
                            value={formFields[field] || 'Petrol'}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                          >
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="EV">EV (Electric)</option>
                            <option value="CNG">CNG</option>
                          </select>
                        );
                      } else if (field === 'rental_type') {
                        inputElement = (
                          <select
                            className="dashboard-input form-select rounded-3"
                            value={formFields[field] || 'Self Drive'}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                          >
                            <option value="Self Drive">Self Drive</option>
                            <option value="Driver Included">Driver Included</option>
                            <option value="Airport Pickup">Airport Pickup</option>
                            <option value="Hourly Rental">Hourly Rental</option>
                          </select>
                        );
                      } else if (field === 'car_type') {
                        inputElement = (
                          <select
                            className="dashboard-input form-select rounded-3"
                            value={formFields[field] || 'Sedan'}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                          >
                            <option value="Hatchback">Hatchback</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Luxury">Luxury</option>
                          </select>
                        );
                      } else if (field === 'category') {
                        inputElement = (
                          <select
                            className="dashboard-input form-select rounded-3"
                            value={formFields[field] || 'Domestic'}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                          >
                            <option value="Domestic">Domestic</option>
                            <option value="International">International</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Honeymoon">Honeymoon</option>
                          </select>
                        );
                      } else if (field === 'active' || field === 'is_staff' || field === 'is_active') {
                        inputElement = (
                          <select
                            className="dashboard-input form-select rounded-3"
                            value={formFields[field] === true || formFields[field] === 'true' ? 'true' : 'false'}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value === 'true' })}
                          >
                            <option value="true">True (Active/Granted)</option>
                            <option value="false">False (Disabled/Standard)</option>
                          </select>
                        );
                      } else if (field === 'price' || field === 'price_per_night' || field === 'daily_rate' || field === 'hourly_rate' || field === 'max_discount' || field === 'discount_percentage') {
                        inputElement = (
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 fw-bold">{field.includes('percentage') ? '%' : '₹'}</span>
                            <input
                              type="number"
                              step="any"
                              className="dashboard-input form-control rounded-end-3"
                              value={formFields[field] || ''}
                              onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                              required
                            />
                          </div>
                        );
                      } else if (field === 'rating') {
                        inputElement = (
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            className="dashboard-input form-control rounded-3"
                            value={formFields[field] || '4.5'}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                            required
                          />
                        );
                      } else if (field === 'total_seats' || field === 'available_seats') {
                        inputElement = (
                          <input
                            type="number"
                            className="dashboard-input form-control rounded-3"
                            value={formFields[field] || ''}
                            onChange={(e) => setFormFields({ ...formFields, [field]: parseInt(e.target.value) || 0 })}
                            required
                          />
                        );
                      } else if (field === 'description' || field === 'address') {
                        inputElement = (
                          <textarea
                            className="dashboard-input form-control rounded-3"
                            rows="2"
                            value={formFields[field] || ''}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                          ></textarea>
                        );
                      } else if (field === 'password') {
                        inputElement = (
                          <input
                            type="password"
                            className="dashboard-input form-control rounded-3"
                            placeholder={isAddMode ? "Account Password" : "Leave blank to keep existing password"}
                            value={formFields[field] || ''}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                          />
                        );
                      } else {
                        inputElement = (
                          <input
                            type="text"
                            className="dashboard-input form-control rounded-3"
                            value={formFields[field] || ''}
                            onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })}
                            required={field !== 'image_url' && field !== 'features' && field !== 'description'}
                          />
                        );
                      }

                      return (
                        <div key={field} className="col-md-6 text-start">
                          <label className="form-label small fw-bold text-muted mb-1">{fieldLabel}</label>
                          {inputElement}
                          {field === 'image_url' && formFields[field] && (
                            <div className="mt-2 text-start">
                              <small className="text-muted d-block">Preview:</small>
                              <img src={formFields[field]} alt="preview" className="rounded-3 border" style={{ height: '50px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="d-flex gap-2 mt-4 border-top pt-3">
                    <button type="submit" className="btn btn-warning px-5 py-2 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center gap-2">
                      <FaCheckCircle /> {isAddMode ? 'Save & Create Entry' : 'Update Changes'}
                    </button>
                    <button type="button" onClick={() => { setEditItem(null); setIsAddMode(false); setFormErrors(''); }} className="btn btn-outline-secondary rounded-pill px-4">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Flights list */}
            <div className={`dashboard-page ${activeTab === 'flights' ? 'active' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 className="mb-0">Flights Registry</h2>
                <button onClick={() => handleOpenAdd('flights')} className="btn btn-warning btn-sm text-white rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
                  <FaPlus size={10} /> Add Flight
                </button>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Flight Num</th>
                      <th>Airline</th>
                      <th>Route</th>
                      <th>Fare</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map(f => (
                      <tr key={f.id}>
                        <td className="fw-bold">{f.flight_number}</td>
                        <td>{f.airline}</td>
                        <td>{f.departure_city} ➔ {f.arrival_city}</td>
                        <td>₹{Math.floor(f.price)}</td>
                        <td>
                          <button onClick={() => handleOpenEdit(f, 'flights')} className="btn btn-link text-dark p-1" title="Edit Flight"><MdModeEdit size={18} /></button>
                          <button onClick={() => handleDelete('flight', f.id)} className="btn btn-link text-dark p-1" title="Delete Flight"><MdDeleteOutline size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hotels list */}
            <div className={`dashboard-page ${activeTab === 'hotels' ? 'active' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 className="mb-0">Hotel Accommodations</h2>
                <button onClick={() => handleOpenAdd('hotels')} className="btn btn-warning btn-sm text-white rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
                  <FaPlus size={10} /> Add Hotel
                </button>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Hotel Name</th>
                      <th>City</th>
                      <th>Address</th>
                      <th>Price/Night</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotels.map(h => (
                      <tr key={h.id}>
                        <td className="fw-bold">{h.name}</td>
                        <td>{h.city}</td>
                        <td className="text-truncate" style={{ maxWidth: '150px' }}>{h.address}</td>
                        <td>₹{Math.floor(h.price_per_night)}</td>
                        <td>★ {h.rating}</td>
                        <td>
                          <button onClick={() => handleOpenEdit(h, 'hotels')} className="btn btn-link text-dark p-1" title="Edit Hotel"><MdModeEdit size={18} /></button>
                          <button onClick={() => handleDelete('hotel', h.id)} className="btn btn-link text-dark p-1" title="Delete Hotel"><MdDeleteOutline size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bus list */}
            <div className={`dashboard-page ${activeTab === 'buses' ? 'active' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 className="mb-0">Bus Registry</h2>
                <button onClick={() => handleOpenAdd('buses')} className="btn btn-warning btn-sm text-white rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
                  <FaPlus size={10} /> Add Bus
                </button>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Operator</th>
                      <th>Route</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map(b => (
                      <tr key={b.id}>
                        <td className="fw-bold">{b.operator}</td>
                        <td>{b.source_city} ➔ {b.destination_city}</td>
                        <td>{b.bus_type}</td>
                        <td>₹{Math.floor(b.price)}</td>
                        <td>
                          <button onClick={() => handleOpenEdit(b, 'buses')} className="btn btn-link text-dark p-1" title="Edit Bus"><MdModeEdit size={18} /></button>
                          <button onClick={() => handleDelete('bus', b.id)} className="btn btn-link text-dark p-1" title="Delete Bus"><MdDeleteOutline size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Train list */}
            <div className={`dashboard-page ${activeTab === 'trains' ? 'active' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 className="mb-0">Train Registry</h2>
                <button onClick={() => handleOpenAdd('trains')} className="btn btn-warning btn-sm text-white rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
                  <FaPlus size={10} /> Add Train
                </button>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Train Num</th>
                      <th>Train Name</th>
                      <th>Route</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Seats</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trains.map(t => (
                      <tr key={t.id}>
                        <td className="fw-bold">{t.train_number}</td>
                        <td>{t.name}</td>
                        <td>{t.source_city} ➔ {t.destination_city}</td>
                        <td>{t.train_type}</td>
                        <td>₹{Math.floor(t.price)}</td>
                        <td>{t.available_seats} / {t.total_seats}</td>
                        <td>
                          <button onClick={() => handleOpenEdit(t, 'trains')} className="btn btn-link text-dark p-1" title="Edit Train"><MdModeEdit size={18} /></button>
                          <button onClick={() => handleDelete('train', t.id)} className="btn btn-link text-dark p-1" title="Delete Train"><MdDeleteOutline size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Package list */}
            <div className={`dashboard-page ${activeTab === 'packages' ? 'active' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 className="mb-0">Holiday Package Registry</h2>
                <button onClick={() => handleOpenAdd('packages')} className="btn btn-warning btn-sm text-white rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
                  <FaPlus size={10} /> Add Package
                </button>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Package Title</th>
                      <th>Destination</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Duration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map(p => (
                      <tr key={p.id}>
                        <td className="fw-bold">{p.title}</td>
                        <td>{p.destination}</td>
                        <td>{p.category}</td>
                        <td>₹{Math.floor(p.price)}</td>
                        <td>{p.duration}</td>
                        <td>
                          <button onClick={() => handleOpenEdit(p, 'packages')} className="btn btn-link text-dark p-1" title="Edit Package"><MdModeEdit size={18} /></button>
                          <button onClick={() => handleDelete('package', p.id)} className="btn btn-link text-dark p-1" title="Delete Package"><MdDeleteOutline size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cars list */}
            <div className={`dashboard-page ${activeTab === 'cars' ? 'active' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 className="mb-0">Car Fleet Registry</h2>
                <button onClick={() => handleOpenAdd('cars')} className="btn btn-warning btn-sm text-white rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
                  <FaPlus size={10} /> Add Car
                </button>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Car Model</th>
                      <th>Category</th>
                      <th>Transmission</th>
                      <th>Fuel</th>
                      <th>Rental Type</th>
                      <th>Daily Rate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cars || []).map(c => (
                      <tr key={c.id}>
                        <td className="fw-bold">{c.name}</td>
                        <td>{c.car_type}</td>
                        <td>{c.transmission}</td>
                        <td>{c.fuel_type}</td>
                        <td>{c.rental_type}</td>
                        <td>₹{Math.floor(c.daily_rate)}</td>
                        <td>
                          <button onClick={() => handleOpenEdit(c, 'cars')} className="btn btn-link text-dark p-1" title="Edit Car"><MdModeEdit size={18} /></button>
                          <button onClick={() => handleDelete('car', c.id)} className="btn btn-link text-dark p-1" title="Delete Car"><MdDeleteOutline size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Coupons list */}
            <div className={`dashboard-page ${activeTab === 'coupons' ? 'active' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 className="mb-0">Coupon Codes Registry</h2>
                <button onClick={() => handleOpenAdd('coupons')} className="btn btn-warning btn-sm text-white rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
                  <FaPlus size={10} /> Add Coupon
                </button>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Discount</th>
                      <th>Max Limit</th>
                      <th>Status</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.id}>
                        <td className="fw-bold">{c.code}</td>
                        <td>{c.discount_percentage}%</td>
                        <td>₹{Math.floor(c.max_discount)}</td>
                        <td>
                          <span className={`badge rounded-pill ${c.active ? 'bg-success' : 'bg-danger'}`}>
                            {c.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="text-truncate" style={{ maxWidth: '150px' }}>{c.description}</td>
                        <td>
                          <button onClick={() => handleOpenEdit(c, 'coupons')} className="btn btn-link text-dark p-1" title="Edit Coupon"><MdModeEdit size={18} /></button>
                          <button onClick={() => handleDelete('coupon', c.id)} className="btn btn-link text-dark p-1" title="Delete Coupon"><MdDeleteOutline size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Users accounts list */}
            <div className={`dashboard-page ${activeTab === 'users' ? 'active' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 className="mb-0">Accounts Database</h2>
                <button onClick={() => handleOpenAdd('users')} className="btn btn-warning btn-sm text-white rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
                  <FaPlus size={10} /> Add Account / Admin
                </button>
              </div>

              {/* Accounts Filter Options below header */}
              <div className="d-flex flex-wrap gap-2 mb-4 p-2 bg-light rounded-4 shadow-sm align-items-center">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold transition-all ${userRoleFilter === 'all' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setUserRoleFilter('all')}
                >
                  All Accounts ({users.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold transition-all ${userRoleFilter === 'admin' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setUserRoleFilter('admin')}
                >
                  Admins ({users.filter(u => u.is_staff).length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold transition-all ${userRoleFilter === 'user' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setUserRoleFilter('user')}
                >
                  Users ({users.filter(u => !u.is_staff).length})
                </button>
              </div>
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Account Info</th>
                      <th>Tier & Contact</th>
                      <th>Wallet & Coins</th>
                      <th className="text-center">Companions</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(u => {
                        if (userRoleFilter === 'all') return true;
                        if (userRoleFilter === 'admin') return u.is_staff;
                        if (userRoleFilter === 'user') return !u.is_staff;
                        return true;
                      })
                      .map(u => {
                        const companionsCount = (() => {
                          try {
                            return JSON.parse(u.profile?.saved_travelers || '[]').length;
                          } catch (e) {
                            return 0;
                          }
                        })();

                        return (
                          <tr key={u.id}>
                            <td className="fw-bold">#{u.id}</td>
                            <td>
                              <strong>{u.username}</strong>
                              <div className="small text-muted">{u.first_name} {u.last_name}</div>
                              <div className="small text-muted font-monospace" style={{ fontSize: '11px' }}>{u.email}</div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border rounded-pill mb-1 d-inline-block" style={{ fontSize: '10.5px' }}>
                                👑 {u.profile?.tier || 'GT Member'}
                              </span>
                              <div className="small text-muted">📞 {u.profile?.phone_number || 'No Phone'}</div>
                            </td>
                            <td>
                              <div className="fw-bold text-success" style={{ fontSize: '14px' }}>₹{Math.floor(parseFloat(u.profile?.wallet_balance || 0)).toLocaleString('en-IN')}</div>
                              <div className="small text-muted" style={{ fontSize: '11px' }}>🪙 {u.profile?.loyalty_points || 0} Coins</div>
                            </td>
                            <td className="text-center fw-bold" style={{ fontSize: '14px' }}>{companionsCount}</td>
                            <td>
                              <span className={`badge ${u.is_staff ? 'bg-info' : 'bg-secondary'}`} style={{ fontSize: '11px' }}>
                                {u.is_staff ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td>
                              <button onClick={() => toggleUserStatus(u)} className={`btn btn-sm py-1 px-3 rounded-pill fw-bold ${u.is_active ? 'btn-success' : 'btn-danger'}`} style={{ fontSize: '11px' }}>
                                {u.is_active ? 'Active' : 'Disabled'}
                              </button>
                            </td>
                            <td>
                              <button onClick={() => { setViewItem(u); setViewType('user'); }} className="btn btn-link text-primary p-1" title="View Profile Details"><FaEye /></button>
                              <button onClick={() => handleOpenEdit(u, 'users')} className="btn btn-link text-dark p-1" title="Edit Profile"><MdModeEdit size={18} /></button>
                              <button onClick={() => handleDelete('user', u.id)} className="btn btn-link text-dark p-1" disabled={u.is_superuser} title="Delete Account"><MdDeleteOutline size={18} /></button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bookings registry list */}
            <div className={`dashboard-page ${activeTab === 'bookings' ? 'active' : ''}`}>
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
                <h2 className="mb-0">Bookings Database</h2>
                <div className="btn-group shadow-sm bg-white p-1 rounded-pill" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 ${bookingStatusFilter === 'all' ? 'btn-primary' : 'btn-light border-0 text-muted'}`}
                    onClick={() => setBookingStatusFilter('all')}
                  >
                    All Status
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 ${bookingStatusFilter === 'confirmed' ? 'btn-primary' : 'btn-light border-0 text-muted'}`}
                    onClick={() => setBookingStatusFilter('confirmed')}
                  >
                    Confirmed
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 ${bookingStatusFilter === 'cancelled' ? 'btn-primary' : 'btn-light border-0 text-muted'}`}
                    onClick={() => setBookingStatusFilter('cancelled')}
                  >
                    Cancelled
                  </button>
                </div>
              </div>

              {/* Booking Type Filters */}
              <div className="d-flex flex-wrap gap-2 mb-4 p-2 bg-light rounded-4 shadow-sm align-items-center">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${bookingTypeFilter === 'all' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setBookingTypeFilter('all')}
                >
                  All Bookings ({getBookingTypeCount('all')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${bookingTypeFilter === 'flight' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setBookingTypeFilter('flight')}
                >
                  Flights ({getBookingTypeCount('flight')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${bookingTypeFilter === 'hotel' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setBookingTypeFilter('hotel')}
                >
                  Hotels ({getBookingTypeCount('hotel')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${bookingTypeFilter === 'train' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setBookingTypeFilter('train')}
                >
                  Trains ({getBookingTypeCount('train')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${bookingTypeFilter === 'package' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setBookingTypeFilter('package')}
                >
                  Packages ({getBookingTypeCount('package')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${bookingTypeFilter === 'car' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setBookingTypeFilter('car')}
                >
                  Cars ({getBookingTypeCount('car')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 transition-all ${bookingTypeFilter === 'bus' ? 'btn-dark text-white' : 'btn-light text-muted border-0 bg-transparent'}`}
                  onClick={() => setBookingTypeFilter('bus')}
                >
                  Buses ({getBookingTypeCount('bus')})
                </button>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>User</th>
                      <th>Category</th>
                      <th>Details</th>
                      <th>Price</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => {
                      let detailsStr = '';
                      if (b.booking_type === 'flight' && b.flight_details) {
                        detailsStr = `${b.flight_details.airline} (${b.flight_details.departure_city} ➔ ${b.flight_details.arrival_city})`;
                      } else if (b.booking_type === 'hotel' && b.hotel_details) {
                        detailsStr = `${b.hotel_details.name} (${b.hotel_details.city})`;
                      } else if (b.booking_type === 'train' && b.train_details) {
                        detailsStr = `${b.train_details.name} (${b.train_details.source_city} ➔ ${b.train_details.destination_city})`;
                      } else if (b.booking_type === 'package' && b.package_details) {
                        detailsStr = `${b.package_details.title} (${b.package_details.destination})`;
                      } else if (b.booking_type === 'car' && b.car_details) {
                        detailsStr = `${b.car_details.name} (${b.car_rental_type})`;
                      } else if (b.booking_type === 'bus' && b.bus_details) {
                        detailsStr = `${b.bus_details.operator} (${b.bus_details.source_city} ➔ ${b.bus_details.destination_city})`;
                      } else {
                        detailsStr = `Service ID: ${b.flight_booking || b.hotel_booking || b.train_booking || b.bus_booking || b.package_booking || b.car_booking}`;
                      }

                      return (
                        <tr key={b.id}>
                          <td className="fw-bold">#{b.id}</td>
                          <td>
                            <strong>{b.username}</strong>
                            <div className="small text-muted">ID: {b.user}</div>
                          </td>
                          <td className="text-uppercase fw-bold text-muted small">{b.booking_type}</td>
                          <td>{detailsStr}</td>
                          <td>₹{Math.floor(parseFloat(b.total_price))}</td>
                          <td>{new Date(b.booking_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td>
                            <span className={`badge rounded-pill ${b.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button onClick={() => { setViewItem(b); setViewType('booking'); }} className="btn btn-sm btn-outline-primary rounded-pill px-2 py-1 fw-bold" style={{ fontSize: '11px' }}>
                                View Details
                              </button>
                              {b.status === 'confirmed' && (
                                <button onClick={() => handleCancelBooking(b.id)} className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1 fw-bold" style={{ fontSize: '11px' }}>
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inquiries list */}
            <div className={`dashboard-page ${activeTab === 'inquiries' ? 'active' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Customer Inquiries</h2>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th style={{ width: '180px' }}>Date</th>
                      <th style={{ width: '200px' }}>Contact Info</th>
                      <th style={{ width: '250px' }}>Subject</th>
                      <th>Message</th>
                      <th style={{ width: '80px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No inquiries found.
                        </td>
                      </tr>
                    ) : (
                      inquiries.map(inq => (
                        <tr key={inq.id}>
                          <td className="fw-bold">#{inq.id}</td>
                          <td>
                            {new Date(inq.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <strong>{inq.name}</strong>
                            <div className="small text-muted">
                              <a href={`mailto:${inq.email}`} style={{ color: '#0284c7', textDecoration: 'none' }}>
                                {inq.email}
                              </a>
                            </div>
                          </td>
                          <td className="fw-bold text-dark-blue">{inq.subject}</td>
                          <td style={{ whiteSpace: 'pre-wrap' }}>{inq.message}</td>
                          <td>
                            <button
                              onClick={() => handleDelete('inquiry', inq.id)}
                              className="btn btn-link text-dark p-1"
                              title="Delete Inquiry"
                            >
                              <MdDeleteOutline size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* View Detail Modal */}
            {viewItem && (
              <div className="modal fade show d-block animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1050 }} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content border-0 shadow rounded-4 overflow-hidden" style={{ maxHeight: '90vh' }}>
                    <div className="modal-header bg-dark text-white p-3 border-0 d-flex justify-content-between align-items-center">
                      <h5 className="modal-title fw-bold">
                        {viewType === 'booking' ? `Booking Details: #Book-${viewItem.id}` : `User Profile: @${viewItem.username}`}
                      </h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => { setViewItem(null); setViewType(null); }} aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-4 text-start" style={{ overflowY: 'auto' }}>
                      {viewType === 'booking' ? (
                        <div>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Passenger Account</label>
                              <p className="fw-bold mb-0">@{viewItem.username} (ID: {viewItem.user})</p>
                            </div>
                            <div className="col-md-6">
                              <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Booking Category & Status</label>
                              <span className="badge bg-primary text-uppercase px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '11px' }}>{viewItem.booking_type}</span>
                              <span className={`badge rounded-pill px-3 py-2 fw-bold ms-2 ${viewItem.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '11px' }}>
                                {viewItem.status.toUpperCase()}
                              </span>
                            </div>

                            <hr className="my-2 text-muted" />

                            <div className="col-12">
                              <h6 className="fw-bold text-primary mb-2">Service Details</h6>
                              {viewItem.booking_type === 'flight' && viewItem.flight_details && (
                                <div className="p-3 bg-light rounded-3">
                                  <h6 className="fw-bold mb-1 text-dark-blue">{viewItem.flight_details.airline} Flight</h6>
                                  <p className="mb-1"><strong>Route:</strong> {viewItem.flight_details.departure_city} ({viewItem.flight_details.departure_airport}) ➔ {viewItem.flight_details.arrival_city} ({viewItem.flight_details.arrival_airport})</p>
                                  <p className="mb-1"><strong>Timing:</strong> Departure: {new Date(viewItem.flight_details.departure_time).toLocaleString()} | Arrival: {new Date(viewItem.flight_details.arrival_time).toLocaleString()}</p>
                                  <p className="mb-1"><strong>Flight Seats:</strong> <span className="badge bg-secondary">{viewItem.flight_seats || "Not specified"}</span></p>
                                  <p className="mb-1"><strong>Meal Request:</strong> {viewItem.flight_meal || "None"}</p>
                                  <p className="mb-0"><strong>Baggage Limits:</strong> {viewItem.flight_baggage || "Standard"}</p>
                                </div>
                              )}
                              {viewItem.booking_type === 'hotel' && viewItem.hotel_details && (
                                <div className="p-3 bg-light rounded-3">
                                  <h6 className="fw-bold mb-1 text-dark-blue">{viewItem.hotel_details.name}</h6>
                                  <p className="mb-1"><strong>Location:</strong> {viewItem.hotel_details.address}, {viewItem.hotel_details.city}</p>
                                  <p className="mb-1"><strong>Details:</strong> Rating: ★ {viewItem.hotel_details.rating} | Price: ₹{Math.floor(viewItem.hotel_details.price_per_night)}/night</p>
                                  <p className="mb-0"><strong>Amenities:</strong> {viewItem.hotel_details.amenities || "WiFi, AC, Breakfast"}</p>
                                </div>
                              )}
                              {viewItem.booking_type === 'train' && viewItem.train_details && (
                                <div className="p-3 bg-light rounded-3">
                                  <h6 className="fw-bold mb-1 text-dark-blue">{viewItem.train_details.name} (Train #{viewItem.train_details.train_number})</h6>
                                  <p className="mb-1"><strong>Route:</strong> {viewItem.train_details.source_city} ➔ {viewItem.train_details.destination_city}</p>
                                  <p className="mb-1"><strong>Timing:</strong> Departure: {viewItem.train_details.departure_time} | Arrival: {viewItem.train_details.arrival_time}</p>
                                  <p className="mb-0"><strong>Train Seats:</strong> <span className="badge bg-secondary">{viewItem.train_seats || "Not specified"}</span></p>
                                </div>
                              )}
                              {viewItem.booking_type === 'package' && viewItem.package_details && (
                                <div className="p-3 bg-light rounded-3">
                                  <h6 className="fw-bold mb-1 text-dark-blue">{viewItem.package_details.title}</h6>
                                  <p className="mb-1"><strong>Destination:</strong> {viewItem.package_details.destination}</p>
                                  <p className="mb-1"><strong>Duration:</strong> {viewItem.package_details.duration} | <strong>Category:</strong> {viewItem.package_details.category}</p>
                                  <p className="mb-0"><strong>Highlights:</strong> {viewItem.package_details.description}</p>
                                </div>
                              )}
                              {viewItem.booking_type === 'car' && viewItem.car_details && (
                                <div className="p-3 bg-light rounded-3">
                                  <h6 className="fw-bold mb-1 text-dark-blue">{viewItem.car_details.name} ({viewItem.car_details.type})</h6>
                                  <p className="mb-1"><strong>Location:</strong> {viewItem.car_details.city}</p>
                                  <p className="mb-1"><strong>Rental Period:</strong> {viewItem.rental_start_date} to {viewItem.rental_end_date}</p>
                                  <p className="mb-0"><strong>Rental Type:</strong> {viewItem.car_rental_type || "Self-drive"}</p>
                                </div>
                              )}
                              {viewItem.booking_type === 'bus' && viewItem.bus_details && (
                                <div className="p-3 bg-light rounded-3">
                                  <h6 className="fw-bold mb-1 text-dark-blue">{viewItem.bus_details.operator} ({viewItem.bus_details.bus_type})</h6>
                                  <p className="mb-1"><strong>Route:</strong> {viewItem.bus_details.source_city} ➔ {viewItem.bus_details.destination_city}</p>
                                  <p className="mb-1"><strong>Timing:</strong> Departure: {new Date(viewItem.bus_details.departure_time).toLocaleString()} | Arrival: {new Date(viewItem.bus_details.arrival_time).toLocaleString()}</p>
                                  <p className="mb-0"><strong>Bus Seats:</strong> <span className="badge bg-secondary">{viewItem.bus_seats || "Not specified"}</span></p>
                                </div>
                              )}
                            </div>

                            <hr className="my-2 text-muted" />

                            <div className="col-12">
                              <h6 className="fw-bold text-primary mb-2">Traveler Specifications</h6>
                              {(() => {
                                try {
                                  const travelers = JSON.parse(viewItem.travelers_info || '[]');
                                  if (!travelers || travelers.length === 0) return <p className="text-muted small">No traveler specifications listed.</p>;
                                  return (
                                    <div className="table-responsive">
                                      <table className="table table-bordered table-sm small">
                                        <thead className="table-light">
                                          <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Age</th>
                                            <th>Gender</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {travelers.map((t, idx) => (
                                            <tr key={idx}>
                                              <td>{idx + 1}</td>
                                              <td className="fw-bold">{t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'N/A'}</td>
                                              <td>{t.age}</td>
                                              <td className="text-capitalize">{t.gender}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                } catch (e) {
                                  return <p className="text-muted small">Failed to read traveler details.</p>;
                                }
                              })()}
                            </div>

                            <hr className="my-2 text-muted" />

                            <div className="col-md-6">
                              <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Transaction Details</label>
                              <p className="mb-1"><strong>Base Price:</strong> ₹{Math.floor(parseFloat(viewItem.total_price) + parseFloat(viewItem.discount_amount)).toLocaleString('en-IN')}</p>
                              <p className="mb-1"><strong>Discount Deducted:</strong> ₹{Math.floor(parseFloat(viewItem.discount_amount)).toLocaleString('en-IN')} (Coupon: <span className="badge bg-warning text-dark">{viewItem.coupon_applied || "None"}</span>)</p>
                              <h5 className="fw-bold text-success mt-2"><strong>Total Paid:</strong> ₹{Math.floor(parseFloat(viewItem.total_price)).toLocaleString('en-IN')}</h5>
                            </div>
                            <div className="col-md-6">
                              <label className="text-muted small fw-bold text-uppercase mb-1 d-block">System Records</label>
                              <p className="mb-1"><strong>Booking Date:</strong> {new Date(viewItem.booking_date).toLocaleString()}</p>
                              <p className="mb-0"><strong>Reference:</strong> GT-B-{viewItem.id}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="row g-3">
                            <div className="col-md-4 text-center">
                              <img
                                src={viewItem.profile?.avatar_url || "https://i.pravatar.cc/150?img=12"}
                                alt="User Avatar"
                                className="rounded-circle border img-thumbnail shadow-sm mb-3"
                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                              />
                              <h5 className="fw-bold mb-0">{viewItem.first_name} {viewItem.last_name}</h5>
                              <p className="text-muted small">@{viewItem.username}</p>
                              <span className={`badge px-3 py-2 rounded-pill ${viewItem.is_staff ? 'bg-info text-white' : 'bg-secondary text-white'}`} style={{ fontSize: '11px' }}>
                                {viewItem.is_staff ? 'System Administrator' : 'Standard User'}
                              </span>
                            </div>
                            <div className="col-md-8 text-start">
                              <h6 className="fw-bold text-primary mb-2">Core Account Information</h6>
                              <div className="row g-2">
                                <div className="col-6">
                                  <span className="text-muted small d-block">First Name</span>
                                  <span className="fw-bold">{viewItem.first_name || "Not set"}</span>
                                </div>
                                <div className="col-6">
                                  <span className="text-muted small d-block">Last Name</span>
                                  <span className="fw-bold">{viewItem.last_name || "Not set"}</span>
                                </div>
                                <div className="col-12 mt-2">
                                  <span className="text-muted small d-block">Email Address</span>
                                  <span className="fw-bold font-monospace">{viewItem.email || "No email linked"}</span>
                                </div>
                                <div className="col-6 mt-2">
                                  <span className="text-muted small d-block">Phone Contact</span>
                                  <span className="fw-bold">📞 {viewItem.profile?.phone_number || "No contact"}</span>
                                </div>
                                <div className="col-6 mt-2">
                                  <span className="text-muted small d-block">Loyalty Membership</span>
                                  <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: '11px' }}>👑 {viewItem.profile?.tier || "GT Member"}</span>
                                </div>
                              </div>

                              <hr className="my-2 text-muted" />

                              <h6 className="fw-bold text-primary mb-2">Wallet & Rewards</h6>
                              <div className="row g-2">
                                <div className="col-6">
                                  <span className="text-muted small d-block">Wallet Funds</span>
                                  <h4 className="fw-bold text-success mb-0">₹{Math.floor(parseFloat(viewItem.profile?.wallet_balance || 0)).toLocaleString('en-IN')}</h4>
                                </div>
                                <div className="col-6">
                                  <span className="text-muted small d-block">Globe Trotter Loyalty Coins</span>
                                  <h4 className="fw-bold text-warning mb-0">🪙 {viewItem.profile?.loyalty_points || 0} Coins</h4>
                                </div>
                              </div>
                            </div>

                            <hr className="my-2 text-muted" />

                            <div className="col-12">
                              <h6 className="fw-bold text-primary mb-2">Saved Companions / Travelers ({(() => {
                                try {
                                  return JSON.parse(viewItem.profile?.saved_travelers || '[]').length;
                                } catch (e) {
                                  return 0;
                                }
                              })()})</h6>
                              {(() => {
                                try {
                                  const companions = JSON.parse(viewItem.profile?.saved_travelers || '[]');
                                  if (!companions || companions.length === 0) return <p className="text-muted small">No companions added.</p>;
                                  return (
                                    <div className="table-responsive">
                                      <table className="table table-bordered table-sm small">
                                        <thead className="table-light">
                                          <tr>
                                            <th>#</th>
                                            <th>Full Name</th>
                                            <th>Age</th>
                                            <th>Gender</th>
                                            <th>Relationship</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {companions.map((c, idx) => (
                                            <tr key={idx}>
                                              <td>{idx + 1}</td>
                                              <td className="fw-bold">{c.name}</td>
                                              <td>{c.age}</td>
                                              <td className="text-capitalize">{c.gender}</td>
                                              <td className="text-capitalize text-muted">{c.relationship || "Not specified"}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                } catch (e) {
                                  return <p className="text-muted small">Failed to load companions data.</p>;
                                }
                              })()}
                            </div>

                            <hr className="my-2 text-muted" />

                            <div className="col-md-6">
                              <span className="text-muted small d-block">Account Status</span>
                              <span className={`badge ${viewItem.is_active ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '11px' }}>
                                {viewItem.is_active ? 'Active Status' : 'Deactivated'}
                              </span>
                            </div>
                            <div className="col-md-6">
                              <span className="text-muted small d-block">Registration Date</span>
                              <span className="fw-bold">{new Date(viewItem.date_joined).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="modal-footer bg-light p-2 border-0">
                      <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => { setViewItem(null); setViewType(null); }}>Close Window</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
