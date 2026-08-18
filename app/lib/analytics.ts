/**
 * Analytics module for tracking user events and app usage
 * 
 * This is a lightweight analytics abstraction that can be connected
 * to various analytics providers (PostHog, Mixpanel, Amplitude, etc.)
 * 
 * For MVP, we'll use console logging. To integrate a real provider:
 * 1. Install the SDK (e.g., npm install posthog-react-native)
 * 2. Initialize the provider in this file
 * 3. Replace the track/identify calls with provider-specific methods
 */

// Analytics configuration - set to true in production
const ANALYTICS_ENABLED = __DEV__ ? false : true;
const DEBUG_ANALYTICS = __DEV__;

type EventProperties = Record<string, string | number | boolean | null | undefined>;

interface AnalyticsUser {
  id: string;
  email?: string;
  mode?: 'personal' | 'business';
  companyId?: string;
}

class Analytics {
  private userId: string | null = null;
  private userProperties: Record<string, unknown> = {};

  /**
   * Initialize analytics - call once at app startup
   */
  async initialize(): Promise<void> {
    if (!ANALYTICS_ENABLED) {
      if (DEBUG_ANALYTICS) {
        console.log('[Analytics] Disabled in development');
      }
      return;
    }

    // Initialize your analytics provider here
    // Example for PostHog:
    // await PostHog.setup('YOUR_API_KEY', {
    //   host: 'https://app.posthog.com',
    // });

    if (DEBUG_ANALYTICS) {
      console.log('[Analytics] Initialized');
    }
  }

  /**
   * Identify a user - call after sign in
   */
  identify(user: AnalyticsUser): void {
    this.userId = user.id;
    this.userProperties = {
      email: user.email,
      mode: user.mode,
      companyId: user.companyId,
    };

    if (!ANALYTICS_ENABLED) {
      if (DEBUG_ANALYTICS) {
        console.log('[Analytics] Identify:', user.id, this.userProperties);
      }
      return;
    }

    // PostHog example:
    // PostHog.identify(user.id, this.userProperties);
  }

  /**
   * Reset user - call on sign out
   */
  reset(): void {
    this.userId = null;
    this.userProperties = {};

    if (!ANALYTICS_ENABLED) {
      if (DEBUG_ANALYTICS) {
        console.log('[Analytics] Reset');
      }
      return;
    }

    // PostHog example:
    // PostHog.reset();
  }

  /**
   * Track an event
   */
  track(event: string, properties?: EventProperties): void {
    if (!ANALYTICS_ENABLED) {
      if (DEBUG_ANALYTICS) {
        console.log('[Analytics] Track:', event, properties);
      }
      return;
    }

    // PostHog example:
    // PostHog.capture(event, properties);
  }

  /**
   * Track screen view
   */
  screen(screenName: string, properties?: EventProperties): void {
    this.track('screen_view', { screen_name: screenName, ...properties });
  }
}

// Singleton instance
export const analytics = new Analytics();

// Predefined events for consistency
export const AnalyticsEvents = {
  // Auth events
  SIGN_UP: 'sign_up',
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',
  PASSWORD_RESET: 'password_reset',

  // Task events
  TASK_CREATED: 'task_created',
  TASK_COMPLETED: 'task_completed',
  TASK_DELETED: 'task_deleted',
  TASK_EDITED: 'task_edited',
  TASK_ASSIGNED: 'task_assigned',

  // Company events
  COMPANY_CREATED: 'company_created',
  TEAM_MEMBER_INVITED: 'team_member_invited',
  TEAM_MEMBER_JOINED: 'team_member_joined',
  TEAM_MEMBER_REMOVED: 'team_member_removed',

  // Navigation events
  SCREEN_VIEW: 'screen_view',

  // Settings events
  SETTINGS_CHANGED: 'settings_changed',
  MODE_SWITCHED: 'mode_switched',

  // App events
  APP_OPENED: 'app_opened',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
} as const;

// Helper hooks for common tracking patterns
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    screen: analytics.screen.bind(analytics),
    identify: analytics.identify.bind(analytics),
  };
}
