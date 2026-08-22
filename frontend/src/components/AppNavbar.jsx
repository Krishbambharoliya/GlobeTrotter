import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter, FaSun, FaMoon, FaUser } from 'react-icons/fa';
import LanguageSelector from './LanguageSelector';
import { useTheme } from '../context/ThemeContext';

const AppNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('region');
  const [sortBy, setSortBy] = useState('date');
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    setFirstName(localStorage.getItem('first_name') || localStorage.getItem('username') || '');
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Explore' },
    { path: '/trips', label: 'Plan Trips' },
    { path: '/community', label: 'Community' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-gt app-navbar sticky-top">
      <div className="container-fluid px-3 px-lg-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <Link className="navbar-brand d-flex align-items-center me-0" to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '24px', letterSpacing: '-1px', fontWeight: '800', color: 'var(--primary-sage)', fontFamily: "'Poppins', sans-serif" }}>Globe</span>
            <span style={{ fontSize: '24px', letterSpacing: '-1px', fontWeight: '800', color: '#ff3838', fontFamily: "'Poppins', sans-serif" }}>Trotter</span>
          </Link>

          <form className="app-navbar-search d-none d-xl-flex" role="search" onSubmit={handleSearch} style={{ width: '260px' }}>
            <div className="input-group input-group-sm">
            <span className="input-group-text border-end-0 bg-transparent"><FaSearch className="text-muted" size={13} /></span>
              <label className="visually-hidden" htmlFor="app-navbar-search">Search destinations and activities</label>
              <input
                id="app-navbar-search"
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="collapse navbar-collapse justify-content-center" id="appNavCollapse">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 d-flex flex-nowrap align-items-center p-1 rounded-pill border border-secondary border-opacity-25" style={{ background: 'rgba(0,0,0,0.15)' }}>
            {navLinks.map(({ path, label }) => (
              <li className="nav-item" key={path}>
                <NavLink
                  className={({ isActive }) => `nav-link px-3 py-1.5 fw-semibold rounded-pill text-decoration-none ${isActive || (path !== '/' && location.pathname.startsWith(path)) ? 'active bg-primary text-white shadow-sm' : 'text-muted'}`}
                  to={path}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <form className="d-lg-none mt-2" role="search" onSubmit={handleSearch}>
            <div className="input-group">
              <label className="visually-hidden" htmlFor="app-navbar-mobile-search">Search destinations and activities</label>
              <input id="app-navbar-mobile-search" type="text" className="form-control" placeholder="Search destinations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button type="submit" className="btn btn-primary">Go</button>
            </div>
          </form>
        </div>

        <div className="d-flex align-items-center gap-1.5 ms-auto">
          <select
            className="form-select form-select-sm app-nav-select d-none d-xxl-block"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            title="Group by"
          >
            <option value="region">Group by: Region</option>
            <option value="date">Group by: Date</option>
            <option value="budget">Group by: Budget</option>
          </select>

          <button type="button" className="btn btn-sm btn-outline-secondary rounded-3 d-none d-xxl-flex align-items-center gap-1 app-nav-filter-btn">
            <FaFilter size={11} /> Filter
          </button>

          <select
            className="form-select form-select-sm app-nav-select d-none d-xxl-block"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            title="Sort by"
          >
            <option value="date">Sort: Date</option>
            <option value="name">Sort: Name</option>
            <option value="budget">Sort: Budget</option>
          </select>

          <LanguageSelector />

          <button
            type="button"
            onClick={toggleTheme}
            className="d-flex align-items-center justify-content-center border-0 rounded-circle ms-1"
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            style={{ width: '36px', height: '36px', backgroundColor: theme === 'light' ? '#f1f5f9' : '#334155', color: theme === 'light' ? '#0f172a' : '#f8fafc', cursor: 'pointer' }}
          >
            {theme === 'light' ? <FaMoon size={14} /> : <FaSun size={14} />}
          </button>

          <Link
            to="/dashboard"
            className="app-profile-btn d-flex align-items-center justify-content-center rounded-circle text-decoration-none ms-1"
            title={firstName ? `Hi, ${firstName}` : 'Profile'}
          >
            <FaUser size={15} />
          </Link>

          <button className="navbar-toggler border-0 d-lg-none ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#appNavCollapse" aria-controls="appNavCollapse" aria-label="Open navigation menu">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
