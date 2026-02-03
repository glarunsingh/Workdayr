import { supabase } from './supabase';
import { Task, TaskSummary } from './types';

// Date utilities
export const formatDate = (date: Date): string => {
  // Use local date components to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // YYYY-MM-DD in local timezone
};

export const getMonthDateRange = (year: number, month: number) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
};

// Check if a task is overdue
export const isTaskOverdue = (task: Task): boolean => {
  if (task.status === 'completed') return false;
  const today = formatDate(new Date());
  return task.due_date < today;
};

// Fetch tasks for a date range (typically a month)
// Now includes both personal tasks and team tasks where user is a member
export const fetchTasksForDateRange = async (
  userId: string,
  startDate: string,
  endDate: string,
  teamIds: string[] = []
): Promise<Task[]> => {
  // Build query for personal tasks (created by user, no team)
  let query = supabase
    .from('tasks')
    .select('*')
    .or(`due_date.gte.${startDate},end_date.gte.${startDate}`)
    .or(`due_date.lte.${endDate},end_date.lte.${endDate}`)
    .order('due_date', { ascending: true });

  if (teamIds.length > 0) {
    // Include: personal tasks OR team tasks (assigned to user OR unassigned in user's teams)
    const teamFilter = teamIds.map(id => `team_id.eq.${id}`).join(',');
    query = query.or(`and(created_by.eq.${userId},team_id.is.null),and(team_id.not.is.null,or(${teamFilter}),or(assignee_id.eq.${userId},assignee_id.is.null))`);
  } else {
    // No teams - just personal tasks
    query = query.eq('created_by', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return data || [];
};

// Fetch tasks for a specific date
// Now includes both personal tasks and team tasks where user is a member
export const fetchTasksForDate = async (
  userId: string,
  date: string,
  teamIds: string[] = []
): Promise<Task[]> => {
  let query = supabase
    .from('tasks')
    .select('*')
    .or(`due_date.eq.${date},and(due_date.lte.${date},end_date.gte.${date})`)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (teamIds.length > 0) {
    // Include: personal tasks OR team tasks (assigned to user OR unassigned in user's teams)
    const teamFilter = teamIds.map(id => `team_id.eq.${id}`).join(',');
    query = query.or(`and(created_by.eq.${userId},team_id.is.null),and(team_id.not.is.null,or(${teamFilter}),or(assignee_id.eq.${userId},assignee_id.is.null))`);
  } else {
    // No teams - just personal tasks
    query = query.eq('created_by', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks for date:', error);
    throw error;
  }

  return data || [];
};

// Get task summary (counts) for a specific date
export const getTaskSummaryForDate = (tasks: Task[], date: string): TaskSummary => {
  const today = formatDate(new Date());
  
  const tasksForDate = tasks.filter((task) => {
    // Single day task
    if (!task.end_date) {
      return task.due_date === date;
    }
    // Multi-day task
    return task.due_date <= date && task.end_date >= date;
  });

  const summary: TaskSummary = {
    pending: 0,
    completed: 0,
    overdue: 0,
  };

  tasksForDate.forEach((task) => {
    if (task.status === 'completed') {
      summary.completed++;
    } else if (task.due_date < today) {
      summary.overdue++;
    } else {
      summary.pending++;
    }
  });

  return summary;
};

// Create a new task
export const createTask = async (
  task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'>
): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  return data;
};

// Update a task
export const updateTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<Task> => {
  const updateData: Partial<Task> & { completed_at?: string | null } = { ...updates };
  
  // If marking as completed, set completed_at
  if (updates.status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  } else if (updates.status === 'pending') {
    updateData.completed_at = null;
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return data;
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Toggle task status
export const toggleTaskStatus = async (task: Task): Promise<Task> => {
  const newStatus = task.status === 'completed' ? 'pending' : 'completed';
  return updateTask(task.id, { status: newStatus });
};
