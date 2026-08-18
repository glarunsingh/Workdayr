import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useConnectionStatus } from '@/lib/connection';
import { useEffect, useRef } from 'react';
import { useAppTheme } from '@/lib/theme';

/**
 * A banner that shows when the app is offline
 */
export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useConnectionStatus();
  const { colors } = useAppTheme();
  const slideAnim = useRef(new Animated.Value(-50)).current;

  const isOffline = !isConnected || isInternetReachable === false;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOffline ? 0 : -50,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline, slideAnim]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], backgroundColor: colors.danger },
      ]}
    >
      <FontAwesome name="wifi" size={14} color={colors.onDanger} />
      <Text style={[styles.text, { color: colors.onDanger }]}>You're offline. Some features may be unavailable.</Text>
    </Animated.View>
  );
}

/**
 * Inline connection status indicator
 */
export function ConnectionIndicator() {
  const { isConnected, isInternetReachable } = useConnectionStatus();
  const { colors } = useAppTheme();

  const isOffline = !isConnected || isInternetReachable === false;

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.indicator}>
      <FontAwesome name="wifi" size={12} color={colors.warning} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
  indicator: {
    padding: 4,
  },
});
