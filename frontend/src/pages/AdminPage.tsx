import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile } from '../components/auth';
import UserManagement from '../components/admin/UserManagement';
import SystemMonitoring from '../components/admin/SystemMonitoring';
import NotificationsPanel from '../components/admin/NotificationsPanel';
import ImportExport from '../components/admin/ImportExport';
import adminService, { AdminStats } from '../services/adminService';
import './AdminPage.css';

type AdminTab = 'users' | 'monitoring' | 'notifications' | 'import-export';

export function AdminPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      title: 'Administration',
      back: 'Back to dashboard',
      users: 'User Management',
      monitoring: 'System Monitoring',
      notifications: 'Notifications',
      importExport: 'Import/Export',
      statsLoading: 'Loading statistics...',
      statsError: 'Failed to load admin statistics',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      adminUsers: 'Administrators',
      recentLogins: 'Recent Logins (24h)'
    },
    zh: {
      title: '\u7ba1\u7406\u540e\u53f0',
      back: '\u8fd4\u56de\u4e3b\u9875',
      users: '\u7528\u6237\u7ba1\u7406',
      monitoring: '\u7cfb\u7edf\u76d1\u63a7',
      notifications: '\u901a\u77e5\u53d1\u5e03',
      importExport: '\u5bfc\u5165/\u5bfc\u51fa',
      statsLoading: '\u6b63\u5728\u52a0\u8f7d\u7edf\u8ba1\u6570\u636e...',
      statsError: '\u52a0\u8f7d\u7ba1\u7406\u7edf\u8ba1\u5931\u8d25',
      totalUsers: '\u7528\u6237\u603b\u6570',
      activeUsers: '\u6d3b\u8dc3\u7528\u6237',
      adminUsers: '\u7ba1\u7406\u5458',
      recentLogins: '\u6700\u8fd124\u5c0f\u65f6\u767b\u5f55'
    }
  } as const;
  const t = translations[language];

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const statsData = await adminService.getSystemStats();
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError(t.statsError);
    } finally {
      setLoading(false);
    }
  }, [t.statsError]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <button
            type="button"
            className="admin-back"
            onClick={() => navigate('/dashboard')}
          >
            <span aria-hidden="true">&lt;</span>
            {t.back}
          </button>
          <h1>{t.title}</h1>
        </div>
        <div className="admin-header-actions">
          <UserProfile compact showLogout={false} />
        </div>
      </header>

      <section className="admin-stats">
        {loading ? (
          <div className="stats-loading">{t.statsLoading}</div>
        ) : error ? (
          <div className="stats-error">{error}</div>
        ) : stats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">{t.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.activeUsers}</div>
              <div className="stat-label">{t.activeUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.adminUsers}</div>
              <div className="stat-label">{t.adminUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.recentLogins}</div>
              <div className="stat-label">{t.recentLogins}</div>
            </div>
          </div>
        ) : null}
      </section>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          {t.users}
        </button>
        <button
          className={`tab-button ${activeTab === 'monitoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitoring')}
        >
          {t.monitoring}
        </button>
        <button
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          {t.notifications}
        </button>
        <button
          className={`tab-button ${activeTab === 'import-export' ? 'active' : ''}`}
          onClick={() => setActiveTab('import-export')}
        >
          {t.importExport}
        </button>
      </div>

      <main className="admin-content">
        {activeTab === 'users' && <UserManagement onStatsUpdate={loadStats} />}
        {activeTab === 'monitoring' && <SystemMonitoring />}
        {activeTab === 'notifications' && <NotificationsPanel />}
        {activeTab === 'import-export' && <ImportExport />}
      </main>
    </div>
  );
}
