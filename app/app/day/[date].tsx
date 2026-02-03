import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { TaskList } from '@/components/tasks';
import { useAuth } from '@/lib/auth';
import { useCompany } from '@/lib/company';
import { Task } from '@/lib/types';
import { fetchTasksForDate, toggleTaskStatus, formatDate } from '@/lib/tasks';
import { useTaskRealtime } from '@/lib/realtime';

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

export default function DayViewScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const { teams, teamMembersWithProfiles } = useCompany();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Build name lookup maps for display
  const teamNames = useMemo(() => {
    const map: Record<string, string> = {};
    teams.forEach((team) => {
      map[team.id] = team.name;
    });
    return map;
  }, [teams]);

  const assigneeNames = useMemo(() => {
    const map: Record<string, string> = {};
    teamMembersWithProfiles.forEach((member) => {
      if (member.profile && !map[member.user_id]) {
        map[member.user_id] = member.profile.full_name || member.profile.email || 'Team Member';
      }
    });
    return map;
  }, [teamMembersWithProfiles]);

  // Get team IDs for fetching team tasks
  const teamIds = useMemo(() => teams.map((t) => t.id), [teams]);

  // Filter state: 'all' | 'mine' | specific user_id
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Build filter options from unique assignees in tasks
  const filterOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [
      { value: 'all', label: 'All Tasks' },
      { value: 'mine', label: 'My Tasks' },
    ];
    
    // Add unique assignees from team members
    const addedUserIds = new Set<string>();
    teamMembersWithProfiles.forEach((member) => {
      if (!addedUserIds.has(member.user_id) && member.user_id !== session?.user?.id) {
        addedUserIds.add(member.user_id);
        const name = member.profile?.full_name || member.profile?.email || 'Team Member';
        options.push({ value: member.user_id, label: name });
      }
    });
    
    return options;
  }, [teamMembersWithProfiles, session?.user?.id]);

  // Filter tasks based on selected filter
  const filteredTasks = useMemo(() => {
    if (assigneeFilter === 'all') {
      return tasks;
    }
    if (assigneeFilter === 'mine') {
      return tasks.filter(
        (t) => t.created_by === session?.user?.id || t.assignee_id === session?.user?.id
      );
    }
    // Filter by specific assignee
    return tasks.filter((t) => t.assignee_id === assigneeFilter);
  }, [tasks, assigneeFilter, session?.user?.id]);

  const loadTasks = useCallback(async () => {
    if (!session?.user?.id || !date) return;

    setLoading(true);
    try {
      const fetchedTasks = await fetchTasksForDate(session.user.id, date, teamIds);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [date, session?.user?.id, teamIds]);

  // Handle real-time task changes
  const handleTaskChange = useCallback(
    (eventType: 'INSERT' | 'UPDATE' | 'DELETE', task: Task) => {
      if (!date) return;

      // Check if task is relevant to the current date
      const taskStartDate = task.due_date;
      const taskEndDate = task.end_date || task.due_date;
      const isRelevantToDate = date >= taskStartDate && date <= taskEndDate;

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
  useTaskRealtime(session?.user?.id, teamIds, handleTaskChange);

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

  const handleAddTask = () => {
    router.push(`/task/new?date=${date}`);
  };

  const displayDate = date ? formatDisplayDate(date) : '';
  const todayLabel = date && isToday(date) ? ' (Today)' : '';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Day View',
          headerBackTitle: 'Calendar',
        }}
      />
      
      {/* Date Header */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{displayDate}{todayLabel}</Text>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {filteredTasks.filter((t) => t.status === 'pending').length} pending • {' '}
            {filteredTasks.filter((t) => t.status === 'completed').length} completed
          </Text>
        </View>
      </View>

      {/* Filter Bar (only show when there are team tasks) */}
      {teams.length > 0 && (
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterChip,
                  assigneeFilter === option.value && styles.filterChipActive,
                ]}
                onPress={() => setAssigneeFilter(option.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    assigneeFilter === option.value && styles.filterChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        loading={loading}
        emptyMessage={`No tasks for ${date && isToday(date) ? 'today' : 'this day'}`}
        onTaskPress={handleTaskPress}
        onToggleStatus={handleToggleStatus}
        assigneeNames={assigneeNames}
        teamNames={teamNames}
      />

      {/* Add Task FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddTask}>
        <FontAwesome name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summary: {
    marginTop: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
