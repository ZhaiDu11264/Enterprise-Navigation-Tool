import { Request } from 'express';

/**
 * Get request ID from headers, with fallback to 'unknown'
 */
export const getRequestId = (req: Request): string => {
  return (req.headers['x-request-id'] as string) || 'unknown';
};

/**
 * Create standard error response object
 */
export const createErrorResponse = (
  code: string,
  message: string,
  req: Request,
  details?: any
) => ({
  error: {
    code,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
    requestId: getRequestId(req)
  }
});

/**
 * Create standard success response object
 */
export const createSuccessResponse = (
  data?: any,
  message?: string
) => ({
  success: true,
  ...(data && { data }),
  ...(message && { message }),
  timestamp: new Date().toISOString()
});