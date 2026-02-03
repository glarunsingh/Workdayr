import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Task } from '@/lib/types';
import { isTaskOverdue } from '@/lib/tasks';
import { hapticSelection, hapticSuccess } from '@/lib/haptics';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  assigneeName?: string | null;
  teamName?: string | null;
}

const PRIORITY_COLORS = {
  low: '#999',
  medium: '#666',
  high: '#FF3B30',
};

export default function TaskCard({ task, onPress, onToggleStatus, assigneeName, teamName }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const isOverdue = isTaskOverdue(task);

  const handleToggle = () => {
    // Haptic feedback on toggle
    if (isCompleted) {
      hapticSelection();
    } else {
      hapticSuccess();
    }
    onToggleStatus(task);
  };

  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.completedContainer]}
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          isCompleted && styles.checkboxCompleted,
        ]}
        onPress={handleToggle}
      >
        {isCompleted && (
          <FontAwesome name="check" size={12} color="#fff" />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isCompleted && styles.completedTitle]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {isOverdue && !isCompleted && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueText}>Past Due</Text>
            </View>
          )}
        </View>

        {task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[task.priority] }]}>
            <Text style={styles.priorityText}>{task.priority}</Text>
          </View>
          
          {task.end_date && task.end_date !== task.due_date && (
            <View style={styles.multiDayBadge}>
              <FontAwesome name="calendar" size={10} color="#666" />
              <Text style={styles.multiDayText}>Multi-day</Text>
            </View>
          )}

          {teamName && (
            <View style={styles.teamBadge}>
              <FontAwesome name="users" size={10} color="#007AFF" />
              <Text style={styles.teamText}>{teamName}</Text>
            </View>
          )}

          {assigneeName && (
            <View style={styles.assigneeBadge}>
              <FontAwesome name="user" size={10} color="#34C759" />
              <Text style={styles.assigneeText}>{assigneeName}</Text>
            </View>
          )}
        </View>
      </View>

      <FontAwesome name="chevron-right" size={14} color="#ccc" style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  completedContainer: {
    backgroundColor: '#f9f9f9',
    opacity: 0.8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  overdueBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  overdueText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  multiDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  multiDayText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '500',
  },
  teamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#007AFF15',
  },
  teamText: {
    color: '#007AFF',
    fontSize: 10,
    fontWeight: '500',
  },
  assigneeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#34C75915',
  },
  assigneeText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
});
