import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaPlane, FaHotel, FaBus, FaSuitcase, FaCar, FaBrain, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';
import AuthModal from './AuthModal';
import LanguageSelector from './LanguageSelector';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    const name = localStorage.getItem('first_name') || localStorage.getItem('username');
    const isStaff = localStorage.getItem('is_staff') === 'true';

    if (token && name) {
      setIsLoggedIn(true);
      setFirstName(name);
      setIsAdmin(isStaff);
    } else {
      setIsLoggedIn(false);
      setFirstName('');
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleProfileUpdate = () => {
      checkAuth();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [location]);

  const handleNav = (path) => {
    const targetPath = path === '/explore' ? '/' : path;
    const scrollTarget = path === '/explore' ? 'search-tabs' : (path === '/' ? 'travel-banner' : 'top');

    if (location.pathname === targetPath) {
      // Already on the page — scroll directly
      if (scrollTarget === 'search-tabs') {
        const el = document.getElementById('search-tabs');
        if (el) {
          const rect = el.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          window.scrollTo({ top: rect.top + scrollTop - 100, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Navigate to the page; use state so ScrollToTop can read it
      navigate(targetPath, { state: { scrollTo: scrollTarget } });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('first_name');
    localStorage.removeItem('is_staff');
    setIsLoggedIn(false);
    setFirstName('');
    setIsAdmin(false);
    navigate('/');
  };

  if (location.pathname === '/') return null;

  return (
    <>
      <nav id="navbar" className="navbar navbar-expand-lg navbar-gt sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '28px', letterSpacing: '-1.5px', fontWeight: '800', color: 'var(--primary-sage)', fontFamily: "'Poppins', sans-serif" }}>Globe</span>
            <span style={{ fontSize: '28px', letterSpacing: '-1.5px', fontWeight: '800', color: '#ff3838', fontFamily: "'Poppins', sans-serif" }}>Trotter</span>
          </Link>

          <div className="d-flex align-items-center gap-2 order-lg-last">
            {isLoggedIn ? (
              <>
                <Link
                  to={isAdmin ? "/admin-dashboard" : "/dashboard"}
                  className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold text-decoration-none"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '14px',
                    color: 'var(--primary-sage)',
                    backgroundColor: 'rgba(45, 74, 62, 0.06)',
                    border: '1px solid rgba(45, 74, 62, 0.15)',
                    borderRadius: '50px',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(45, 74, 62, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(45, 74, 62, 0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <i className='bx bx-user' style={{ fontSize: '18px' }}></i>
                  <span>Hi, {firstName}</span>
                  {isAdmin && (
                    <span style={{
                      fontSize: '10px',
                      backgroundColor: 'var(--primary-sage)',
                      color: '#ffffff',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      marginLeft: '4px',
                      fontWeight: '700'
                    }}>
                      Admin
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="d-flex align-items-center justify-content-center border-0 ms-2"
                  title="Logout"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(220, 53, 69, 0.08)',
                    color: '#dc3545',
                    border: '1px solid rgba(220, 53, 69, 0.15)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.16)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.08)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <FaSignOutAlt size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="navbar-profile-btn"
                title="Login / Signup"
              >
                <i className='bx bx-user'></i>
              </button>
            )}

            {/* Multi-Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="d-flex align-items-center justify-content-center border-0 ms-1 p-2 rounded-circle shadow-sm"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: theme === 'light' ? '#f1f5f9' : '#334155',
                color: theme === 'light' ? '#0f172a' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {theme === 'light' ? <FaMoon size={16} /> : <FaSun size={16} />}
            </button>

            <button className="navbar-toggler border-0 d-lg-none bg-transparent p-0 ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText">
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className="collapse navbar-collapse justify-content-between" id="navbarText">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 d-flex flex-nowrap align-items-center">
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-1.5 fw-semibold border-0 bg-transparent ${location.pathname === '/' ? 'active' : 'text-muted'}`}
                  onClick={() => handleNav('/')}
                >
                  Home
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-1.5 fw-semibold border-0 bg-transparent ${location.pathname === '/search' || location.pathname === '/explore' ? 'active' : 'text-muted'}`}
                  onClick={() => handleNav('/explore')}
                >
                  Explore
                </button>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 py-1.5 fw-semibold border-0 text-decoration-none ${location.pathname.startsWith('/trips') ? 'active text-primary' : 'text-muted'}`}
                  to="/trips"
                >
                  Plan Trips
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 py-1.5 fw-semibold border-0 text-decoration-none ${location.pathname === '/community' ? 'active text-primary' : 'text-muted'}`}
                  to="/community"
                >
                  Community
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-1.5 fw-semibold border-0 bg-transparent ${location.pathname === '/about' ? 'active' : 'text-muted'}`}
                  onClick={() => handleNav('/about')}
                >
                  About
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-1.5 fw-semibold border-0 bg-transparent ${location.pathname === '/contact' ? 'active' : 'text-muted'}`}
                  onClick={() => handleNav('/contact')}
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={checkAuth}
      />
    </>
  );
};

export default Navbar;
