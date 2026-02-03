import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TaskSummary } from '@/lib/types';
import { hapticLight } from '@/lib/haptics';

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
  const dayNumber = date.getDate();
  const hasTasks = taskSummary.pending > 0 || taskSummary.completed > 0 || taskSummary.overdue > 0;

  const handlePress = () => {
    hapticLight();
    onPress(dateString);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.6}
    >
      <View style={[
        styles.dayNumberContainer,
        isToday && styles.todayContainer,
        isSelected && !isToday && styles.selectedContainer,
      ]}>
        <Text
          style={[
            styles.dayNumber,
            !isCurrentMonth && styles.otherMonthText,
            isToday && styles.todayText,
            isSelected && !isToday && styles.selectedText,
          ]}
        >
          {dayNumber}
        </Text>
      </View>
      
      {hasTasks && isCurrentMonth && (
        <View style={styles.taskIndicators}>
          {taskSummary.overdue > 0 && (
            <View style={[styles.dot, styles.overdueDot]} />
          )}
          {taskSummary.pending > 0 && (
            <View style={[styles.dot, styles.pendingDot]} />
          )}
          {taskSummary.completed > 0 && (
            <View style={[styles.dot, styles.completedDot]} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 8,
    paddingRight: 8,
    backgroundColor: '#fff',
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#E5E5EA',
  },
  dayNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayContainer: {
    backgroundColor: '#FF3B30',
  },
  selectedContainer: {
    backgroundColor: '#E5E5EA',
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000',
  },
  otherMonthText: {
    color: '#C7C7CC',
  },
  todayText: {
    color: '#fff',
    fontWeight: '600',
  },
  selectedText: {
    fontWeight: '500',
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
  pendingDot: {
    backgroundColor: '#007AFF',
  },
  completedDot: {
    backgroundColor: '#666',
  },
  overdueDot: {
    backgroundColor: '#FF3B30',
  },
});
