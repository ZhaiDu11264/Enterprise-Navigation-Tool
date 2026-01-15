import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/auth';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Redirect to intended page or dashboard if already authenticated
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    const safeTarget = from === '/admin' && user?.role !== 'admin' ? '/dashboard' : from;
    return <Navigate to={safeTarget} replace />;
  }

  const handleLoginSuccess = () => {
    // Navigation will be handled by the redirect above
  };

  return (
    <div className="login-page">
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
}
