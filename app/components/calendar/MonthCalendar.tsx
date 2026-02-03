import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import { useSettings } from '@/lib/settings';
import { useAuth } from '@/lib/auth';
import { useCompany } from '@/lib/company';
import { Task } from '@/lib/types';
import { fetchTasksForDateRange, getMonthDateRange, formatDate } from '@/lib/tasks';
import { useTaskRealtime } from '@/lib/realtime';

// Get today's date fresh each time the component initializes
const getToday = () => new Date();

export default function MonthCalendar() {
  const router = useRouter();
  const { session } = useAuth();
  const { weekStartsOn } = useSettings();
  const { teams } = useCompany();
  
  // Use a function initializer to ensure we get the current date at mount time
  const [currentDate, setCurrentDate] = useState(() => getToday());
  const [selectedDate, setSelectedDate] = useState<string | null>(() => formatDate(getToday()));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Get team IDs for fetching team tasks
  const teamIds = useMemo(() => teams.map((t) => t.id), [teams]);

  // Reset to today's date when user session changes (e.g., on login)
  useEffect(() => {
    if (session?.user?.id) {
      const today = getToday();
      setCurrentDate(today);
      setSelectedDate(formatDate(today));
    }
  }, [session?.user?.id]);

  const loadTasks = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const { start, end } = getMonthDateRange(year, month);
      
      // Extend range to include visible days from adjacent months
      const extendedStart = new Date(year, month, -6); // Up to 6 days from prev month
      const extendedEnd = new Date(year, month + 1, 13); // Up to 13 days from next month
      
      const fetchedTasks = await fetchTasksForDateRange(
        session.user.id,
        formatDate(extendedStart),
        formatDate(extendedEnd),
        teamIds
      );
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, session?.user?.id, teamIds]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Handle real-time task changes for calendar
  const handleTaskChange = useCallback(
    (eventType: 'INSERT' | 'UPDATE' | 'DELETE', task: Task) => {
      switch (eventType) {
        case 'INSERT':
          setTasks((prev) => {
            if (prev.some((t) => t.id === task.id)) return prev;
            return [...prev, task];
          });
          break;
        case 'UPDATE':
          setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? task : t))
          );
          break;
        case 'DELETE':
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
          break;
      }
    },
    []
  );

  // Subscribe to real-time task changes
  useTaskRealtime(session?.user?.id, teamIds, handleTaskChange);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(formatDate(today));
  };

  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    // Navigate to day view
    router.push(`/day/${dateString}`);
  };

  return (
    <View style={styles.container}>
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <CalendarGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          weekStartsOn={weekStartsOn}
          tasks={tasks}
          onSelectDate={handleSelectDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
