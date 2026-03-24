import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './QuickActions.css';

interface QuickActionsProps {
  onBatchManagement?: () => void;
  onImportExport?: () => void;
  onAdminPanel?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onBatchManagement,
  onImportExport,
  onAdminPanel
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const t = language === 'zh'
    ? {
        quickActions: '快速操作',
        batchManagement: '批量管理',
        batchManagementDesc: '批量导入、导出和管理链接',
        importExport: '导入/导出',
        importExportDesc: '从 CSV/Excel 导入或导出数据',
        adminPanel: '管理面板',
        adminPanelDesc: '用户管理和系统配置'
      }
    : {
        quickActions: 'Quick Actions',
        batchManagement: 'Batch Management',
        batchManagementDesc: 'Import, export, and manage links in bulk',
        importExport: 'Import/Export',
        importExportDesc: 'Import from CSV/Excel or export your data',
        adminPanel: 'Admin Panel',
        adminPanelDesc: 'User management and system configuration'
      };

  return (
    <div className="quick-actions">
      <h3 className="quick-actions-title">{t.quickActions}</h3>

      <div className="quick-actions-grid">
        {onBatchManagement && (
          <button className="quick-action-card" onClick={onBatchManagement}>
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h4>{t.batchManagement}</h4>
              <p>{t.batchManagementDesc}</p>
            </div>
          </button>
        )}

        {onImportExport && (
          <button className="quick-action-card" onClick={onImportExport}>
            <div className="action-icon">📁</div>
            <div className="action-content">
              <h4>{t.importExport}</h4>
              <p>{t.importExportDesc}</p>
            </div>
          </button>
        )}

        {user?.role === 'admin' && onAdminPanel && (
          <button className="quick-action-card admin-action" onClick={onAdminPanel}>
            <div className="action-icon">⚙️</div>
            <div className="action-content">
              <h4>{t.adminPanel}</h4>
              <p>{t.adminPanelDesc}</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickActions;
