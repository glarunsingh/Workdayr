import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { MonthCalendar } from '@/components/calendar';
import { ResponsiveContainer } from '@/components/ResponsiveLayout';
import { useAppTheme } from '@/lib/theme';

export default function CalendarScreen() {
  const { colors, radius } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ResponsiveContainer maxWidth={Platform.OS === 'web' ? 1100 : undefined}>
        <View style={[styles.calendarCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, shadowColor: colors.shadow }]}>
          <MonthCalendar />
        </View>
      </ResponsiveContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  calendarCard: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    overflow: 'hidden',
  },
});
