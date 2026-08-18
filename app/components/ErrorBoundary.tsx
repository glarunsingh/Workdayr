import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Appearance } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { appColors, useAppTheme } from '@/lib/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child
 * component tree and displays a fallback UI instead of crashing.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const scheme = Appearance.getColorScheme() ?? 'light';
      const colors = appColors[scheme];

      // Default error UI
      return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <FontAwesome name="exclamation-triangle" size={48} color={colors.danger} />
          <Text style={[styles.title, { color: colors.text }]}>Something went wrong</Text>
          <Text style={[styles.message, { color: colors.textMuted }]}>
            We're sorry, but something unexpected happened. Please try again.
          </Text>
          
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.info }]} onPress={this.handleRetry}>
            <FontAwesome name="refresh" size={16} color={colors.onPrimary} />
            <Text style={[styles.retryText, { color: colors.onPrimary }]}>Try Again</Text>
          </TouchableOpacity>

          {__DEV__ && this.state.error && (
            <ScrollView style={[styles.errorDetails, { backgroundColor: colors.surface }]}>
              <Text style={[styles.errorTitle, { color: colors.danger }]}>Error Details (Dev Only):</Text>
              <Text style={[styles.errorText, { color: colors.text }]}>{this.state.error.toString()}</Text>
              {this.state.errorInfo && (
                <Text style={[styles.errorStack, { color: colors.textMuted }]}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * A simpler inline error fallback for non-critical components
 */
interface InlineErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function InlineError({ 
  message = 'Failed to load', 
  onRetry 
}: InlineErrorProps) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.inlineContainer, { backgroundColor: `${colors.warning}20` }]}>
      <FontAwesome name="exclamation-circle" size={20} color={colors.warning} />
      <Text style={[styles.inlineMessage, { color: colors.text }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text style={[styles.inlineRetry, { color: colors.info }]}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Empty state component for when there's no data
 */
interface EmptyStateProps {
  icon?: keyof typeof FontAwesome.glyphMap;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ icon = 'inbox', title, message, action }: EmptyStateProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.emptyContainer}>
      <FontAwesome name={icon} size={48} color={colors.textDisabled} />
      <Text style={[styles.emptyTitle, { color: colors.textMuted }]}>{title}</Text>
      {message && <Text style={[styles.emptyMessage, { color: colors.textSubtle }]}>{message}</Text>}
      {action && (
        <TouchableOpacity style={[styles.emptyAction, { backgroundColor: colors.info }]} onPress={action.onPress}>
          <Text style={[styles.emptyActionText, { color: colors.onPrimary }]}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorDetails: {
    marginTop: 24,
    maxHeight: 200,
    width: '100%',
    borderRadius: 8,
    padding: 12,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  errorStack: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 8,
  },
  // Inline error styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  inlineMessage: {
    flex: 1,
    fontSize: 14,
  },
  inlineRetry: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyAction: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
