import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CalendarDay from './CalendarDay';
import { WeekStartDay, Task, TaskSummary } from '@/lib/types';
import { getTaskSummaryForDate, formatDate } from '@/lib/tasks';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: string | null;
  weekStartsOn: WeekStartDay;
  tasks: Task[];
  onSelectDate: (dateString: string) => void;
}

const DAY_LABELS_SUNDAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_LABELS_MONDAY = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// Generate calendar days for a month view - only weeks containing current month days
const generateCalendarDays = (year: number, month: number, weekStartsOn: WeekStartDay): Date[][] => {
  const weeks: Date[][] = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Get the day of week (0 = Sunday, 1 = Monday, etc.)
  let startDayOfWeek = firstDayOfMonth.getDay();
  
  // Adjust for Monday start
  if (weekStartsOn === 'monday') {
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  }
  
  // Build first week (may include days from previous month)
  let currentWeek: Date[] = [];
  
  // Add days from previous month to fill the first week
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    currentWeek.push(new Date(year, month, -i));
  }
  
  // Add all days of the current month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    currentWeek.push(new Date(year, month, day));
    
    // If week is complete (7 days), push and start new week
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // If there's a partial last week with current month days,
  // fill with next month days (they'll be shown greyed out)
  if (currentWeek.length > 0) {
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(year, month + 1, nextMonthDay));
      nextMonthDay++;
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
};

export default function CalendarGrid({
  currentDate,
  selectedDate,
  weekStartsOn,
  tasks,
  onSelectDate,
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = formatDate(new Date());
  const weeks = generateCalendarDays(year, month, weekStartsOn);
  const dayLabels = weekStartsOn === 'sunday' ? DAY_LABELS_SUNDAY : DAY_LABELS_MONDAY;

  return (
    <View style={styles.container}>
      {/* Day labels header */}
      <View style={styles.dayLabelsRow}>
        {dayLabels.map((label, index) => (
          <View key={index} style={styles.dayLabelCell}>
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid - fills remaining space */}
      <View style={styles.gridContainer}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((date, dayIndex) => {
              const dateString = formatDate(date);
              const isToday = dateString === today;
              const isSelected = dateString === selectedDate;
              const taskSummary = getTaskSummaryForDate(tasks, dateString, {
                includeCarryForward: false,
              });
              
              // Check if date is from previous or next month (show greyed out)
              const isNextMonth = date.getMonth() > month || (date.getMonth() === 0 && month === 11);
              const isPrevMonth = date.getMonth() < month || (date.getMonth() === 11 && month === 0);
              const isCurrentMonth = !isPrevMonth && !isNextMonth;

              return (
                <CalendarDay
                  key={dayIndex}
                  date={date}
                  dateString={dateString}
                  isToday={isToday}
                  isCurrentMonth={isCurrentMonth}
                  isSelected={isSelected}
                  taskSummary={taskSummary}
                  onPress={onSelectDate}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dayLabelsRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dayLabelCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  gridContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: '#E5E5EA',
  },
  weekRow: {
    flex: 1,
    flexDirection: 'row',
  },
  emptyCell: {
    flex: 1,
    backgroundColor: '#fff',
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#E5E5EA',
  },
});
