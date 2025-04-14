/**
 * Centralized error handling utility for the application
 */

// Check if debug mode is enabled
const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

/**
 * Safe console logger that only logs in development or when debug mode is enabled
 * @param type The type of log message
 * @param message The primary message to log
 * @param data Additional data to include in the log
 */
export function safeConsoleLog(
  type: 'log' | 'warn' | 'error' | 'info', 
  message: string, 
  data?: any
) {
  // Only log in development or when debug mode is enabled
  if (process.env.NODE_ENV === 'development' || isDebugMode) {
    if (data) {
      console[type](message, data);
    } else {
      console[type](message);
    }
  }
}

/**
 * Safely handle an error with optional reporting
 * @param error The error object
 * @param context Optional context description
 * @param shouldReport Whether to report the error to an external service (future use)
 */
export function handleError(error: unknown, context?: string, shouldReport = false) {
  let errorMessage = 'An unknown error occurred';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  const contextPrefix = context ? `[${context}] ` : '';
  safeConsoleLog('error', `${contextPrefix}${errorMessage}`, error);
  
  // Future: Add error reporting service integration
  if (shouldReport) {
    // e.g., sendToErrorReportingService(error, context);
  }
  
  return errorMessage;
}

/**
 * Parse an error response from a fetch request
 * @param response The fetch response object
 */
export async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return data.error || data.message || `Error: ${response.status} ${response.statusText}`;
    } else {
      const text = await response.text();
      return text || `Error: ${response.status} ${response.statusText}`;
    }
  } catch (error) {
    return `Error: ${response.status} ${response.statusText}`;
  }
} 