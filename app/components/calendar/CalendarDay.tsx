import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { TaskSummary } from '@/lib/types';
import { hapticLight } from '@/lib/haptics';
import { useAppTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/responsive';

interface CalendarDayProps {
  date: Date;
  dateString: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  taskSummary: TaskSummary;
  onPress: (dateString: string) => void;
}

export default function CalendarDay({
  date,
  dateString,
  isToday,
  isCurrentMonth,
  isSelected,
  taskSummary,
  onPress,
}: CalendarDayProps) {
  const { colors } = useAppTheme();
  const { isMobile } = useResponsive();
  const [isFocused, setIsFocused] = React.useState(false);
  const dayNumber = date.getDate();
  const hasTasks =
    taskSummary.new > 0 ||
    taskSummary.in_progress > 0 ||
    taskSummary.completed > 0 ||
    taskSummary.overdue > 0;

  const handlePress = () => {
    hapticLight();
    onPress(dateString);
  };

  // Build summary items (only non-zero counts)
  const summaryItems: { count: number; label: string; shortLabel: string; color: string }[] = [];
  if (taskSummary.new > 0) {
    summaryItems.push({ count: taskSummary.new, label: 'New', shortLabel: 'N', color: colors.primary });
  }
  if (taskSummary.in_progress > 0) {
    summaryItems.push({ count: taskSummary.in_progress, label: 'In-Progress', shortLabel: 'IP', color: colors.warning });
  }
  if (taskSummary.overdue > 0) {
    summaryItems.push({ count: taskSummary.overdue, label: 'Past Due', shortLabel: 'PD', color: colors.danger });
  }
  if (taskSummary.completed > 0) {
    summaryItems.push({ count: taskSummary.completed, label: 'Completed', shortLabel: 'C', color: colors.textMuted });
  }

  return (
    <Pressable
      onPress={handlePress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      accessibilityRole="button"
      style={({ pressed, hovered }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        !isCurrentMonth && { backgroundColor: colors.surfaceMuted },
        isSelected && !isToday && {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.primary,
          borderWidth: 1,
        },
        (hovered || isFocused) && Platform.OS === 'web' && {
          borderColor: colors.primary,
          borderWidth: 1,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[
        styles.dayNumberContainer,
        { borderRadius: 18 },
        isToday && { backgroundColor: colors.danger },
        isSelected && !isToday && { backgroundColor: colors.border },
      ]}>
        <Text
          style={[
            styles.dayNumber,
            { color: colors.text },
            !isCurrentMonth && { color: colors.textSubtle },
            isToday && [styles.todayText, { color: colors.onDanger }],
            isSelected && !isToday && { fontWeight: '600' },
          ]}
        >
          {dayNumber}
        </Text>
      </View>

      {hasTasks && (
        <View style={[
          isMobile ? styles.taskSummaryMobile : styles.taskSummaryDesktop,
          !isCurrentMonth && { opacity: 0.6 },
        ]}>
          {isMobile ? (
            // Mobile: compact inline "2N | 1IP | 1PD | 1C"
            <Text style={styles.mobileSummaryText} numberOfLines={1}>
              {summaryItems.map((item, i) => (
                <Text key={item.shortLabel}>
                  {i > 0 && (
                    <Text style={{ color: colors.textSubtle }}>{' | '}</Text>
                  )}
                  <Text style={{ color: item.color, fontWeight: '600', fontSize: 9 }}>
                    {item.count}{item.shortLabel}
                  </Text>
                </Text>
              ))}
            </Text>
          ) : (
            // Web / Tablet / Desktop: multi-line
            // "2 New"
            // "1 In-Progress"
            // "1 Past Due"
            // "1 Completed"
            summaryItems.map((item) => (
              <Text
                key={item.label}
                style={[styles.desktopSummaryLine, { color: item.color }]}
                numberOfLines={1}
              >
                {item.count} {item.label}
              </Text>
            ))
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 8,
    paddingRight: 8,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayNumberContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: '400',
  },
  todayText: {
    fontWeight: '600',
  },
  taskSummaryDesktop: {
    marginTop: 4,
    alignItems: 'flex-end',
    gap: 1,
  },
  desktopSummaryLine: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  taskSummaryMobile: {
    marginTop: 4,
    alignItems: 'flex-end',
  },
  mobileSummaryText: {
    fontSize: 9,
  },
});
