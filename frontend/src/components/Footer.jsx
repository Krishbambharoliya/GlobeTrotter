import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  const location = useLocation();

  const handleLinkClick = (e, path, targetId) => {
    const [targetPath, targetSearch] = path.split('?');
    const currentPath = location.pathname;
    const currentSearch = location.search;

    if (currentPath === targetPath && (!targetSearch || currentSearch === '?' + targetSearch)) {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        if (targetId === 'travel-banner' || targetId === 'search-tabs') {
          const rect = el.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          window.scrollTo({ top: rect.top + scrollTop - 100, behavior: 'smooth' });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer">
      <div className="container foot">
        <div className="footer-content">

          {/* About Column */}
          <div className="footlinks" style={{ flex: '1', minWidth: '250px', margin: '15px 10px' }}>
            <Link className="d-flex align-items-center mb-3 text-decoration-none" to="/" onClick={(e) => handleLinkClick(e, '/', 'navbar')}>
              <span style={{ fontSize: '26px', letterSpacing: '-1.5px', fontWeight: '800', color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>plan</span>
              <span style={{ fontSize: '16px', fontWeight: '800', backgroundColor: '#ff3838', color: '#ffffff', padding: '2px 7px', borderRadius: '5px', fontFamily: "'Poppins', sans-serif", margin: '0 5px', textTransform: 'lowercase', display: 'inline-block', lineHeight: '1.2' }}>your</span>
              <span style={{ fontSize: '26px', letterSpacing: '-1.5px', fontWeight: '800', color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>trip</span>
            </Link>
            <p style={{ color: '#dddddd', fontSize: '15px', lineHeight: '1.6', marginTop: '15px', fontWeight: '500', marginBottom: '8px' }}>
              Making travel planning simple, smart & stress-free
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '13px', lineHeight: '1.5', marginBottom: '6px', fontWeight: '400' }}>
              Your next adventure is just a single click away
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '13px', lineHeight: '1.5', marginBottom: '15px', fontWeight: '400' }}>
              Exploring the world, one dream destination at a time
            </p>
            <div className="social">
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaLinkedinIn /></a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footlinks" style={{ flex: '1', minWidth: '200px', margin: '15px 10px' }}>
            <h4>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
              <li><Link to="/?scroll=travel-banner" onClick={(e) => handleLinkClick(e, '/?scroll=travel-banner', 'travel-banner')}>Home</Link></li>
              <li><Link to="/?tab=flights&scroll=search-tabs" onClick={(e) => handleLinkClick(e, '/?tab=flights&scroll=search-tabs', 'search-tabs')}>Flights</Link></li>
              <li><Link to="/?tab=trains&scroll=search-tabs" onClick={(e) => handleLinkClick(e, '/?tab=trains&scroll=search-tabs', 'search-tabs')}>Trains</Link></li>
              <li><Link to="/?tab=hotels&scroll=search-tabs" onClick={(e) => handleLinkClick(e, '/?tab=hotels&scroll=search-tabs', 'search-tabs')}>Hotels</Link></li>
              <li><Link to="/?tab=packages&scroll=search-tabs" onClick={(e) => handleLinkClick(e, '/?tab=packages&scroll=search-tabs', 'search-tabs')}>Fix Packages</Link></li>
              <li><Link to="/services?scroll=top" onClick={(e) => handleLinkClick(e, '/services?scroll=top', 'top')}>Our Services</Link></li>
              <li><Link to="/about?scroll=top" onClick={(e) => handleLinkClick(e, '/about?scroll=top', 'top')}>About Us</Link></li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="footlinks" style={{ flex: '1', minWidth: '250px', margin: '15px 10px' }}>
            <h4>Get in Touch</h4>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px', color: '#dddddd', fontSize: '14px' }}>
              <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <i className='bx bx-map-pin' style={{ fontSize: '18px', color: 'white', marginTop: '3px' }}></i>
                <span>GlobeTrotter Travel Systems Pvt. Ltd.<br />Cyber City, Gurgaon, India</span>
              </li>
              <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className='bx bx-phone-call' style={{ fontSize: '18px', color: 'white' }}></i>
                <span>+1-800-GT-CARE</span>
              </li>
              <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className='bx bx-envelope' style={{ fontSize: '18px', color: 'white' }}></i>
                <span>support@globetrotter.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="end">
          <p>
            © {new Date().getFullYear()} GlobeTrotter. All Rights Reserved. |{' '}
            <Link to="/terms" style={{ color: '#dddddd', textDecoration: 'none', marginLeft: '5px' }}>Terms & Conditions</Link> |{' '}
            <Link to="/privacy" style={{ color: '#dddddd', textDecoration: 'none', marginLeft: '5px' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
