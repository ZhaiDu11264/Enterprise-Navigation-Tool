import React, { useState } from 'react';
import { useConfigurationSync } from '../../hooks/useConfigurationSync';
import { useAuth } from '../../contexts/AuthContext';
import './ConfigurationUpdateNotification.css';

interface ConfigurationUpdateNotificationProps {
  enabled?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const ConfigurationUpdateNotification: React.FC<ConfigurationUpdateNotificationProps> = ({
  enabled = true,
  position = 'top-right'
}) => {
  const { user } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  
  // Only enable sync for regular users (admins don't need this)
  const shouldSync = enabled && user?.role === 'user';
  
  const { hasUpdates, applyUpdates, lastSync } = useConfigurationSync(shouldSync);

  const handleApplyUpdates = async () => {
    try {
      setIsApplying(true);
      await applyUpdates();
      setShowNotification(false);
      
      // Show success message briefly
      setTimeout(() => {
        setShowNotification(true);
      }, 3000);
      
      // Reload the page to show updated data
      window.location.reload();
      
    } catch (error) {
      console.error('Failed to apply updates:', error);
      alert('更新配置失败，请稍后重试');
    } finally {
      setIsApplying(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    // Show notification again after 5 minutes
    setTimeout(() => {
      setShowNotification(true);
    }, 5 * 60 * 1000);
  };

  // Don't render if not enabled, no updates, or notification is hidden
  if (!shouldSync || !hasUpdates || !showNotification) {
    return null;
  }

  return (
    <div className={`config-update-notification ${position}`}>
      <div className="notification-content">
        <div className="notification-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="notification-text">
          <div className="notification-title">配置已更新</div>
          <div className="notification-message">
            管理员发布了新的配置，点击应用以获取最新内容
          </div>
          {lastSync && (
            <div className="notification-time">
              检测时间: {lastSync.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        <div className="notification-actions">
          <button
            className="apply-button"
            onClick={handleApplyUpdates}
            disabled={isApplying}
          >
            {isApplying ? '应用中...' : '应用更新'}
          </button>
          
          <button
            className="dismiss-button"
            onClick={handleDismiss}
            disabled={isApplying}
          >
            稍后提醒
          </button>
        </div>
        
        <button
          className="close-button"
          onClick={handleDismiss}
          disabled={isApplying}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ConfigurationUpdateNotification;