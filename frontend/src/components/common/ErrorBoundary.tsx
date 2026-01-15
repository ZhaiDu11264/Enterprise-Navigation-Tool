import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryLabels {
  title: string;
  message: string;
  details: string;
  refresh: string;
}

interface ErrorBoundaryBaseProps extends Props {
  labels: ErrorBoundaryLabels;
}

class ErrorBoundaryBase extends Component<ErrorBoundaryBaseProps, State> {
  constructor(props: ErrorBoundaryBaseProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>{this.props.labels.title}</h2>
            <p>{this.props.labels.message}</p>
            <details className="error-details">
              <summary>{this.props.labels.details}</summary>
              <pre>{this.state.error?.toString()}</pre>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              {this.props.labels.refresh}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children, fallback }: Props) {
  const { language } = useLanguage();
  const translations = {
    en: {
      title: 'Something went wrong',
      message: "We're sorry, but something unexpected happened. Please try refreshing the page.",
      details: 'Error Details',
      refresh: 'Refresh Page'
    },
    zh: {
      title: '\\u51fa\\u9519\\u4e86',
      message: '\\u62b1\\u6b49\\uff0c\\u51fa\\u73b0\\u4e86\\u610f\\u5916\\u9519\\u8bef\\uff0c\\u8bf7\\u5237\\u65b0\\u9875\\u9762\\u3002',
      details: '\\u9519\\u8bef\\u8be6\\u60c5',
      refresh: '\\u5237\\u65b0\\u9875\\u9762'
    }
  } as const;
  const labels = translations[language];

  return (
    <ErrorBoundaryBase labels={labels} fallback={fallback}>
      {children}
    </ErrorBoundaryBase>
  );
}
