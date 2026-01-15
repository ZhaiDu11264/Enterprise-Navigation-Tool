import React from 'react';
import './ProgressIndicator.css';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export function ProgressBar({ 
  progress, 
  label, 
  showPercentage = true,
  color = 'primary',
  size = 'medium'
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`progress-container progress-${size}`}>
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          {showPercentage && <span>{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div className="progress-bar">
        <div 
          className={`progress-fill progress-${color}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

interface StepProgressProps {
  steps: Array<{
    label: string;
    completed: boolean;
    active?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
}

export function StepProgress({ steps, orientation = 'horizontal' }: StepProgressProps) {
  return (
    <div className={`step-progress step-progress-${orientation}`}>
      {steps.map((step, index) => (
        <div key={index} className="step-progress-item">
          <div className={`step-indicator ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
            {step.completed ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          <div className="step-label">{step.label}</div>
          {index < steps.length - 1 && (
            <div className={`step-connector ${step.completed ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
}

export function CircularProgress({
  progress,
  size = 60,
  strokeWidth = 4,
  color = '#007bff',
  backgroundColor = '#e9ecef',
  showPercentage = true
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="circular-progress-svg">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="circular-progress-circle"
        />
      </svg>
      {showPercentage && (
        <div className="circular-progress-text">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
}