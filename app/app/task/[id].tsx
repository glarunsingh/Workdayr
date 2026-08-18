import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { updateTask, deleteTask } from '@/lib/tasks';
import { supabase } from '@/lib/supabase';
import { Task } from '@/lib/types';
import TaskForm, { TaskFormValues } from '@/components/tasks/TaskForm';
import { useAppTheme, AppColors } from '@/lib/theme';

export default function EditTaskScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id || !session?.user?.id) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        
        if (!data) {
          setError('Task not found');
          return;
        }

        // Verify ownership
        if (data.created_by !== session.user.id) {
          setError('You do not have permission to edit this task');
          return;
        }

        setTask(data);
      } catch (err) {
        console.error('Failed to fetch task:', err);
        setError('Failed to load task');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [id, session?.user?.id]);

  const handleSubmit = async (values: TaskFormValues) => {
    if (!id) return;

    setIsSaving(true);
    try {
      await updateTask(id, {
        title: values.title,
        description: values.description || null,
        due_date: values.due_date,
        end_date: values.end_date,
        status: values.status,
        priority: values.priority,
        task_type: 'personal',
        team_id: null,
        assignee_id: null,
      });

      // Navigate back with success
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteTask(id);
      
      // Navigate back after deletion
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.info} />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Task not found'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TaskForm
        initialValues={{
          title: task.title,
          description: task.description || '',
          due_date: task.due_date,
          end_date: task.end_date,
          status: task.status,
          priority: task.priority,
        }}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitLabel="Save Changes"
        isLoading={isSaving}
      />
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
