import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useAppTheme } from '@/lib/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * A shimmering skeleton placeholder for loading states
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  const { colors } = useAppTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          backgroundColor: colors.surfaceMuted,
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * A skeleton for task cards
 */
export function TaskCardSkeleton() {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.taskCard, { backgroundColor: colors.surface }]}>
      <View style={styles.taskCardCheckbox}>
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
      <View style={styles.taskCardContent}>
        <Skeleton width="80%" height={18} style={styles.taskCardTitle} />
        <Skeleton width="60%" height={14} style={styles.taskCardDesc} />
        <View style={styles.taskCardMeta}>
          <Skeleton width={60} height={16} borderRadius={8} />
          <Skeleton width={80} height={16} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

/**
 * A skeleton for the task list
 */
export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.taskList}>
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </View>
  );
}

/**
 * A skeleton for calendar day cells
 */
export function CalendarDaySkeleton() {
  return (
    <View style={styles.calendarDay}>
      <Skeleton width={28} height={28} borderRadius={14} />
    </View>
  );
}

/**
 * A skeleton for the calendar grid
 */
export function CalendarGridSkeleton() {
  return (
    <View style={styles.calendarGrid}>
      {/* Day labels */}
      <View style={styles.calendarRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} width={30} height={14} style={styles.dayLabel} />
        ))}
      </View>
      {/* Calendar weeks */}
      {Array.from({ length: 5 }).map((_, weekIndex) => (
        <View key={weekIndex} style={styles.calendarRow}>
          {Array.from({ length: 7 }).map((_, dayIndex) => (
            <CalendarDaySkeleton key={dayIndex} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {},
  taskCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
  },
  taskCardCheckbox: {
    marginRight: 12,
  },
  taskCardContent: {
    flex: 1,
  },
  taskCardTitle: {
    marginBottom: 8,
  },
  taskCardDesc: {
    marginBottom: 12,
  },
  taskCardMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  taskList: {
    paddingVertical: 8,
  },
  calendarDay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  calendarGrid: {
    padding: 8,
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayLabel: {
    flex: 1,
    marginHorizontal: 4,
  },
});
