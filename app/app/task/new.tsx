import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useCompany } from '@/lib/company';
import { createTask } from '@/lib/tasks';
import TaskForm, { TaskFormValues } from '@/components/tasks/TaskForm';

// Cross-platform alert helper
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function NewTaskScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { company, teams, teamMembersWithProfiles } = useCompany();
  
  const [isLoading, setIsLoading] = useState(false);

  // Check if we're in business mode (user has a company)
  const isBusinessMode = !!company;

  // Pre-fill due date if passed from day view
  const initialValues = date ? { due_date: date, status: 'new' as const } : { status: 'new' as const };

  const handleSubmit = async (values: TaskFormValues) => {
    console.log('handleSubmit called with values:', values);
    
    if (!session?.user?.id) {
      console.error('No session user id');
      showAlert('Error', 'You must be logged in to create a task');
      return;
    }

    setIsLoading(true);
    try {
      const taskData = {
        title: values.title,
        description: values.description || null,
        due_date: values.due_date,
        end_date: values.end_date,
        priority: values.priority,
        status: values.status,
        created_by: session.user.id,
        assignee_id: values.assignee_id,
        team_id: values.team_id,
        task_type: values.task_type,
      };
      
      console.log('Creating task with data:', taskData);
      
      const createdTask = await createTask(taskData);

      console.log('Task created successfully:', createdTask);

      // Navigate back - go to the day view for the due date with an in-app flash message
      const flash = encodeURIComponent(`Task "${values.title}" created`);
      router.replace(`/day/${values.due_date}?flash=${flash}`);
    } catch (error: any) {
      console.error('Failed to create task:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      showAlert('Error', `Failed to create task: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'New Task',
          headerBackTitle: 'Cancel',
        }}
      />
      <TaskForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Create Task"
        isLoading={isLoading}
        isBusinessMode={isBusinessMode}
        teams={teams}
        assignableMembers={teamMembersWithProfiles}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
