import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ProtectedRoute } from './components/auth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SearchPage } from './pages/SearchPage';
import { AdminPage } from './pages/AdminPage';
import { PublicHomePage } from './pages/PublicHomePage';
import { PublicSettingsPage } from './pages/PublicSettingsPage';
import { ErrorBoundary, NotificationProvider } from './components/common';
import ConfigurationUpdateNotification from './components/common/ConfigurationUpdateNotification';
import './App.css';

function HomeRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <PublicHomePage />;
}

function App() {
  return (
    <LanguageProvider>
      <SettingsProvider>
        <ErrorBoundary>
          <NotificationProvider>
            <AuthProvider>
              <Router>
                <div className="App">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/guest-settings" element={<PublicSettingsPage />} />
                    
                    {/* Protected routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/search"
                      element={
                        <ProtectedRoute>
                          <SearchPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Public home */}
                    <Route path="/" element={<HomeRoute />} />
                    
                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  
                  {/* Global configuration update notification - disabled in development */}
                  {process.env.NODE_ENV === 'production' && <ConfigurationUpdateNotification />}
                </div>
              </Router>
            </AuthProvider>
          </NotificationProvider>
        </ErrorBoundary>
      </SettingsProvider>
    </LanguageProvider>
  );
}

export default App;
