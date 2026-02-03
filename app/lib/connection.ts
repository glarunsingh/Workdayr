import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { supabase } from './supabase';

interface ConnectionStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  isSupabaseConnected: boolean;
}

/**
 * Hook to monitor network connection status
 */
export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: true,
    isInternetReachable: true,
    connectionType: null,
    isSupabaseConnected: true,
  });

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus((prev) => ({
        ...prev,
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      }));
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setStatus((prev) => ({
        ...prev,
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Monitor Supabase realtime connection
  useEffect(() => {
    const checkSupabaseConnection = () => {
      const channels = supabase.getChannels();
      const isConnected = channels.some(
        (channel) => channel.state === 'joined'
      );
      setStatus((prev) => ({
        ...prev,
        isSupabaseConnected: isConnected || prev.isConnected,
      }));
    };

    // Check periodically
    const interval = setInterval(checkSupabaseConnection, 5000);
    checkSupabaseConnection();

    return () => clearInterval(interval);
  }, []);

  return status;
}

/**
 * Simple retry logic for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
