import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
// LoginForm 由 LoginModal 内部渲染
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { LoginModal } from '../components/auth/LoginModal';

export function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { setTransparentMode } = useSettings();

  // 登录页也强制不透明，避免沿用管理员的透明模式残留
  useEffect(() => {
    setTransparentMode(false);
  }, [setTransparentMode]);

  // Redirect to intended page or dashboard if already authenticated
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    const safeTarget = from === '/admin' && user?.role !== 'admin' ? '/dashboard' : from;
    return <Navigate to={safeTarget} replace />;
  }

  const handleLoginSuccess = () => {
    // Navigation will be handled by the redirect above
  };

  const fromPath = (location.state as any)?.from?.pathname || '/';

  return (
    <LoginModal isOpen={true} onClose={() => navigate(fromPath)} />
  );
}
