import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Task } from '@/lib/types';
import { isTaskOverdue } from '@/lib/tasks';
import { hapticSelection, hapticSuccess } from '@/lib/haptics';
import { useAppTheme } from '@/lib/theme';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  onToggleProgress?: (task: Task) => void;
  assigneeName?: string | null;
  teamName?: string | null;
}

const PRIORITY_COLORS = {
  low: '#8E8E93',
  medium: '#6B7280',
  high: '#FF3B30',
};

export default function TaskCard({ task, onPress, onToggleStatus, assigneeName, teamName }: TaskCardProps) {
  const { colors } = useAppTheme();
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';
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

  const handleToggleProgress = () => {
    if (isCompleted) return;
    onToggleProgress?.(task);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
        isCompleted && { backgroundColor: colors.surfaceMuted },
        isCompleted && styles.completedContainer,
      ]}
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: colors.primary },
          isCompleted && { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
        onPress={handleToggle}
      >
        {isCompleted && (
          <FontAwesome name="check" size={12} color={colors.onPrimary} />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: colors.text }, isCompleted && styles.completedTitle, isCompleted && { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {isOverdue && !isCompleted && (
            <View style={[styles.overdueBadge, { backgroundColor: colors.danger }]}>
              <Text style={[styles.overdueText, { color: colors.onDanger }]}>Past Due</Text>
            </View>
          )}
        </View>

        {task.description && (
          <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[task.priority] }]}>
            <Text style={[styles.priorityText, { color: colors.onPrimary }]}>{task.priority}</Text>
          </View>

          {!isCompleted && (
            <TouchableOpacity
              style={[
                styles.statusBadge,
                { backgroundColor: isInProgress ? `${colors.warning}20` : `${colors.primary}18` },
              ]}
              onPress={handleToggleProgress}
              activeOpacity={0.85}
            >
              <FontAwesome
                name={isInProgress ? 'pause' : 'play'}
                size={10}
                color={isInProgress ? colors.warning : colors.primary}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isInProgress ? colors.warning : colors.primary },
                ]}
              >
                {isInProgress ? 'In progress' : 'New'}
              </Text>
            </TouchableOpacity>
          )}
          
          {task.end_date && task.end_date !== task.due_date && (
            <View style={[styles.multiDayBadge, { backgroundColor: colors.surfaceMuted }] }>
              <FontAwesome name="calendar" size={10} color={colors.textMuted} />
              <Text style={[styles.multiDayText, { color: colors.textMuted }]}>Multi-day</Text>
            </View>
          )}

          {teamName && (
            <View style={[styles.teamBadge, { backgroundColor: `${colors.primary}18` }]}>
              <FontAwesome name="users" size={10} color={colors.primary} />
              <Text style={[styles.teamText, { color: colors.primary }]}>{teamName}</Text>
            </View>
          )}

          {assigneeName && (
            <View style={[styles.assigneeBadge, { backgroundColor: `${colors.success}18` }]}>
              <FontAwesome name="user" size={10} color={colors.success} />
              <Text style={[styles.assigneeText, { color: colors.success }]}>{assigneeName}</Text>
            </View>
          )}
        </View>
      </View>

      <FontAwesome name="chevron-right" size={14} color={colors.textMuted} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
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
    opacity: 0.8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  overdueBadge: {
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
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
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
  },
  multiDayText: {
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
  },
  teamText: {
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
  },
  assigneeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
});
