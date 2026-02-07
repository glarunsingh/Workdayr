import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import TaskCard from './TaskCard';
import { Task } from '@/lib/types';
import { TaskListSkeleton } from '@/components/Skeleton';
import { useAppTheme } from '@/lib/theme';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  emptyMessage?: string;
  onTaskPress: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  onToggleProgress?: (task: Task) => void;
  // Optional maps for displaying assignee and team names
  assigneeNames?: Record<string, string>;
  teamNames?: Record<string, string>;
}

export default function TaskList({
  tasks,
  loading,
  emptyMessage = 'No tasks for this day',
  onTaskPress,
  onToggleStatus,
  onToggleProgress,
  assigneeNames = {},
  teamNames = {},
}: TaskListProps) {
  const { colors } = useAppTheme();

  if (loading) {
    return <TaskListSkeleton count={4} />;
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome name="calendar-check-o" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.text }]}>{emptyMessage}</Text>
        <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Tap + to add a new task</Text>
      </View>
    );
  }

  // Separate tasks by status for better organization
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const newTasks = tasks.filter((t) => t.status === 'new');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const sortedTasks = [...inProgressTasks, ...newTasks, ...completedTasks];

  return (
    <FlatList
      data={sortedTasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TaskCard
          task={item}
          onPress={onTaskPress}
          onToggleStatus={onToggleStatus}
          onToggleProgress={onToggleProgress}
          assigneeName={item.assignee_id ? assigneeNames[item.assignee_id] : null}
          teamName={item.team_id ? teamNames[item.team_id] : null}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
});
