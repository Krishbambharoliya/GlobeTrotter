import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

const PlanTripFAB = () => (
  <Link
    to="/trips/new"
    className="plan-trip-fab d-flex align-items-center gap-2 text-decoration-none"
    title="Plan a trip"
  >
    <FaPlus size={18} />
    <span className="d-none d-sm-inline fw-bold">Plan a trip</span>
  </Link>
);

export default PlanTripFAB;
