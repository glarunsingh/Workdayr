import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAppTheme } from '@/lib/theme';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const month = MONTH_NAMES[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={onPrevMonth} style={styles.navButton}>
        <FontAwesome name="chevron-left" size={16} color={colors.primary} />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onToday} style={styles.titleContainer}>
        <Text style={[styles.monthYear, { color: colors.text, fontSize: typography.title }]}>
          {month} {year}
        </Text>
        <Text style={[styles.todayHint, { color: colors.textSubtle }]}>Tap to jump to today</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onNextMonth} style={styles.navButton}>
        <FontAwesome name="chevron-right" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthYear: {
    fontWeight: '600',
  },
  todayHint: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
});
