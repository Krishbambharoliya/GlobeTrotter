import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container py-5 text-center my-5">
      <h1 className="display-1 fw-bold text-primary-blue mb-2">404</h1>
      <h3 className="fw-bold mb-3 text-dark-blue">Oops! Destination Not Found</h3>
      <p className="text-muted mb-4 max-w-md mx-auto">
        The travel page you are trying to visit does not exist or has been relocated to another coordinate.
      </p>
      <Link to="/" className="btn btn-warning rounded-pill px-4 fw-bold text-white shadow-sm">
        Back to Safe Hub
      </Link>
    </div>
  );
};

export default NotFound;
