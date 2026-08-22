import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaEye, FaEdit, FaTimes } from 'react-icons/fa';
import api from '../api';
import { mockTrips, getTripStatus } from '../data/mockData';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLOR_PALETTE = ['#0ea5e9', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899', '#6366f1'];

const CalendarView = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Default March 2026 for demo data
  const [allTrips, setAllTrips] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'my', 'community'
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('trips/');
      if (res.data && res.data.length > 0) {
        setAllTrips(res.data);
      } else {
        setAllTrips(mockTrips);
      }
    } catch {
      setAllTrips(mockTrips);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = useMemo(() => {
    if (filter === 'my') {
      return allTrips.filter(t => !t.is_public);
    }
    if (filter === 'community') {
      return allTrips.filter(t => t.is_public);
    }
    return allTrips;
  }, [allTrips, filter]);

  const calendarEvents = useMemo(() => {
    return filteredTrips.map((t, idx) => {
      const startDate = t.start_date || t.dates?.split(' - ')[0] || '2026-03-10';
      const endDate = t.end_date || t.dates?.split(' - ')[1] || '2026-03-17';
      return {
        id: t.id,
        title: t.name || t.destination || 'Trip',
        destination: t.destination || t.name,
        start: startDate,
        end: endDate,
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
        status: getTripStatus(startDate, endDate),
        rawTrip: t
      };
    });
  }, [filteredTrips]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarEvents.filter(ev => dateStr >= ev.start && dateStr <= ev.end);
  };

  const handleDayClick = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    navigate(`/trips/new?date=${dateStr}`);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-cell empty" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day);
    const dateObj = new Date(year, month, day);
    const isToday = new Date().toDateString() === dateObj.toDateString();

    cells.push(
      <div 
        key={day} 
        className={`calendar-cell ${isToday ? 'today' : ''}`}
        onClick={(e) => {
          // If user clicks cell background (not an event pill)
          if (e.target === e.currentTarget || e.target.classList.contains('calendar-day-num') || e.target.classList.contains('calendar-events')) {
            handleDayClick(day);
          }
        }}
        title="Click to plan a trip on this date"
      >
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="calendar-day-num">{day}</span>
          <span className="add-trip-icon text-muted small d-none d-md-inline" style={{ opacity: 0.6, fontSize: '11px' }}>
            <FaPlus size={10} /> Add
          </span>
        </div>
        <div className="calendar-events">
          {dayEvents.map(ev => (
            <button
              key={`${ev.id}-${day}`}
              type="button"
              className="calendar-event-pill text-decoration-none border-0 text-start w-100 text-truncate"
              style={{ backgroundColor: ev.color, color: '#ffffff', cursor: 'pointer', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', marginBottom: '3px' }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTrip(ev);
              }}
              title={`${ev.title} (${ev.start} to ${ev.end})`}
            >
              {ev.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 calendar-page" style={{ maxWidth: '1200px' }}>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2 text-dark-blue">
            <FaCalendarAlt className="text-primary-sage" /> Trip Calendar
          </h2>
          <p className="text-muted small mb-0">View all your scheduled itineraries and adventures at a glance</p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Filters */}
          <div className="btn-group btn-group-sm me-2 shadow-sm rounded-pill p-1 bg-body-tertiary border">
            <button 
              className={`btn btn-sm rounded-pill border-0 fw-semibold ${filter === 'all' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
              onClick={() => setFilter('all')}
            >
              All Trips
            </button>
            <button 
              className={`btn btn-sm rounded-pill border-0 fw-semibold ${filter === 'my' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
              onClick={() => setFilter('my')}
            >
              My Trips
            </button>
            <button 
              className={`btn btn-sm rounded-pill border-0 fw-semibold ${filter === 'community' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
              onClick={() => setFilter('community')}
            >
              Community
            </button>
          </div>

          {/* Month Navigation */}
          <div className="d-flex align-items-center gap-2 bg-body-tertiary p-1 px-3 rounded-pill border shadow-sm">
            <button type="button" className="btn btn-sm p-1 border-0 text-muted" onClick={prevMonth} title="Previous Month">
              <FaChevronLeft size={13} />
            </button>
            <span className="fw-bold px-2 text-dark-blue" style={{ minWidth: '130px', textAlign: 'center' }}>
              {MONTHS[month]} {year}
            </span>
            <button type="button" className="btn btn-sm p-1 border-0 text-muted" onClick={nextMonth} title="Next Month">
              <FaChevronRight size={13} />
            </button>
          </div>

          <button onClick={goToToday} className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold">
            Today
          </button>

          <Link to="/trips/new" className="btn btn-sm btn-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-sm">
            <FaPlus size={12} /> Plan Trip
          </Link>
        </div>
      </div>

      {/* Calendar Grid Card */}
      <div className="card border-0 rounded-4 overflow-hidden shadow-lg mb-5" style={{ background: 'var(--warm-card, #ffffff)' }}>
        <div className="calendar-grid-header py-3 px-2 border-bottom fw-bold text-uppercase text-center text-muted" style={{ fontSize: '13px', letterSpacing: '1px' }}>
          {DAYS.map(d => (
            <div key={d} className="calendar-header-cell">{d}</div>
          ))}
        </div>
        <div className="calendar-grid p-2">{cells}</div>
      </div>

      {/* Upcoming Trips List */}
      <div className="mb-4">
        <h4 className="fw-bold mb-3 text-dark-blue">Upcoming Trips in {MONTHS[month]}</h4>
        {calendarEvents.length === 0 ? (
          <div className="card border-0 rounded-4 p-4 text-center text-muted shadow-sm">
            <p className="mb-2">No trips scheduled for this view.</p>
            <div>
              <Link to="/trips/new" className="btn btn-sm btn-primary rounded-pill px-4 fw-bold">
                + Create A Trip Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {calendarEvents.slice(0, 4).map(ev => (
              <div className="col-md-6 col-lg-3" key={ev.id}>
                <div 
                  className="card border-0 rounded-4 p-3 shadow-sm h-100 transition-all hover-elevation" 
                  style={{ cursor: 'pointer', background: 'var(--warm-card, #ffffff)' }}
                  onClick={() => setSelectedTrip(ev)}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge rounded-pill px-2.5 py-1 text-white fw-bold" style={{ backgroundColor: ev.color, fontSize: '11px' }}>
                      {ev.status}
                    </span>
                    <span className="small text-muted fw-semibold">
                      <FaClock size={11} className="me-1" /> {ev.start}
                    </span>
                  </div>
                  <h6 className="fw-bold text-dark-blue mb-1 text-truncate">{ev.title}</h6>
                  <p className="text-muted small mb-3 text-truncate">
                    <FaMapMarkerAlt size={12} className="text-danger me-1" /> {ev.destination}
                  </p>
                  <div className="d-flex align-items-center gap-2 mt-auto">
                    <Link to={`/trips/${ev.id}`} className="btn btn-xs btn-outline-primary rounded-pill px-3 py-1 fw-bold w-100 text-center" style={{ fontSize: '12px' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-3">
              <div className="modal-header border-0 pb-0 d-flex align-items-center justify-content-between">
                <span className="badge rounded-pill px-3 py-1.5 text-white fw-bold" style={{ backgroundColor: selectedTrip.color }}>
                  {selectedTrip.status}
                </span>
                <button type="button" className="btn-close" onClick={() => setSelectedTrip(null)}></button>
              </div>

              <div className="modal-body py-3">
                <h4 className="fw-bold text-dark-blue mb-2">{selectedTrip.title}</h4>
                <p className="text-muted small mb-3 d-flex align-items-center gap-2">
                  <FaMapMarkerAlt className="text-danger" /> Destination: <strong className="text-dark">{selectedTrip.destination}</strong>
                </p>

                <div className="p-3 rounded-3 bg-body-tertiary mb-3 border">
                  <div className="row g-2 text-center">
                    <div className="col-6 border-end">
                      <span className="small text-muted d-block">Start Date</span>
                      <strong className="text-dark small">{selectedTrip.start}</strong>
                    </div>
                    <div className="col-6">
                      <span className="small text-muted d-block">End Date</span>
                      <strong className="text-dark small">{selectedTrip.end}</strong>
                    </div>
                  </div>
                </div>

                {selectedTrip.rawTrip?.budget && (
                  <div className="d-flex justify-content-between align-items-center small text-muted mb-2 px-1">
                    <span>Estimated Budget:</span>
                    <span className="fw-bold text-success">₹{selectedTrip.rawTrip.budget.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="modal-footer border-0 pt-0 d-flex gap-2">
                <button className="btn btn-light rounded-pill px-3 fw-semibold" onClick={() => setSelectedTrip(null)}>
                  Close
                </button>
                <Link to={`/trips/${selectedTrip.id}/edit`} className="btn btn-outline-primary rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1">
                  <FaEdit size={13} /> Edit
                </Link>
                <Link to={`/trips/${selectedTrip.id}`} className="btn btn-primary rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-1">
                  <FaEye size={13} /> View Itinerary
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
