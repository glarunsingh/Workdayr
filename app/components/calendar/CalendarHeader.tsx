import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

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
  const month = MONTH_NAMES[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrevMonth} style={styles.navButton}>
        <FontAwesome name="chevron-left" size={16} color="#007AFF" />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onToday} style={styles.titleContainer}>
        <Text style={styles.monthYear}>{month} {year}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onNextMonth} style={styles.navButton}>
        <FontAwesome name="chevron-right" size={16} color="#007AFF" />
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
    paddingVertical: 14,
    backgroundColor: '#fff',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
});
