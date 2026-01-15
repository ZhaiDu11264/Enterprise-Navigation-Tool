import React, { useState, useEffect } from 'react';
import './RateLimitError.css';

interface RateLimitErrorProps {
  onRetry?: () => void;
  retryAfter?: number; // seconds
}

const RateLimitError: React.FC<RateLimitErrorProps> = ({ 
  onRetry, 
  retryAfter = 900 // 15 minutes default
}) => {
  const [timeLeft, setTimeLeft] = useState(retryAfter);

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
      
      <h3>请求过于频繁</h3>
      
      <p>
        为了保护服务器，我们暂时限制了您的访问。
        这通常发生在短时间内发送了太多请求时。
      </p>
      
      {timeLeft > 0 ? (
        <div className="countdown">
          <p>请等待 <strong>{formatTime(timeLeft)}</strong> 后重试</p>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${((retryAfter - timeLeft) / retryAfter) * 100}%` 
              }}
            />
          </div>
        </div>
      ) : (
        <button 
          className="retry-button"
          onClick={handleRetry}
        >
          重新尝试
        </button>
      )}
      
      <div className="help-text">
        <h4>如果问题持续存在：</h4>
        <ul>
          <li>刷新页面或清除浏览器缓存</li>
          <li>检查是否有其他程序在自动发送请求</li>
          <li>联系系统管理员获取帮助</li>
        </ul>
      </div>
    </div>
  );
};

export default RateLimitError;