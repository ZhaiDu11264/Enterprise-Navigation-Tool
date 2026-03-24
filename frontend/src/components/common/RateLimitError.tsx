import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './RateLimitError.css';

interface RateLimitErrorProps {
  onRetry?: () => void;
  retryAfter?: number;
}

const RateLimitError: React.FC<RateLimitErrorProps> = ({
  onRetry,
  retryAfter = 900
}) => {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(retryAfter);

  const translations = {
    en: {
      title: 'Too Many Requests',
      description: 'To protect the server, access is temporarily limited. This usually happens when too many requests are sent in a short time.',
      waitPrefix: 'Please wait',
      waitSuffix: 'before retrying',
      retry: 'Retry',
      helpTitle: 'If the issue continues:',
      help1: 'Refresh the page or clear browser cache',
      help2: 'Check whether another program is sending requests automatically',
      help3: 'Contact the system administrator for help'
    },
    zh: {
      title: '请求过于频繁',
      description: '为了保护服务器，我们暂时限制了您的访问。这通常发生在短时间内发送了太多请求时。',
      waitPrefix: '请等待',
      waitSuffix: '后重试',
      retry: '重新尝试',
      helpTitle: '如果问题持续存在：',
      help1: '刷新页面或清除浏览器缓存',
      help2: '检查是否有其他程序在自动发送请求',
      help3: '联系系统管理员获取帮助'
    }
  } as const;

  const t = translations[language];

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    if (timeLeft <= 0 && onRetry) {
      onRetry();
    }
  };

  return (
    <div className="rate-limit-error">
      <div className="rate-limit-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>

      <h3>{t.title}</h3>

      <p>{t.description}</p>

      {timeLeft > 0 ? (
        <div className="countdown">
          <p>{t.waitPrefix} <strong>{formatTime(timeLeft)}</strong> {t.waitSuffix}</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((retryAfter - timeLeft) / retryAfter) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <button className="retry-button" onClick={handleRetry}>
          {t.retry}
        </button>
      )}

      <div className="help-text">
        <h4>{t.helpTitle}</h4>
        <ul>
          <li>{t.help1}</li>
          <li>{t.help2}</li>
          <li>{t.help3}</li>
        </ul>
      </div>
    </div>
  );
};

export default RateLimitError;
