/**
 * Error monitoring module using Sentry
 * 
 * This module provides error tracking, crash reporting, and performance monitoring.
 * 
 * Setup instructions:
 * 1. Install Sentry: npx expo install @sentry/react-native
 * 2. Create a Sentry account and project at https://sentry.io
 * 3. Replace SENTRY_DSN with your project's DSN
 * 4. Run: npx sentry-wizard@latest -i reactNative
 */

import { Platform } from 'react-native';

// Configuration - replace with your Sentry DSN
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';
const ERROR_MONITORING_ENABLED = !__DEV__ && !!SENTRY_DSN;
const DEBUG_ERRORS = __DEV__;

// Sentry types (for when SDK is installed)
// import * as Sentry from '@sentry/react-native';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  extra?: Record<string, unknown>;
}

interface BreadcrumbData {
  category: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

class ErrorMonitor {
  private initialized = false;
  private userId: string | null = null;

  /**
   * Initialize error monitoring - call once at app startup
   */
  async initialize(): Promise<void> {
    if (!ERROR_MONITORING_ENABLED) {
      if (DEBUG_ERRORS) {
        console.log('[ErrorMonitor] Disabled (no DSN or development mode)');
      }
      return;
    }

    // Uncomment when @sentry/react-native is installed:
    // Sentry.init({
    //   dsn: SENTRY_DSN,
    //   environment: __DEV__ ? 'development' : 'production',
    //   enableAutoSessionTracking: true,
    //   sessionTrackingIntervalMillis: 30000,
    //   debug: DEBUG_ERRORS,
    //   tracesSampleRate: 1.0,
    //   attachStacktrace: true,
    //   integrations: [
    //     Sentry.browserTracingIntegration(),
    //   ],
    // });

    this.initialized = true;
    if (DEBUG_ERRORS) {
      console.log('[ErrorMonitor] Initialized');
    }
  }

  /**
   * Set user context for error reports
   */
  setUser(userId: string, email?: string): void {
    this.userId = userId;

    if (!this.initialized) {
      if (DEBUG_ERRORS) {
        console.log('[ErrorMonitor] Set user:', userId, email);
      }
      return;
    }

    // Sentry.setUser({ id: userId, email });
  }

  /**
   * Clear user context on sign out
   */
  clearUser(): void {
    this.userId = null;

    if (!this.initialized) {
      if (DEBUG_ERRORS) {
        console.log('[ErrorMonitor] Cleared user');
      }
      return;
    }

    // Sentry.setUser(null);
  }

  /**
   * Capture an exception with optional context
   */
  captureException(error: Error, context?: ErrorContext): void {
    if (!this.initialized) {
      if (DEBUG_ERRORS) {
        console.error('[ErrorMonitor] Exception:', error.message, context);
        console.error(error.stack);
      }
      return;
    }

    // Sentry.withScope((scope) => {
    //   if (context?.component) {
    //     scope.setTag('component', context.component);
    //   }
    //   if (context?.action) {
    //     scope.setTag('action', context.action);
    //   }
    //   if (context?.extra) {
    //     scope.setExtras(context.extra);
    //   }
    //   Sentry.captureException(error);
    // });
  }

  /**
   * Capture a message (for non-error events worth tracking)
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.initialized) {
      if (DEBUG_ERRORS) {
        console.log(`[ErrorMonitor] Message (${level}):`, message);
      }
      return;
    }

    // Sentry.captureMessage(message, level);
  }

  /**
   * Add a breadcrumb for context in error reports
   */
  addBreadcrumb(data: BreadcrumbData): void {
    if (!this.initialized) {
      if (DEBUG_ERRORS) {
        console.log('[ErrorMonitor] Breadcrumb:', data.category, data.message);
      }
      return;
    }

    // Sentry.addBreadcrumb({
    //   category: data.category,
    //   message: data.message,
    //   level: data.level || 'info',
    //   data: data.data,
    // });
  }

  /**
   * Set a tag for all future events
   */
  setTag(key: string, value: string): void {
    if (!this.initialized) {
      if (DEBUG_ERRORS) {
        console.log('[ErrorMonitor] Set tag:', key, value);
      }
      return;
    }

    // Sentry.setTag(key, value);
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, op: string) {
    if (!this.initialized) {
      if (DEBUG_ERRORS) {
        console.log('[ErrorMonitor] Start transaction:', name, op);
      }
      return {
        finish: () => {
          if (DEBUG_ERRORS) {
            console.log('[ErrorMonitor] Finish transaction:', name);
          }
        },
      };
    }

    // return Sentry.startTransaction({ name, op });
    return { finish: () => {} };
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitor();

// Convenience wrapper for async operations with error handling
export async function withErrorMonitoring<T>(
  operation: () => Promise<T>,
  context: ErrorContext
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error) {
      errorMonitor.captureException(error, context);
    }
    return null;
  }
}

// Hook for component-level error handling
export function useErrorMonitor() {
  return {
    captureException: errorMonitor.captureException.bind(errorMonitor),
    captureMessage: errorMonitor.captureMessage.bind(errorMonitor),
    addBreadcrumb: errorMonitor.addBreadcrumb.bind(errorMonitor),
  };
}

// Log app info for debugging
export function logAppInfo(): void {
  const info = {
    platform: Platform.OS,
    version: Platform.Version,
    isTV: Platform.isTV,
  };

  errorMonitor.setTag('platform', Platform.OS);
  errorMonitor.setTag('platform_version', String(Platform.Version));

  if (DEBUG_ERRORS) {
    console.log('[ErrorMonitor] App info:', info);
  }
}
