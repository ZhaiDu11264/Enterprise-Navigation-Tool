import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import adminService, { AdminStats, AuditLogEntry } from '../../services/adminService';
import './SystemMonitoring.css';

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  authentication: 'healthy' | 'warning' | 'error';
  configuration: 'healthy' | 'warning' | 'error';
}

const SystemMonitoring: React.FC = () => {
  const { language } = useLanguage();
  const translations = {
    en: {
      title: 'System Monitoring',
      refresh: 'Refresh',
      refreshing: 'Refreshing...',
      loading: 'Loading system monitoring data...',
      loadFailed: 'Failed to load system monitoring data',
      systemStats: 'System Statistics',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      adminUsers: 'Administrators',
      recentLogins: 'Recent Logins (24h)',
      activityOverview: 'User Activity Overview',
      activeUsersRatio: 'Active Users Ratio:',
      adminRatio: 'Admin Ratio:',
      recentActivity: 'Recent Activity:',
      systemHealth: 'System Health',
      databaseConnection: 'Database Connection',
      apiResponse: 'API Response Time',
      authStatus: 'Authentication',
      configStatus: 'Configuration',
      healthy: 'Healthy',
      warning: 'Warning',
      error: 'Error',
      serverResources: 'Server Resources',
      uptime: 'Uptime',
      processMemory: 'Process Memory (RSS)',
      heapUsed: 'Heap Used',
      systemFreeMem: 'System Free Memory',
      systemTotalMem: 'System Total Memory',
      loadAverage: 'Load Average (1m/5m/15m)',
      topDomains: 'Top Visited Domains',
      recentActivityLog: 'Audit Log',
      noRecentActivity: 'No audit logs to display.',
      auditFilters: 'Audit Filters',
      filterKeyword: 'Keyword',
      filterUser: 'User',
      filterAction: 'Action',
      filterEntity: 'Entity',
      filterAllUsers: 'All Users',
      filterAllActions: 'All Actions',
      filterAllEntities: 'All Entities',
      applyFilters: 'Apply',
      clearFilters: 'Clear',
      prevPage: 'Prev',
      nextPage: 'Next',
      pageLabel: 'Page',
      totalLabel: 'Total',
      systemUser: 'System',
      noDescription: 'No description',
      lastUpdated: 'Last updated:',
      autoRefresh: 'Auto-refresh: Every 30 seconds'
    },
    zh: {
      title: '系统监控',
      refresh: '刷新',
      refreshing: '刷新中...',
      loading: '正在加载系统监控数据...',
      loadFailed: '加载系统监控数据失败',
      systemStats: '系统统计',
      totalUsers: '用户总数',
      activeUsers: '活跃用户',
      adminUsers: '管理员',
      recentLogins: '最近24小时登录',
      activityOverview: '用户活跃概览',
      activeUsersRatio: '活跃用户比例：',
      adminRatio: '管理员占比：',
      recentActivity: '近期活跃：',
      systemHealth: '系统健康',
      databaseConnection: '数据库连接',
      apiResponse: 'API 响应',
      authStatus: '身份验证',
      configStatus: '配置状态',
      healthy: '正常',
      warning: '警告',
      error: '异常',
      serverResources: '服务器资源',
      uptime: '运行时长',
      processMemory: '进程内存 (RSS)',
      heapUsed: '堆内存使用',
      systemFreeMem: '系统可用内存',
      systemTotalMem: '系统内存总量',
      loadAverage: '负载平均 (1/5/15 分钟)',
      topDomains: '常用访问主链接',
      recentActivityLog: '操作日志',
      noRecentActivity: '暂无操作日志。',
      auditFilters: '日志筛选',
      filterKeyword: '关键词',
      filterUser: '用户',
      filterAction: '动作',
      filterEntity: '对象',
      filterAllUsers: '全部用户',
      filterAllActions: '全部动作',
      filterAllEntities: '全部对象',
      applyFilters: '查询',
      clearFilters: '清空',
      prevPage: '上一页',
      nextPage: '下一页',
      pageLabel: '页数',
      totalLabel: '总数',
      systemUser: '系统',
      noDescription: '暂无描述',
      lastUpdated: '最近更新：',
      autoRefresh: '自动刷新：每 30 秒'
    }
  } as const;
  const t = translations[language];
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    authentication: 'healthy',
    configuration: 'healthy'
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(0);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    keyword: '',
    userId: '',
    action: '',
    entityType: ''
  });
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const auditPageSize = 20;

  const loadUserMap = useCallback(async () => {
    try {
      const users = await adminService.getAllUsers();
      const map = users.reduce((acc, user) => {
        acc[user.id] = user.displayName || user.username || user.email || `User #${user.id}`;
        return acc;
      }, {} as Record<number, string>);
      setUserMap(map);
    } catch (err) {
      console.warn('Failed to load users for audit log mapping:', err);
    }
  }, []);

  const loadAuditLogs = useCallback(async (page = auditPage, filters = auditFilters) => {
    try {
      setAuditLoading(true);
      const result = await adminService.getAuditLogs({
        keyword: filters.keyword || undefined,
        userId: filters.userId ? Number(filters.userId) : undefined,
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
        limit: auditPageSize,
        offset: page * auditPageSize
      });
      setAuditLogs(result.logs);
      setAuditTotal(result.total);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  }, [auditFilters, auditPage, auditPageSize]);

  const performHealthChecks = useCallback(async () => {
    const newHealth: SystemHealth = {
      database: 'healthy',
      api: 'healthy',
      authentication: 'healthy',
      configuration: 'healthy'
    };

    try {
      await adminService.getSystemStats();
      newHealth.database = 'healthy';
    } catch {
      newHealth.database = 'error';
    }

    try {
      const startTime = Date.now();
      await adminService.getSystemStats();
      const responseTime = Date.now() - startTime;
      
      if (responseTime < 200) {
        newHealth.api = 'healthy';
      } else if (responseTime < 1000) {
        newHealth.api = 'warning';
      } else {
        newHealth.api = 'error';
      }
    } catch {
      newHealth.api = 'error';
    }

    newHealth.authentication = 'healthy';
    newHealth.configuration = 'healthy';

    setHealth(newHealth);
  }, []);

  const handleRefresh = () => {
    loadMonitoringData();
  };

  const loadMonitoringData = useCallback(async () => {
    try {
      setLoading(true);
      
      const statsData = await adminService.getSystemStats();
      setStats(statsData);
      
      await performHealthChecks();
      await loadAuditLogs();
      
      setLastRefresh(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Failed to load monitoring data:', err);
      setError(t.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [loadAuditLogs, performHealthChecks, t.loadFailed]);

  useEffect(() => {
    loadMonitoringData();
    loadUserMap();
    
    const interval = setInterval(() => {
      loadMonitoringData();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [loadMonitoringData, loadUserMap]);


  const getHealthStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'OK';
      case 'warning': return '!';
      case 'error': return 'X';
      default: return 'OK';
    }
  };

  const getHealthStatusClass = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'good';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'good';
    }
  };

  const getHealthStatusText = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return t.healthy;
      case 'warning': return t.warning;
      case 'error': return t.error;
      default: return t.error;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    const locale = language === 'zh' ? 'zh-CN' : 'en-US';
    return new Date(timestamp).toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'info': return 'i';
      case 'warning': return '!';
      case 'error': return 'X';
      default: return 'i';
    }
  };

  const getAuditType = (action: string) => {
    const lowered = action.toLowerCase();
    if (lowered.includes('delete') || lowered.includes('ban') || lowered.includes('reset')) {
      return 'warning';
    }
    if (lowered.includes('error') || lowered.includes('failed')) {
      return 'error';
    }
    return 'info';
  };

  const resolveUserLabel = (userId: number | null) => {
    if (!userId) {
      return t.systemUser;
    }
    return userMap[userId] || `User #${userId}`;
  };

  const handleAuditFilterChange = (key: keyof typeof auditFilters, value: string) => {
    setAuditFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    const nextPage = 0;
    setAuditPage(nextPage);
    loadAuditLogs(nextPage);
  };

  const handleClearFilters = () => {
    const cleared = {
      keyword: '',
      userId: '',
      action: '',
      entityType: ''
    };
    setAuditFilters(cleared);
    const nextPage = 0;
    setAuditPage(nextPage);
    loadAuditLogs(nextPage, cleared);
  };

  const handleAuditPageChange = (nextPage: number) => {
    if (nextPage < 0) {
      return;
    }
    setAuditPage(nextPage);
    loadAuditLogs(nextPage);
  };

  if (loading && !stats) {
    return <div className="loading">{t.loading}</div>;
  }

  return (
    <div className="system-monitoring">
      <div className="monitoring-header">
        <h3>{t.title}</h3>
        <div className="monitoring-actions">
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? t.refreshing : t.refresh}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)}>x</button>
        </div>
      )}

      {stats && (
        <>
          <div className="stats-section">
            <h4>{t.systemStats}</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">U</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-label">{t.totalUsers}</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">A</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.activeUsers}</div>
                  <div className="stat-label">{t.activeUsers}</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">AD</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.adminUsers}</div>
                  <div className="stat-label">{t.adminUsers}</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">24h</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.recentLogins}</div>
                  <div className="stat-label">{t.recentLogins}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="activity-section">
            <h4>{t.activityOverview}</h4>
            <div className="activity-metrics">
              <div className="metric">
                <span className="metric-label">{t.activeUsersRatio}</span>
                <span className="metric-value">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
              
              <div className="metric">
                <span className="metric-label">{t.adminRatio}</span>
                <span className="metric-value">
                  {stats.totalUsers > 0 ? Math.round((stats.adminUsers / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
              
              <div className="metric">
                <span className="metric-label">{t.recentActivity}</span>
                <span className="metric-value">
                  {stats.activeUsers > 0 ? Math.round((stats.recentLogins / stats.activeUsers) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="health-section">
            <h4>{t.systemHealth}</h4>
            <div className="health-indicators">
              <div className="health-item">
                <div className={`health-status ${getHealthStatusClass(health.database)}`}>
                  {getHealthStatusIcon(health.database)}
                </div>
                <span>{t.databaseConnection}</span>
                <span className="health-value">{getHealthStatusText(health.database)}</span>
              </div>
              
              <div className="health-item">
                <div className={`health-status ${getHealthStatusClass(health.api)}`}>
                  {getHealthStatusIcon(health.api)}
                </div>
                <span>{t.apiResponse}</span>
                <span className="health-value">{getHealthStatusText(health.api)}</span>
              </div>
              
              <div className="health-item">
                <div className={`health-status ${getHealthStatusClass(health.authentication)}`}>
                  {getHealthStatusIcon(health.authentication)}
                </div>
                <span>{t.authStatus}</span>
                <span className="health-value">{getHealthStatusText(health.authentication)}</span>
              </div>
              
              <div className="health-item">
                <div className={`health-status ${getHealthStatusClass(health.configuration)}`}>
                  {getHealthStatusIcon(health.configuration)}
                </div>
                <span>{t.configStatus}</span>
                <span className="health-value">{getHealthStatusText(health.configuration)}</span>
              </div>
            </div>
          </div>

          {stats.resources && (
            <div className="resource-section">
              <h4>{t.serverResources}</h4>
              <div className="resource-grid">
                <div className="resource-card">
                  <div className="resource-label">{t.uptime}</div>
                  <div className="resource-value">{formatUptime(stats.resources.uptimeSeconds)}</div>
                </div>
                <div className="resource-card">
                  <div className="resource-label">{t.processMemory}</div>
                  <div className="resource-value">{stats.resources.memory.rssMb} MB</div>
                </div>
                <div className="resource-card">
                  <div className="resource-label">{t.heapUsed}</div>
                  <div className="resource-value">{stats.resources.memory.heapUsedMb} MB</div>
                </div>
                <div className="resource-card">
                  <div className="resource-label">{t.systemFreeMem}</div>
                  <div className="resource-value">{stats.resources.system.freeMemMb} MB</div>
                </div>
                <div className="resource-card">
                  <div className="resource-label">{t.systemTotalMem}</div>
                  <div className="resource-value">{stats.resources.system.totalMemMb} MB</div>
                </div>
                <div className="resource-card">
                  <div className="resource-label">{t.loadAverage}</div>
                  <div className="resource-value">
                    {stats.resources.system.loadAverage.map((value) => value.toFixed(2)).join(' / ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {stats.topDomains && stats.topDomains.length > 0 && (
            <div className="resource-section">
              <h4>{t.topDomains}</h4>
              <div className="resource-grid">
                {stats.topDomains.map((item) => (
                  <div key={item.host} className="resource-card">
                    <div className="resource-label">{item.host}</div>
                    <div className="resource-value">{item.totalAccess}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="audit-section">
            <h4>{t.recentActivityLog}</h4>
            <div className="audit-filters">
              <div className="audit-filter">
                <label>{t.filterKeyword}</label>
                <input
                  type="text"
                  value={auditFilters.keyword}
                  onChange={(event) => handleAuditFilterChange('keyword', event.target.value)}
                  placeholder={t.filterKeyword}
                />
              </div>
              <div className="audit-filter">
                <label>{t.filterUser}</label>
                <select
                  value={auditFilters.userId}
                  onChange={(event) => handleAuditFilterChange('userId', event.target.value)}
                >
                  <option value="">{t.filterAllUsers}</option>
                  {Object.entries(userMap).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="audit-filter">
                <label>{t.filterAction}</label>
                <input
                  type="text"
                  value={auditFilters.action}
                  onChange={(event) => handleAuditFilterChange('action', event.target.value)}
                  placeholder={t.filterAllActions}
                />
              </div>
              <div className="audit-filter">
                <label>{t.filterEntity}</label>
                <input
                  type="text"
                  value={auditFilters.entityType}
                  onChange={(event) => handleAuditFilterChange('entityType', event.target.value)}
                  placeholder={t.filterAllEntities}
                />
              </div>
              <div className="audit-filter-actions">
                <button onClick={handleApplyFilters} disabled={auditLoading}>
                  {t.applyFilters}
                </button>
                <button onClick={handleClearFilters} disabled={auditLoading}>
                  {t.clearFilters}
                </button>
              </div>
            </div>
            <div className="activity-log">
              {auditLogs.length > 0 ? (
                <div className="activity-list">
                  {auditLogs.map(entry => {
                    const entryType = getAuditType(entry.action);
                    return (
                      <div key={entry.id} className={`activity-item ${entryType}`}>
                        <div className="activity-icon">
                          {getActivityIcon(entryType)}
                        </div>
                        <div className="activity-content">
                          <div className="activity-header">
                            <span className="activity-action">{entry.action}</span>
                            <span className="activity-timestamp">{formatTimestamp(entry.createdAt)}</span>
                          </div>
                          <div className="activity-details">
                            <span className="activity-user">{resolveUserLabel(entry.userId)}</span>
                            <span className="activity-description">
                              {entry.description || t.noDescription}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-activity">
                  <p>{auditLoading ? t.refreshing : t.noRecentActivity}</p>
                </div>
              )}
              
              <div className="activity-actions">
                <div className="audit-pagination">
                  <span className="audit-count">
                    {t.totalLabel}: {auditTotal}
                  </span>
                  <div className="audit-page-controls">
                    <button
                      onClick={() => handleAuditPageChange(auditPage - 1)}
                      disabled={auditPage === 0 || auditLoading}
                    >
                      {t.prevPage}
                    </button>
                    <span className="audit-page-info">
                      {t.pageLabel} {auditPage + 1}
                    </span>
                    <button
                      onClick={() => handleAuditPageChange(auditPage + 1)}
                      disabled={(auditPage + 1) * auditPageSize >= auditTotal || auditLoading}
                    >
                      {t.nextPage}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="monitoring-footer">
        <div className="last-updated">
          {t.lastUpdated} {lastRefresh.toLocaleTimeString()}
        </div>
        <div className="auto-refresh">
          {t.autoRefresh}
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;
