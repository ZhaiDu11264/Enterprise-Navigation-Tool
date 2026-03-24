import React, { useEffect, useState } from 'react';
import { useConfigurationSync } from '../../hooks/useConfigurationSync';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
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
  const { language } = useLanguage();
  const [isApplying, setIsApplying] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  const shouldSync = enabled && user?.role === 'user';
  const { hasUpdates, applyUpdates, lastSync } = useConfigurationSync(shouldSync);

  const translations = {
    en: {
      alertFailed: 'Failed to update configuration. Please try again later.',
      title: 'Configuration Updated',
      message: 'An administrator has published a new configuration. Apply it to get the latest content.',
      detectedAt: 'Detected at',
      applying: 'Applying...',
      apply: 'Apply Update',
      remindLater: 'Remind Me Later',
      close: 'Close'
    },
    zh: {
      alertFailed: '更新配置失败，请稍后重试',
      title: '配置已更新',
      message: '管理员发布了新的配置，点击应用以获取最新内容',
      detectedAt: '检测时间',
      applying: '应用中...',
      apply: '应用更新',
      remindLater: '稍后提醒',
      close: '关闭'
    }
  } as const;

  const t = translations[language];

  const handleApplyUpdates = async () => {
    try {
      setIsApplying(true);
      await applyUpdates();
      setShowNotification(false);
      setTimeout(() => {
        setShowNotification(true);
      }, 3000);
      window.location.reload();
    } catch (error) {
      console.error('Failed to apply updates:', error);
      alert(t.alertFailed);
    } finally {
      setIsApplying(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    setTimeout(() => {
      setShowNotification(true);
    }, 5 * 60 * 1000);
  };

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
          <div className="notification-title">{t.title}</div>
          <div className="notification-message">{t.message}</div>
          {lastSync && (
            <div className="notification-time">
              {t.detectedAt}: {lastSync.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="notification-actions">
          <button className="apply-button" onClick={handleApplyUpdates} disabled={isApplying}>
            {isApplying ? t.applying : t.apply}
          </button>

          <button className="dismiss-button" onClick={handleDismiss} disabled={isApplying}>
            {t.remindLater}
          </button>
        </div>

        <button className="close-button" onClick={handleDismiss} disabled={isApplying} aria-label={t.close}>
          ×
        </button>
      </div>
    </div>
  );
};

export default ConfigurationUpdateNotification;
