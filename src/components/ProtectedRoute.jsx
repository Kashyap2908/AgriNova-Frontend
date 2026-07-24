import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FarmContext } from '../context/FarmContext';

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);
  const { farms, selectedFarm } = useContext(FarmContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-bold text-sm">Loading AgriNova session...</p>
      </div>
    );
  }

  // 1. Not logged in -> go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isProfileCompleted = Boolean(user.profileCompleted || user.profile_completed);

  const currentPath = location.pathname;
  const isProfileRoute = currentPath === '/profile' || currentPath === '/complete-profile';
  const isAddFarmRoute = currentPath === '/add-farm';
  const isSelectFarmRoute = currentPath === '/select-farm' || currentPath === '/manage-farms' || currentPath === '/farms';

  // 2. Logged in, but profile not completed -> force to /complete-profile
  if (!isProfileCompleted && !isProfileRoute) {
    return <Navigate to="/complete-profile" replace />;
  }

  // 3. Profile completed, but no farms -> force to /add-farm
  if (isProfileCompleted && farms.length === 0 && !isAddFarmRoute && !isProfileRoute) {
    return <Navigate to="/add-farm" replace />;
  }

  // 4. Profile completed & farms exist, but no active selected farm -> force to /select-farm
  if (isProfileCompleted && farms.length > 0 && !selectedFarm && !isSelectFarmRoute && !isAddFarmRoute && !isProfileRoute) {
    return <Navigate to="/select-farm" replace />;
  }

  // 5. Otherwise, allow access to protected route
  return <Outlet />;
};

export default ProtectedRoute;

