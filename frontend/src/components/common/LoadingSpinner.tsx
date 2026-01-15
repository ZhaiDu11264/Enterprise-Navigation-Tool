import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  overlay?: boolean;
}

export function LoadingSpinner({ 
  size = 'medium', 
  color = 'primary', 
  text,
  overlay = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={`loading-spinner loading-spinner-${size} loading-spinner-${color}`}>
      <div className="spinner-circle"></div>
      {text && <div className="spinner-text">{text}</div>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {spinner}
      </div>
    );
  }

  return spinner;
}

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function LoadingButton({ 
  loading, 
  children, 
  className = '', 
  disabled,
  onClick,
  type = 'button'
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      className={`loading-button ${className} ${loading ? 'loading' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <LoadingSpinner size="small" color="white" />}
      <span className={loading ? 'loading-button-text' : ''}>{children}</span>
    </button>
  );
}