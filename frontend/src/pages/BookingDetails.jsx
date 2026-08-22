import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaTrash, FaTag, FaCheckCircle, FaExclamationTriangle, FaPlane, FaHotel, FaBus, FaSuitcase, FaCar, FaTrain } from 'react-icons/fa';
import api from '../api';

const getAvailableDates = (pkgId) => {
  const today = new Date();
  const dates = [];
  const offsets = [
    ((pkgId * 3) % 7) + 3,
    ((pkgId * 7) % 7) + 10,
    ((pkgId * 11) % 7) + 18,
    ((pkgId * 13) % 7) + 25
  ];

  offsets.forEach((offset) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    dates.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
  });

  return dates;
};

const getRouteStations = (type, source, destination) => {
  const src = source || 'Origin';
  const dest = destination || 'Destination';
  if (type === 'flights') {
    return [
      { station: `${src} Airport (DEP)`, time: 'Departure Terminal' },
      { station: 'Flight Route Airspace Node (Direct)', time: 'Cruising Stopover' },
      { station: `${dest} Airport (ARR)`, time: 'Arrival Terminal' }
    ];
  }
  if (type === 'buses') {
    return [
      { station: `${src} Inter State Bus Terminal (ISBT)`, time: 'Departure Bay' },
      { station: 'Highway Food Plaza (30 Mins Diner Halt)', time: 'Intermediate stop' },
      { station: 'Expressway Toll Booth Transit Point', time: 'Intermediate stop' },
      { station: `${dest} Main Bus Stand / ISBT`, time: 'Final Arrival' }
    ];
  }
  return [
    { station: `${src} Central Railway Station`, time: 'Origin Departure' },
    { station: 'Junction Halt A (10 Mins Stop)', time: 'Intermediate stop' },
    { station: 'Junction Halt B (15 Mins Stop)', time: 'Intermediate stop' },
    { station: 'Junction Halt C (5 Mins Stop)', time: 'Intermediate stop' },
    { station: `${dest} Junction Terminus`, time: 'Final Arrival' }
  ];
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const BookingDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get('type');
  const id = searchParams.get('id');

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Traveler info list
  const [travelers, setTravelers] = useState([{ firstName: '', lastName: '', age: '', gender: 'Male' }]);

  // Custom addon choices
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [mealSelection, setMealSelection] = useState('None');
  const [baggageUpgrade, setBaggageUpgrade] = useState('None');

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [selectedDepartureDate, setSelectedDepartureDate] = useState('');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
  const [hotelCheckIn, setHotelCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [hotelCheckOut, setHotelCheckOut] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [roomCounts, setRoomCounts] = useState({
    couple: 1,
    family: 0,
    friends: 0
  });

  const updateRoomCount = (key, delta) => {
    setRoomCounts(prev => {
      const nextVal = Math.max(0, (prev[key] || 0) + delta);
      const updated = { ...prev, [key]: nextVal };
      const totalRooms = updated.couple + updated.family + updated.friends;
      if (totalRooms === 0) return prev; // Must have at least 1 room
      return updated;
    });
  };

  const getSelectedRoomTypeSummary = () => {
    const parts = [];
    if (roomCounts.couple > 0) parts.push(`${roomCounts.couple} x Couple Room (2 Guests)`);
    if (roomCounts.family > 0) parts.push(`${roomCounts.family} x Family Room (4 Guests)`);
    if (roomCounts.friends > 0) parts.push(`${roomCounts.friends} x Friends Room (6 Guests)`);
    return parts.length > 0 ? parts.join(', ') : '1 x Couple Room (2 Guests)';
  };

  // Car date and time states
  const [pickupDate, setPickupDate] = useState(searchParams.get('pickup_date') || new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState(searchParams.get('pickup_time') || '17:00');
  const [dropDate, setDropDate] = useState(searchParams.get('drop_date') || new Date().toISOString().split('T')[0]);
  const [dropTime, setDropTime] = useState(searchParams.get('drop_time') || '05:00');

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      setError('');
      try {
        let endpoint = '';
        if (type === 'flights') endpoint = `flights/${id}/`;
        else if (type === 'hotels') endpoint = `hotels/${id}/`;
        else if (type === 'trains') endpoint = `trains/${id}/`;
        else if (type === 'buses') endpoint = `buses/${id}/`;
        else if (type === 'packages') endpoint = `packages/${id}/`;
        else if (type === 'cars') endpoint = `cars/${id}/`;

        const response = await api.get(endpoint);
        setItem(response.data);
      } catch (err) {
        setError('Failed to load details. Please return to search.');
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [type, id]);

  useEffect(() => {
    if (item && type === 'packages') {
      const dates = getAvailableDates(item.id);
      if (dates.length > 0) {
        setSelectedDepartureDate(dates[0]);
      }
    }
  }, [item, type]);

  const addTraveler = () => {
    setTravelers([...travelers, { firstName: '', lastName: '', age: '', gender: 'Male' }]);
  };

  const removeTraveler = (index) => {
    if (travelers.length === 1) return;
    setTravelers(travelers.filter((_, idx) => idx !== index));
    // Clear seat selection for excess travelers
    if (selectedSeats.length > index) {
      setSelectedSeats(selectedSeats.filter((_, idx) => idx !== index));
    }
  };

  const updateTraveler = (index, field, value) => {
    const updated = travelers.map((t, idx) => {
      if (idx === index) {
        return { ...t, [field]: value };
      }
      return t;
    });
    setTravelers(updated);
  };

  const toggleSeat = (seatId) => {
    const isSelected = selectedSeats.includes(seatId);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= travelers.length) {
        alert(`You can only select up to ${travelers.length} seats (one per traveler).`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await api.post('promotions/validate/', { code: couponCode });
      setAppliedCoupon(res.data);
      setCouponSuccess(`Coupon applied successfully! Saving ${res.data.discount_percentage}% (Max: ₹${res.data.max_discount})`);
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const getBasePrice = () => {
    if (!item) return 0;
    if (type === 'hotels') {
      const baseRate = parseFloat(item.price_per_night);
      const nightlyTotal = (roomCounts.couple * baseRate) +
                           (roomCounts.family * baseRate * 1.7) +
                           (roomCounts.friends * baseRate * 2.3);

      let nights = 1;
      if (hotelCheckIn && hotelCheckOut) {
        const d1 = new Date(hotelCheckIn);
        const d2 = new Date(hotelCheckOut);
        const diffTime = d2 - d1;
        if (diffTime > 0) {
          nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }
      return nightlyTotal * nights;
    }
    if (type === 'cars') return parseFloat(item.daily_rate);
    return parseFloat(item.price) * travelers.length;
  };

  const getAddonCharges = () => {
    let total = 0;
    if (mealSelection === 'Veg') total += 250 * travelers.length;
    if (mealSelection === 'Non-Veg') total += 350 * travelers.length;
    if (baggageUpgrade === 'Extra 10kg') total += 1200 * travelers.length;
    // Window seat charges
    selectedSeats.forEach(seat => {
      if (seat.endsWith('A') || seat.endsWith('F')) {
        total += 200; // Premium for window seats
      }
    });
    return total;
  };

  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    const base = getBasePrice() + getAddonCharges();
    const discount = base * (parseFloat(appliedCoupon.discount_percentage) / 100);
    return Math.min(discount, parseFloat(appliedCoupon.max_discount));
  };

  const getTotalPrice = () => {
    return Math.max(0, getBasePrice() + getAddonCharges() - getDiscount());
  };

  const handleCheckout = async () => {
    // Validate traveler inputs
    const valid = travelers.every(t => t.firstName.trim() && t.lastName.trim() && t.age);
    if (!valid) {
      alert('Please fill out all traveler details first.');
      return;
    }

    // Validate date selections
    if (type === 'hotels' && (!hotelCheckIn || !hotelCheckOut)) {
      alert('Please select valid check-in and check-out dates!');
      return;
    }
    if ((type === 'flights' || type === 'trains' || type === 'buses') && !travelDate) {
      alert('Please select a valid travel date!');
      return;
    }
    if (type === 'cars' && (!pickupDate || !dropDate)) {
      alert('Please select valid pickup and drop-off dates!');
      return;
    }
    if (type === 'packages' && !selectedDepartureDate) {
      alert('Please select a travel departure date!');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please log in or sign up first to book.');
      return;
    }

    try {
      const travelersWithDate = travelers.map((t, idx) => {
        const fullName = `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name || 'Traveler';
        const updatedTraveler = { ...t, name: fullName };
        if (idx === 0) {
          if (type === 'packages') return { ...updatedTraveler, departureDate: selectedDepartureDate };
          if (type === 'hotels') return { ...updatedTraveler, checkIn: hotelCheckIn, checkOut: hotelCheckOut };
          if (type === 'flights' || type === 'trains' || type === 'buses') return { ...updatedTraveler, travelDate: travelDate };
          if (type === 'cars') return {
            ...updatedTraveler,
            pickupDate: pickupDate,
            pickupTime: pickupTime,
            dropDate: dropDate,
            dropTime: dropTime
          };
        }
        return updatedTraveler;
      });

      const payload = {
        booking_type: type === 'flights' ? 'flight' : type === 'hotels' ? 'hotel' : type === 'trains' ? 'train' : type === 'buses' ? 'bus' : type === 'packages' ? 'package' : 'car',
        total_price: getTotalPrice(),
        coupon_applied: appliedCoupon ? appliedCoupon.code : null,
        discount_amount: getDiscount(),
        travelers_info: JSON.stringify(travelersWithDate),
        status: 'pending' // remains pending until paid
      };

      if (type === 'flights') {
        payload.flight_booking = item.id;
        payload.flight_seats = selectedSeats.join(', ');
        payload.flight_meal = mealSelection;
        payload.flight_baggage = baggageUpgrade;
      } else if (type === 'hotels') {
        payload.hotel_booking = item.id;
        payload.hotel_room_type = getSelectedRoomTypeSummary();
      } else if (type === 'trains') {
        payload.train_booking = item.id;
        payload.train_seats = selectedSeats.join(', ');
      } else if (type === 'buses') {
        payload.bus_booking = item.id;
        payload.bus_seats = selectedSeats.join(', ');
      } else if (type === 'packages') {
        payload.package_booking = item.id;
      } else if (type === 'cars') {
        payload.car_booking = item.id;
        payload.car_rental_type = item.rental_type;
      }

      const response = await api.post('bookings/', payload);
      navigate(`/payment?booking_id=${response.data.id}`);
    } catch (err) {
      const errData = err.response?.data;
      let errMsg = 'Please try again.';
      if (errData) {
        if (typeof errData === 'string') errMsg = errData;
        else if (errData.error) errMsg = errData.error;
        else if (errData.detail) errMsg = errData.detail;
        else {
          // Django validation errors: { field: ["msg", ...], ... }
          const msgs = Object.entries(errData)
            .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
            .join('\n');
          errMsg = msgs || 'Please try again.';
        }
      }
      alert('Booking failed:\n' + errMsg);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Configuring booking options...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error || 'Booking item details not found.'}</div>
      </div>
    );
  }

  let parsedItinerary = [];
  if (item && type === 'packages' && item.itinerary) {
    try {
      parsedItinerary = typeof item.itinerary === 'string' ? JSON.parse(item.itinerary) : item.itinerary;
    } catch (e) {
      console.error("Failed to parse itinerary", e);
    }
  }

  // Interactive seat grid layout helpers (6 rows of seats A-F)
  const seatRows = [1, 2, 3, 4, 5, 6];
  const seatCols = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="booking-details-page container py-5">
      <h3 className="fw-bold mb-4 text-dark-blue">Review Your Booking Add-ons</h3>

      <div className="row g-4">
        {/* Left column: Details inputs */}
        <div className="col-lg-8">
          {/* Summary Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3 text-dark-blue">Trip Details</h5>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-light p-3 rounded-3 text-primary fs-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                {type === 'flights' && <FaPlane />}
                {type === 'hotels' && <FaHotel />}
                {type === 'trains' && <FaTrain />}
                {type === 'buses' && <FaBus />}
                {type === 'packages' && <FaSuitcase />}
                {type === 'cars' && <FaCar />}
              </div>
              <div>
                <h6 className="fw-bold mb-1">
                  {type === 'flights' && `${item.airline} (${item.flight_number})`}
                  {type === 'hotels' && item.name}
                  {type === 'trains' && `${item.name} (${item.train_number})`}
                  {type === 'buses' && `${item.operator} (${item.bus_type})`}
                  {type === 'packages' && item.title}
                  {type === 'cars' && item.name}
                </h6>
                <p className="text-muted small mb-0">
                  {type === 'flights' && `From ${item.departure_city} to ${item.arrival_city}`}
                  {type === 'hotels' && `${item.address}, ${item.city}`}
                  {type === 'trains' && `From ${item.source_city} to ${item.destination_city}`}
                  {type === 'buses' && `From ${item.source_city} to ${item.destination_city}`}
                  {type === 'packages' && `Duration: ${item.duration}`}
                  {type === 'cars' && `Rental City: ${item.rental_type}`}
                </p>
                {type === 'flights' && (
                  <div className="mt-2 text-start small text-muted">
                    <div>🛫 <strong>Departure:</strong> {formatDateTime(item.departure_time)}</div>
                    <div>🛬 <strong>Arrival:</strong> {formatDateTime(item.arrival_time)}</div>
                    <div className="mt-1">💼 <strong>Baggage:</strong> {baggageUpgrade === 'None' ? '15 Kg Checked' : baggageUpgrade} | 🍔 <strong>Meals:</strong> {mealSelection}</div>
                    <div className="mt-3">
                      <label className="form-label small fw-bold text-dark-blue mb-1">Select Travel Date:</label>
                      <input
                        type="date"
                        className="form-control form-control-sm rounded-3 border-secondary-subtle"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ maxWidth: '220px' }}
                        required
                      />
                    </div>
                  </div>
                )}
                {type === 'buses' && (
                  <div className="mt-2 text-start small text-muted">
                    <div>🚊 <strong>Departure:</strong> {formatDateTime(item.departure_time)}</div>
                    <div>🏁 <strong>Arrival:</strong> {formatDateTime(item.arrival_time)}</div>
                    <div className="mt-1">🎟️ <strong>Coach Class:</strong> {item.bus_type}</div>
                    <div className="mt-3">
                      <label className="form-label small fw-bold text-dark-blue mb-1">Select Travel Date:</label>
                      <input
                        type="date"
                        className="form-control form-control-sm rounded-3 border-secondary-subtle"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ maxWidth: '220px' }}
                        required
                      />
                    </div>
                  </div>
                )}
                {type === 'trains' && (
                  <div className="mt-2 text-start small text-muted">
                    <div>🚂 <strong>Departure:</strong> {formatDateTime(item.departure_time)}</div>
                    <div>🏁 <strong>Arrival:</strong> {formatDateTime(item.arrival_time)}</div>
                    <div className="mt-1">🎫 <strong>Train Class:</strong> {item.train_type}</div>
                    <div className="mt-1">💺 <strong>Available Seats:</strong> {item.available_seats}</div>
                    <div className="mt-3">
                      <label className="form-label small fw-bold text-dark-blue mb-1">Select Travel Date:</label>
                      <input
                        type="date"
                        className="form-control form-control-sm rounded-3 border-secondary-subtle"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ maxWidth: '220px' }}
                        required
                      />
                    </div>
                  </div>
                )}
                {type === 'hotels' && (
                  <div className="mt-3 text-start d-flex gap-3">
                    <div>
                      <label className="form-label small fw-bold text-dark-blue mb-1">Check In Date:</label>
                      <input
                        type="date"
                        className="form-control form-control-sm rounded-3 border-secondary-subtle"
                        value={hotelCheckIn}
                        onChange={(e) => setHotelCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ maxWidth: '180px' }}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label small fw-bold text-dark-blue mb-1">Check Out Date:</label>
                      <input
                        type="date"
                        className="form-control form-control-sm rounded-3 border-secondary-subtle"
                        value={hotelCheckOut}
                        onChange={(e) => setHotelCheckOut(e.target.value)}
                        min={hotelCheckIn}
                        style={{ maxWidth: '180px' }}
                        required
                      />
                    </div>
                  </div>
                )}
                {type === 'cars' && (
                  <div className="mt-3 text-start d-flex flex-column gap-3">
                    <div>
                      <label className="form-label small fw-bold text-dark-blue mb-1">Pick up Date & Time:</label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="date"
                          className="form-control form-control-sm rounded-3 border-secondary-subtle"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          style={{ maxWidth: '140px' }}
                          required
                        />
                        <input
                          type="time"
                          className="form-control form-control-sm rounded-3 border-secondary-subtle"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          style={{ maxWidth: '110px' }}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label small fw-bold text-dark-blue mb-1">Drop off Date & Time:</label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="date"
                          className="form-control form-control-sm rounded-3 border-secondary-subtle"
                          value={dropDate}
                          onChange={(e) => setDropDate(e.target.value)}
                          min={pickupDate}
                          style={{ maxWidth: '140px' }}
                          required
                        />
                        <input
                          type="time"
                          className="form-control form-control-sm rounded-3 border-secondary-subtle"
                          value={dropTime}
                          onChange={(e) => setDropTime(e.target.value)}
                          style={{ maxWidth: '110px' }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
                {type === 'packages' && (
                  <div className="mt-3 text-start">
                    <label className="form-label small fw-bold text-dark-blue mb-1">Select Travel Departure Date:</label>
                    <select
                      className="form-select form-select-sm rounded-3 border-secondary-subtle font-monospace"
                      value={selectedDepartureDate}
                      onChange={(e) => setSelectedDepartureDate(e.target.value)}
                      style={{ maxWidth: '250px' }}
                    >
                      {getAvailableDates(item.id).map((dateStr, idx) => (
                        <option key={idx} value={dateStr}>{dateStr}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hotel Room Type & Quantity Selection */}
          {type === 'hotels' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-start animate-fade-in">
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 border-bottom pb-2 gap-2">
                <h5 className="fw-bold mb-0 text-dark-blue d-flex align-items-center gap-2">
                  <FaHotel className="text-primary" /> Select Rooms & Quantities
                </h5>
              </div>

              <p className="text-muted small mb-4">
                You can select multiple rooms and mix room types (e.g. 3 Couple Rooms, or 1 Couple Room + 1 Friends Room).
              </p>

              <div className="row g-3">
                {/* Couple Room (2 People) */}
                <div className="col-md-4">
                  <div 
                    className={`card h-100 rounded-4 border-2 p-3 transition-all ${roomCounts.couple > 0 ? 'border-primary bg-primary-subtle bg-opacity-10 shadow-sm' : 'border-light-subtle'}`}
                    style={{ transition: 'all 0.25s ease' }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-danger-subtle text-danger fw-bold rounded-pill px-2.5 py-1" style={{ fontSize: '11px' }}>
                        👩‍❤️‍👨 Couple Special
                      </span>
                      <span className="fw-bold text-primary small">₹{parseFloat(item.price_per_night).toLocaleString('en-IN')}/night</span>
                    </div>

                    <h6 className="fw-bold text-dark-blue mb-1">Couple Room (2 People)</h6>
                    <span className="text-muted small d-block mb-2 fw-semibold">Capacity: 2 Guests • 1 King Bed</span>
                    <p className="small text-secondary mb-3" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                      Romantic setup with soft ambient lighting, luxury bathroom & welcome drinks.
                    </p>

                    {/* Room Quantity Counter */}
                    <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                      <small className="text-muted fw-bold">Select Rooms:</small>
                      <div className="d-flex align-items-center border rounded-pill overflow-hidden bg-white shadow-sm">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border-0 fw-bold px-2.5 py-1"
                          onClick={() => updateRoomCount('couple', -1)}
                          disabled={roomCounts.couple === 0 && (roomCounts.family + roomCounts.friends) === 0}
                        >
                          -
                        </button>
                        <span className="px-3 fw-bold small text-dark-blue">{roomCounts.couple} {roomCounts.couple === 1 ? 'Room' : 'Rooms'}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-light border-0 fw-bold px-2.5 py-1"
                          onClick={() => updateRoomCount('couple', 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Family Room (4 People) */}
                <div className="col-md-4">
                  <div 
                    className={`card h-100 rounded-4 border-2 p-3 transition-all ${roomCounts.family > 0 ? 'border-primary bg-primary-subtle bg-opacity-10 shadow-sm' : 'border-light-subtle'}`}
                    style={{ transition: 'all 0.25s ease' }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-primary-subtle text-primary fw-bold rounded-pill px-2.5 py-1" style={{ fontSize: '11px' }}>
                        👨‍👩‍👧‍👦 Family Suite
                      </span>
                      <span className="fw-bold text-primary small">₹{(parseFloat(item.price_per_night) * 1.7).toLocaleString('en-IN')}/night</span>
                    </div>

                    <h6 className="fw-bold text-dark-blue mb-1">Family Room (4 People)</h6>
                    <span className="text-muted small d-block mb-2 fw-semibold">Capacity: 4 Guests • 2 Queen Beds</span>
                    <p className="small text-secondary mb-3" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                      Spacious family suite with extra storage, mini fridge & breakfast included.
                    </p>

                    {/* Room Quantity Counter */}
                    <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                      <small className="text-muted fw-bold">Select Rooms:</small>
                      <div className="d-flex align-items-center border rounded-pill overflow-hidden bg-white shadow-sm">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border-0 fw-bold px-2.5 py-1"
                          onClick={() => updateRoomCount('family', -1)}
                          disabled={roomCounts.family === 0}
                        >
                          -
                        </button>
                        <span className="px-3 fw-bold small text-dark-blue">{roomCounts.family} {roomCounts.family === 1 ? 'Room' : 'Rooms'}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-light border-0 fw-bold px-2.5 py-1"
                          onClick={() => updateRoomCount('family', 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Friends Room (6 People) */}
                <div className="col-md-4">
                  <div 
                    className={`card h-100 rounded-4 border-2 p-3 transition-all ${roomCounts.friends > 0 ? 'border-primary bg-primary-subtle bg-opacity-10 shadow-sm' : 'border-light-subtle'}`}
                    style={{ transition: 'all 0.25s ease' }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-warning-subtle text-dark fw-bold rounded-pill px-2.5 py-1" style={{ fontSize: '11px' }}>
                        🥳 Friends Group Room
                      </span>
                      <span className="fw-bold text-primary small">₹{(parseFloat(item.price_per_night) * 2.3).toLocaleString('en-IN')}/night</span>
                    </div>

                    <h6 className="fw-bold text-dark-blue mb-1">Friends Room (6 People)</h6>
                    <span className="text-muted small d-block mb-2 fw-semibold">Capacity: 6 Guests • 3 Double Beds</span>
                    <p className="small text-secondary mb-3" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                      Large party suite with bluetooth soundbar, minibar & dual washrooms.
                    </p>

                    {/* Room Quantity Counter */}
                    <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                      <small className="text-muted fw-bold">Select Rooms:</small>
                      <div className="d-flex align-items-center border rounded-pill overflow-hidden bg-white shadow-sm">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border-0 fw-bold px-2.5 py-1"
                          onClick={() => updateRoomCount('friends', -1)}
                          disabled={roomCounts.friends === 0}
                        >
                          -
                        </button>
                        <span className="px-3 fw-bold small text-dark-blue">{roomCounts.friends} {roomCounts.friends === 1 ? 'Room' : 'Rooms'}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-light border-0 fw-bold px-2.5 py-1"
                          onClick={() => updateRoomCount('friends', 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection Summary Banner */}
              <div className="mt-4 p-3 rounded-3 bg-light border border-light-subtle d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <small className="text-muted d-block fw-semibold">Selected Booking Combination:</small>
                  <strong className="text-dark-blue font-monospace" style={{ fontSize: '14px' }}>
                    {getSelectedRoomTypeSummary()}
                  </strong>
                </div>
                <div className="text-end">
                  <small className="text-muted d-block fw-semibold">Combined Nightly Rate:</small>
                  <span className="fw-bold text-success fs-5">
                    ₹{((roomCounts.couple * parseFloat(item.price_per_night)) + (roomCounts.family * parseFloat(item.price_per_night) * 1.7) + (roomCounts.friends * parseFloat(item.price_per_night) * 2.3)).toLocaleString('en-IN')}/night
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Render package inclusions and itinerary details if booking type is packages */}
          {type === 'packages' && (
            <>
              {/* Package Inclusions & Details */}
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-start animate-fade-in">
                <h5 className="fw-bold mb-3 text-dark-blue border-bottom pb-2">📋 Package Inclusions & Details</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6 className="fw-bold text-success mb-2">✔️ What's Included:</h6>
                    <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-0">
                      <li>🍳 <strong>Meals:</strong> Daily Breakfast & Dinner included (Buffet style).</li>
                      <li>🏨 <strong>Accommodation:</strong> Premium 3-star/4-star hotel stays (Double sharing).</li>
                      <li>🚗 <strong>Transport:</strong> Private A/C vehicle transfers & sightseeing tours.</li>
                      <li>🎟️ <strong>Permits:</strong> All inner-line permits & state entry taxes.</li>
                      <li>👨‍✈️ <strong>Guide:</strong> Dedicated local tour coordinator/driver.</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold text-danger mb-2">❌ What's Not Included:</h6>
                    <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-0">
                      <li>✈️ <strong>Flights/Trains:</strong> Airfare or train tickets (unless specified).</li>
                      <li>🍜 <strong>Lunch:</strong> Daily lunches and personal food orders.</li>
                      <li>🧗 <strong>Adventure Sports:</strong> Optional activities (like scuba, paragliding).</li>
                      <li>🩺 <strong>Insurance:</strong> Travel/Medical insurance coverage.</li>
                      <li>🛍️ <strong>Personal:</strong> Shopping, tips, and laundry expenses.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Itinerary */}
              {parsedItinerary && parsedItinerary.length > 0 && (
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-start animate-fade-in">
                  <h5 className="fw-bold mb-3 text-dark-blue border-bottom pb-2">📍 Day-by-Day Itinerary</h5>
                  <div className="timeline-container px-2">
                    {parsedItinerary.map((dayPlan, idx) => (
                      <div key={idx} className="mb-4 position-relative ps-4 border-start border-2 border-primary-subtle">
                        <div
                          className="position-absolute start-0 bg-primary text-white rounded-pill px-2.5 py-1 fw-bold text-center"
                          style={{
                            fontSize: '11px',
                            top: '0',
                            left: '0',
                            transform: 'translate(-50%, 0)'
                          }}
                        >
                          Day {dayPlan.day || (idx + 1)}
                        </div>
                        <h6 className="fw-bold text-dark-blue mb-1" style={{ marginLeft: '10px' }}>{dayPlan.title}</h6>
                        <p className="text-muted small mb-0" style={{ marginLeft: '10px' }}>{dayPlan.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Render Route Stations / Stops for Flight, Train and Bus */}
          {(type === 'flights' || type === 'trains' || type === 'buses') && (
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-start animate-fade-in">
              <h5 className="fw-bold mb-3 text-dark-blue border-bottom pb-2">
                {type === 'flights' ? '✈️ Flight Route & Airway Stops' : type === 'buses' ? '🚌 Bus Route & Major Stops' : '🚊 Train Route & Junction Stations'}
              </h5>
              <div className="timeline-container px-2">
                {getRouteStations(
                  type,
                  type === 'flights' ? item.departure_city : item.source_city,
                  type === 'flights' ? item.arrival_city : item.destination_city
                ).map((stop, idx, arr) => (
                  <div key={idx} className="mb-3 position-relative ps-4 border-start border-2 border-primary-subtle">
                    <div
                      className={`position-absolute start-0 rounded-circle ${idx === 0 || idx === arr.length - 1 ? 'bg-primary' : 'bg-secondary'} text-white`}
                      style={{
                        width: '12px',
                        height: '12px',
                        top: '5px',
                        left: '0',
                        transform: 'translate(-50%, 0)'
                      }}
                    ></div>
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="fw-semibold text-dark-blue mb-0" style={{ marginLeft: '10px' }}>{stop.station}</h6>
                      <span className="badge bg-light text-muted border px-2 py-0.5 rounded-2 font-monospace" style={{ fontSize: '10px' }}>
                        {stop.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Traveler Details Form */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-dark-blue">Traveler Details</h5>
              <button onClick={addTraveler} className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2">
                <FaUserPlus /> Add Traveler
              </button>
            </div>

            {travelers.map((traveler, idx) => (
              <div key={idx} className="border p-3 rounded-3 mb-3 position-relative bg-light">
                {travelers.length > 1 && (
                  <button onClick={() => removeTraveler(idx)} className="btn btn-sm btn-link text-danger position-absolute top-0 end-0 m-2">
                    <FaTrash /> Remove
                  </button>
                )}
                <h6 className="fw-bold mb-3 small text-primary">Traveler #{idx + 1}</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="First Name"
                      required
                      value={traveler.firstName}
                      onChange={(e) => updateTraveler(idx, 'firstName', e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="Last Name"
                      required
                      value={traveler.lastName}
                      onChange={(e) => updateTraveler(idx, 'lastName', e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <input
                      type="number"
                      className="form-control rounded-3"
                      placeholder="Age"
                      required
                      value={traveler.age}
                      onChange={(e) => updateTraveler(idx, 'age', e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <select className="form-select rounded-3" value={traveler.gender} onChange={(e) => updateTraveler(idx, 'gender', e.target.value)}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Seat Selection (Flights & Buses) */}
          {(type === 'flights' || type === 'buses') && (
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-center">
              <h5 className="fw-bold mb-2 text-dark-blue text-start">Choose Seats</h5>
              <p className="text-muted small text-start mb-4">
                Selected: <span className="fw-bold text-primary-blue">{selectedSeats.join(', ') || 'None'}</span> ({selectedSeats.length}/{travelers.length})
                <br />
                <span className="small text-muted">* Columns A and F are premium Window seats (+₹200).</span>
              </p>

              <div className="d-flex flex-column align-items-center bg-light p-4 rounded-4 mx-auto" style={{ maxWidth: '400px' }}>
                <div className="small text-muted border-bottom pb-1 mb-3 w-100 uppercase fw-bold">FRONT OF {type === 'flights' ? 'AIRCRAFT' : 'BUS'}</div>

                <div className="d-flex flex-column gap-2">
                  {seatRows.map(row => (
                    <div key={row} className="d-flex align-items-center gap-2">
                      <span className="fw-bold small text-muted mr-2" style={{ width: '15px' }}>{row}</span>
                      {seatCols.map((col) => {
                        const seatId = `${row}${col}`;
                        const isSelected = selectedSeats.includes(seatId);
                        const isWindow = col === 'A' || col === 'F';
                        let btnClass = 'btn btn-outline-secondary btn-sm rounded-2 ';
                        if (isSelected) btnClass = 'btn btn-primary btn-sm rounded-2 ';
                        else if (isWindow) btnClass = 'btn btn-outline-info btn-sm rounded-2 ';

                        return (
                          <React.Fragment key={col}>
                            <button
                              type="button"
                              onClick={() => toggleSeat(seatId)}
                              className={btnClass}
                              style={{ width: '38px', height: '38px', fontSize: '11px', fontWeight: 'bold' }}
                            >
                              {seatId}
                            </button>
                            {col === 'C' && <div style={{ width: '20px' }}></div>} {/* Aisle */}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="d-flex gap-3 justify-content-center mt-4 small">
                  <span className="d-flex align-items-center gap-1"><span className="bg-primary rounded" style={{ width: '12px', height: '12px' }}></span> Selected</span>
                  <span className="d-flex align-items-center gap-1"><span className="bg-info-subtle border border-info rounded" style={{ width: '12px', height: '12px' }}></span> Window (Extra)</span>
                  <span className="d-flex align-items-center gap-1"><span className="bg-light border rounded" style={{ width: '12px', height: '12px' }}></span> Aisle / Middle</span>
                </div>
              </div>
            </div>
          )}

          {/* Flight Addons Meal & Baggage */}
          {type === 'flights' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold mb-3 text-dark-blue">In-flight Upgrades</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Meal Preference</label>
                  <select className="form-select rounded-3" value={mealSelection} onChange={(e) => setMealSelection(e.target.value)}>
                    <option value="None">None (No Meal)</option>
                    <option value="Veg">Standard Veg Meal (+₹250 per traveler)</option>
                    <option value="Non-Veg">Premium Non-Veg Meal (+₹350 per traveler)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Baggage Allowance</label>
                  <select className="form-select rounded-3" value={baggageUpgrade} onChange={(e) => setBaggageUpgrade(e.target.value)}>
                    <option value="None">Standard (15kg Cabin + 7kg Carry-on)</option>
                    <option value="Extra 10kg">Add Extra 10kg Baggage (+₹1200 per traveler)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Price details */}
        <div className="col-lg-4">
          {/* Coupon widget */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3 text-dark-blue">Promo Coupons</h5>

            {couponError && <div className="alert alert-danger py-2 small d-flex align-items-center gap-2"><FaExclamationTriangle /> {couponError}</div>}
            {couponSuccess && <div className="alert alert-success py-2 small d-flex align-items-center gap-2"><FaCheckCircle /> {couponSuccess}</div>}

            <div className="input-group">
              <input
                type="text"
                className="form-control rounded-start-pill border-end-0 px-3 uppercase fw-bold"
                placeholder="MMTFLIGHT, WELCOME..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button
                onClick={handleApplyCoupon}
                className="btn btn-primary rounded-end-pill px-4 fw-bold"
                type="button"
              >
                APPLY
              </button>
            </div>

            <div className="mt-3 bg-light p-3 rounded-3">
              <small className="fw-bold text-muted d-block mb-1">Available codes to try:</small>
              <span className="badge bg-secondary-subtle text-secondary mr-2 px-2 py-1 rounded">MMTFLIGHT</span>
              <span className="badge bg-secondary-subtle text-secondary mr-2 px-2 py-1 rounded">MMTHOTEL</span>
              <span className="badge bg-secondary-subtle text-secondary mr-2 px-2 py-1 rounded">MMTBUS</span>
              <span className="badge bg-secondary-subtle text-secondary px-2 py-1 rounded">WELCOME</span>
            </div>
          </div>

          {/* Pricing summary */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-3 text-dark-blue">Fare Summary</h5>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Base Fare ({travelers.length} Traveler)</span>
              <span className="fw-bold text-dark-blue">₹{Math.floor(getBasePrice())}</span>
            </div>

            {getAddonCharges() > 0 && (
              <div className="d-flex justify-content-between mb-2 text-info">
                <span className="small">Addons & Upgrades</span>
                <span className="fw-bold">₹{getAddonCharges()}</span>
              </div>
            )}

            {appliedCoupon && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span className="small">Discount ({appliedCoupon.code})</span>
                <span className="fw-bold">- ₹{Math.floor(getDiscount())}</span>
              </div>
            )}

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fw-bold text-dark-blue">Total Amount Due</span>
              <span className="fs-3 fw-bold text-primary-blue">₹{Math.floor(getTotalPrice())}</span>
            </div>

            <button onClick={handleCheckout} className="btn btn-warning w-100 py-3 rounded-pill fw-bold text-white shadow-lg">
              PROCEED TO PAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
