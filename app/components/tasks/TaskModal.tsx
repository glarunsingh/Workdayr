import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import TaskForm, { TaskFormValues } from './TaskForm';
import { Team, TeamMemberWithProfile, Task } from '@/lib/types';
import { useAppTheme } from '@/lib/theme';

interface TaskModalProps {
  visible: boolean;
  title: string;
  initialValues?: Partial<Task>;
  submitLabel: string;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  isBusinessMode?: boolean;
  teams?: Team[];
  assignableMembers?: TeamMemberWithProfile[];
}

export default function TaskModal({
  visible,
  title,
  initialValues,
  submitLabel,
  isLoading = false,
  onClose,
  onSubmit,
  isBusinessMode = false,
  teams = [],
  assignableMembers = [],
}: TaskModalProps) {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === 'web' ? 'fade' : 'slide'}
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border, padding: spacing.lg }]}
          >
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed, hovered }) => [
                styles.closeButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceMuted,
                  opacity: pressed ? 0.85 : 1,
                },
                hovered && Platform.OS === 'web' && { borderColor: colors.primary },
              ]}
            >
              <FontAwesome name="close" size={16} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.body}>
            <TaskForm
              initialValues={initialValues}
              onSubmit={onSubmit}
              submitLabel={submitLabel}
              isLoading={isLoading}
              isBusinessMode={isBusinessMode}
              teams={teams}
              assignableMembers={assignableMembers}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '92%',
    alignSelf: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
});
