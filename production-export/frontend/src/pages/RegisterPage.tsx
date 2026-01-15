import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { RegisterForm } from '../components/auth';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleRegisterSuccess = () => {
    // Navigation handled by redirect above after login
  };

  return (
    <div className="login-page">
      <RegisterForm onSuccess={handleRegisterSuccess} />
    </div>
  );
}

