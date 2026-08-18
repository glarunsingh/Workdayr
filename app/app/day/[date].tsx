import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { TaskList, TaskModal } from '@/components/tasks';
import { useAuth } from '@/lib/auth';
import { Task } from '@/lib/types';
import { createTask, fetchTasksForDate, toggleTaskStatus, setTaskStatus, formatDate } from '@/lib/tasks';
import type { TaskFormValues } from '@/components/tasks/TaskForm';
import { useTaskRealtime } from '@/lib/realtime';
import { useAppTheme } from '@/lib/theme';

// Format date for display
const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
};

// Check if date is today
const isToday = (dateString: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: string }).message;
    if (typeof maybeMessage === 'string') return maybeMessage;
    try {
      return JSON.stringify(error, Object.getOwnPropertyNames(error));
    } catch {
      return 'Unknown error';
    }
  }
  return 'Unknown error';
};

export default function DayViewScreen() {
  const { date, flash } = useLocalSearchParams<{ date: string; flash?: string | string[] }>();
  const router = useRouter();
  const { session } = useAuth();
  const { colors, scheme } = useAppTheme();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    const message = Array.isArray(flash) ? flash[0] : flash;
    if (!message) return;

    setFlashMessage(message);
    const timeoutId = setTimeout(() => setFlashMessage(null), 2500);
    return () => clearTimeout(timeoutId);
  }, [flash]);

  const filteredTasks = tasks;

  const loadTasks = useCallback(async () => {
    if (!session?.user?.id || !date) return;

    setLoading(true);
    try {
      const fetchedTasks = await fetchTasksForDate(session.user.id, date);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [date, session?.user?.id]);

  // Handle real-time task changes
  const handleTaskChange = useCallback(
    (eventType: 'INSERT' | 'UPDATE' | 'DELETE', task: Task) => {
      if (!date) return;

      const today = formatDate(new Date());
      const includeCarryForward = date <= today;

      // Check if task is relevant to the current date
      const taskStartDate = task.due_date;
      const taskEndDate = task.end_date || task.due_date;
      const isRelevantToDate =
        (date >= taskStartDate && date <= taskEndDate) ||
        (includeCarryForward && task.status !== 'completed' && taskEndDate < date);

      switch (eventType) {
        case 'INSERT':
          if (isRelevantToDate) {
            setTasks((prev) => {
              // Avoid duplicates
              if (prev.some((t) => t.id === task.id)) return prev;
              return [...prev, task];
            });
          }
          break;
        case 'UPDATE':
          setTasks((prev) => {
            const exists = prev.some((t) => t.id === task.id);
            if (isRelevantToDate) {
              if (exists) {
                return prev.map((t) => (t.id === task.id ? task : t));
              } else {
                return [...prev, task];
              }
            } else {
              // Task no longer relevant to this date, remove it
              return prev.filter((t) => t.id !== task.id);
            }
          });
          break;
        case 'DELETE':
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
          break;
      }
    },
    [date]
  );

  // Subscribe to real-time task changes
  useTaskRealtime(session?.user?.id, [], handleTaskChange, false);

  // Reload tasks when screen gains focus (e.g., returning from edit/create)
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const handleTaskPress = (task: Task) => {
    router.push(`/task/${task.id}`);
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      const updatedTask = await toggleTaskStatus(task);
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    } catch (error) {
      console.error('Failed to toggle task status:', error);
    }
  };

  const handleToggleProgress = async (task: Task) => {
    if (task.status === 'completed') return;

    try {
      const nextStatus = task.status === 'in_progress' ? 'new' : 'in_progress';
      const updatedTask = await setTaskStatus(task, nextStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleAddTask = () => {
    setCreateModalVisible(true);
  };

  const handleCreateTask = async (values: TaskFormValues) => {
    if (!session?.user?.id) {
      showAlert('Error', 'You must be logged in to create a task');
      return;
    }

    setCreatingTask(true);
    try {
      const taskData = {
        title: values.title,
        description: values.description || null,
        due_date: values.due_date,
        end_date: values.end_date,
        priority: values.priority,
        status: values.status,
        created_by: session.user.id,
        assignee_id: null,
        team_id: null,
        task_type: 'personal',
      };

      const createdTask = await createTask(taskData);

      // Update list if task is relevant to current day
      if (date) {
        const taskStartDate = createdTask.due_date;
        const taskEndDate = createdTask.end_date || createdTask.due_date;
        const today = formatDate(new Date());
        const includeCarryForward = date <= today;

        const isRelevantToDate =
          (date >= taskStartDate && date <= taskEndDate) ||
          (includeCarryForward && createdTask.status !== 'completed' && taskEndDate < date);

        if (isRelevantToDate) {
          setTasks((prev) => {
            if (prev.some((t) => t.id === createdTask.id)) return prev;
            return [...prev, createdTask];
          });
        }
      }

      setFlashMessage(`Task "${values.title}" created`);
      setTimeout(() => setFlashMessage(null), 2500);
      setCreateModalVisible(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      const message = formatErrorMessage(error);
      showAlert('Error', `Failed to create task: ${message}`);
    } finally {
      setCreatingTask(false);
    }
  };

  const displayDate = date ? formatDisplayDate(date) : '';
  const todayLabel = date && isToday(date) ? ' (Today)' : '';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {!!flashMessage && (
        <View
          style={[
            styles.flashBanner,
            {
              backgroundColor: scheme === 'dark' ? colors.surfaceMuted : `${colors.success}14`,
              borderBottomColor: scheme === 'dark' ? colors.border : `${colors.success}35`,
            },
          ]}
        >
          <Text style={[styles.flashText, { color: colors.success }]} numberOfLines={1}>
            {flashMessage}
          </Text>
        </View>
      )}
      
      {/* Date Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.dateText, { color: colors.text }]}>{displayDate}{todayLabel}</Text>
        <View style={styles.summary}>
          <Text style={[styles.summaryText, { color: colors.textMuted }]}>
            {filteredTasks.filter((t) => t.status === 'new').length} new • {' '}
            {filteredTasks.filter((t) => t.status === 'in_progress').length} in progress • {' '}
            {filteredTasks.filter((t) => t.status === 'completed').length} completed
          </Text>
        </View>
      </View>

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        loading={loading}
        emptyMessage={`No tasks for ${date && isToday(date) ? 'today' : 'this day'}`}
        onTaskPress={handleTaskPress}
        onToggleStatus={handleToggleStatus}
        onToggleProgress={handleToggleProgress}
        viewDate={date}
      />

      <TaskModal
        visible={createModalVisible}
        title="Create Task"
        submitLabel="Create"
        isLoading={creatingTask}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateTask}
        initialValues={{
          due_date: date,
          status: 'new',
        }}
      />

      {/* Add Task FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
        onPress={handleAddTask}
        activeOpacity={0.85}
      >
        <FontAwesome name="plus" size={24} color={colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flashBanner: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  flashText: {
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summary: {
    marginTop: 4,
  },
  summaryText: {
    fontSize: 14,
  },
  filterContainer: {
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterChipActive: {
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
