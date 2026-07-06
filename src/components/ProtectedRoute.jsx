import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FarmContext } from '../context/FarmContext';

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);
  const { farms } = useContext(FarmContext);
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // 1. Not logged in -> go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Logged in, but profile not completed -> force to /profile
  if (!user.profileCompleted && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  // 3. Profile completed, but no farms -> force to /add-farm
  // (Skip this check if they are already on /add-farm, otherwise infinite loop)
  if (user.profileCompleted && farms.length === 0 && location.pathname !== '/add-farm' && location.pathname !== '/profile') {
    return <Navigate to="/add-farm" replace />;
  }

  // 4. Otherwise, allow them to view the protected route
  return <Outlet />;
};

export default ProtectedRoute;
