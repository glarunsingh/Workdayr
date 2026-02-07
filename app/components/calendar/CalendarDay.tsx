import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { TaskSummary } from '@/lib/types';
import { hapticLight } from '@/lib/haptics';
import { useAppTheme } from '@/lib/theme';

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
            isToday && styles.todayText,
            isSelected && !isToday && { fontWeight: '600' },
          ]}
        >
          {dayNumber}
        </Text>
      </View>
      
      {hasTasks && (
        <View style={[styles.taskIndicators, !isCurrentMonth && { opacity: 0.6 }]}>
          {taskSummary.overdue > 0 && (
            <View style={[styles.dot, { backgroundColor: colors.danger }]} />
          )}
          {taskSummary.in_progress > 0 && (
            <View style={[styles.dot, { backgroundColor: colors.warning }]} />
          )}
          {taskSummary.new > 0 && (
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          )}
          {taskSummary.completed > 0 && (
            <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
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
    color: '#fff',
    fontWeight: '600',
  },
  taskIndicators: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
