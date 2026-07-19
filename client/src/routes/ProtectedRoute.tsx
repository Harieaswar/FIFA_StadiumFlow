import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import LoadingScreen from '../components/ui/LoadingScreen';

interface Props {
  requiredRoles?: UserRole[];
}

export default function ProtectedRoute({ requiredRoles }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRoles && user && !requiredRoles.includes(user.role as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
