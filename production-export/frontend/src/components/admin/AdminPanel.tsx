import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import UserManagement from './UserManagement';
import ConfigurationManagement from './ConfigurationManagement';
import SystemMonitoring from './SystemMonitoring';
import ImportExport from './ImportExport';
import adminService, { AdminStats } from '../../services/adminService';
import './AdminPanel.css';

interface AdminPanelProps {
  onClose: () => void;
}

type AdminTab = 'users' | 'config' | 'monitoring' | 'import-export';

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const translations = {
    en: {
      accessDenied: 'Access Denied',
      noPermission: "You don't have permission to access the admin panel.",
      title: 'Administration Panel',
      loading: 'Loading statistics...',
      retry: 'Retry',
      users: 'User Management',
      config: 'Default Configurations',
      monitoring: 'System Monitoring',
      importExport: 'Import/Export',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      adminUsers: 'Administrators',
      recentLogins: 'Recent Logins (24h)',
      statsFailed: 'Failed to load system statistics'
    },
    zh: {
      accessDenied: '\u65e0\u6743\u9650\u8bbf\u95ee',
      noPermission: '\u4f60\u6ca1\u6709\u6743\u9650\u8bbf\u95ee\u7ba1\u7406\u9762\u677f\u3002',
      title: '\u7ba1\u7406\u540e\u53f0',
      loading: '\u6b63\u5728\u52a0\u8f7d\u7edf\u8ba1\u6570\u636e...',
      retry: '\u91cd\u8bd5',
      users: '\u7528\u6237\u7ba1\u7406',
      config: '\u9ed8\u8ba4\u914d\u7f6e',
      monitoring: '\u7cfb\u7edf\u76d1\u63a7',
      importExport: '\u5bfc\u5165/\u5bfc\u51fa',
      totalUsers: '\u7528\u6237\u603b\u6570',
      activeUsers: '\u6d3b\u8dc3\u7528\u6237',
      adminUsers: '\u7ba1\u7406\u5458',
      recentLogins: '\u6700\u8fd124\u5c0f\u65f6\u767b\u5f55',
      statsFailed: '\u52a0\u8f7d\u7edf\u8ba1\u6570\u636e\u5931\u8d25'
    }
  } as const;
  const t = translations[language];
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await adminService.getSystemStats();
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load admin stats:', err);
      setError(t.statsFailed);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2>{t.accessDenied}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="admin-panel-content">
          <p>{t.noPermission}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>{t.title}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats-overview">
        {loading ? (
          <div className="loading">{t.loading}</div>
        ) : error ? (
          <div className="error">
            <span>{error}</span>
            <button onClick={loadStats} className="retry-button">{t.retry}</button>
          </div>
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
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          {t.users}
        </button>
        <button
          className={`tab-button ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          {t.config}
        </button>
        <button
          className={`tab-button ${activeTab === 'monitoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitoring')}
        >
          {t.monitoring}
        </button>
        <button
          className={`tab-button ${activeTab === 'import-export' ? 'active' : ''}`}
          onClick={() => setActiveTab('import-export')}
        >
          {t.importExport}
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-panel-content">
        {activeTab === 'users' && <UserManagement onStatsUpdate={loadStats} />}
        {activeTab === 'config' && <ConfigurationManagement />}
        {activeTab === 'monitoring' && <SystemMonitoring />}
        {activeTab === 'import-export' && <ImportExport />}
      </div>
    </div>
  );
};

export default AdminPanel;
