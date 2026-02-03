import React from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { MonthCalendar } from '@/components/calendar';
import { ResponsiveContainer } from '@/components/ResponsiveLayout';

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ResponsiveContainer maxWidth={Platform.OS === 'web' ? 800 : undefined}>
        <MonthCalendar />
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
