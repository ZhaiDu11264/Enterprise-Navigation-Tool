import { useCallback } from 'react';
import { useNotifications } from '../components/common/NotificationSystem';
import { ApiError } from '../services/api';

interface ErrorHandlerOptions {
  showNotification?: boolean;
  customMessage?: string;
  logError?: boolean;
}

export function useErrorHandler() {
  const { showError, showWarning } = useNotifications();

  const handleError = useCallback((
    error: unknown, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showNotification = true,
      customMessage,
      logError = true
    } = options;

    let title = 'An error occurred';
    let message = 'Please try again later';

    if (logError) {
      console.error('Error handled:', error);
    }

    // Handle API errors
    if (isApiError(error)) {
      title = getErrorTitle(error.response?.data?.error?.code);
      message = error.response?.data?.error?.message || message;
    }
    // Handle network errors
    else if (isNetworkError(error)) {
      title = 'Connection Error';
      message = 'Please check your internet connection and try again';
    }
    // Handle validation errors
    else if (isValidationError(error)) {
      title = 'Validation Error';
      message = error.message || 'Please check your input and try again';
    }
    // Handle generic errors
    else if (error instanceof Error) {
      title = 'Error';
      message = error.message || message;
    }

    // Use custom message if provided
    if (customMessage) {
      message = customMessage;
    }

    // Show notification if requested
    if (showNotification) {
      if (isWarningError(error)) {
        showWarning(title, message);
      } else {
        showError(title, message);
      }
    }

    return { title, message };
  }, [showError, showWarning]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, options);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
}

// Type guards and utility functions
function isApiError(error: unknown): error is { response: { data: ApiError; status: number } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object' &&
    'data' in (error as any).response
  );
}

function isNetworkError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (('code' in error && (error as any).code === 'NETWORK_ERROR') ||
    ('message' in error && typeof (error as any).message === 'string' && (error as any).message.includes('Network Error')))
  );
}

function isValidationError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    (error.name === 'ValidationError' || error.message.includes('validation'))
  );
}

function isWarningError(error: unknown): boolean {
  if (isApiError(error)) {
    const status = error.response.status;
    return status === 400 || status === 409; // Bad request or conflict
  }
  return false;
}

function getErrorTitle(errorCode?: string): string {
  switch (errorCode) {
    case 'UNAUTHORIZED':
      return 'Authentication Required';
    case 'FORBIDDEN':
      return 'Access Denied';
    case 'NOT_FOUND':
      return 'Not Found';
    case 'VALIDATION_ERROR':
      return 'Invalid Input';
    case 'CONFLICT':
      return 'Conflict';
    case 'RATE_LIMITED':
      return 'Too Many Requests';
    case 'SERVER_ERROR':
      return 'Server Error';
    default:
      return 'Error';
  }
}