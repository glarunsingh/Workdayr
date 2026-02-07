import { supabase } from './supabase';
import { Task, TaskStatus, TaskSummary } from './types';

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

const buildScopeAndDateOrFilter = (
  userId: string,
  teamIds: string[],
  includeAllTeamTasks: boolean,
  dateLogic: string
): string => {
  const personal = `and(created_by.eq.${userId},team_id.is.null,${dateLogic})`;

  if (teamIds.length === 0) {
    return personal;
  }

  const teamIdsList = `(${teamIds.join(',')})`;
  const team = includeAllTeamTasks
    ? `and(team_id.in.${teamIdsList},${dateLogic})`
    : `and(team_id.in.${teamIdsList},or(assignee_id.eq.${userId},assignee_id.is.null,created_by.eq.${userId}),${dateLogic})`;

  return `${personal},${team}`;
};

// Fetch tasks for a date range (typically a month)
// Now includes both personal tasks and team tasks where user is a member
export const fetchTasksForDateRange = async (
  userId: string,
  startDate: string,
  endDate: string,
  teamIds: string[] = [],
  includeAllTeamTasks: boolean = false
): Promise<Task[]> => {
  const today = formatDate(new Date());
  const includeCarryForward = startDate <= today;

  // Tasks relevant to a range:
  // - Tasks that overlap the range (single-day or multi-day)
  // - PLUS overdue incomplete tasks that started/ended before the range (carry-forward, ONLY up to today)
  //
  // Overlap logic (without COALESCE):
  //   (end_date is null AND due_date within range)
  //   OR (end_date >= startDate AND due_date <= endDate)
  // Carry-forward overdue:
  //   status!=completed AND (end_date is null AND due_date < startDate)
  //   OR status!=completed AND end_date < startDate
  const overlapParts = [
    `and(end_date.is.null,due_date.gte.${startDate})`,
    `and(end_date.gte.${startDate})`,
  ];

  const carryForwardParts = includeCarryForward
    ? [
        `and(status.neq.completed,end_date.is.null,due_date.lt.${startDate})`,
        `and(status.neq.completed,end_date.lt.${startDate})`,
      ]
    : [];

  const dateLogic = [
    `due_date.lte.${endDate},or(`,
    [...overlapParts, ...carryForwardParts].join(','),
    `)`,
  ].join('');

  let query = supabase
    .from('tasks')
    .select('*')
    .or(buildScopeAndDateOrFilter(userId, teamIds, includeAllTeamTasks, dateLogic))
    .order('due_date', { ascending: true });

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
  teamIds: string[] = [],
  includeAllTeamTasks: boolean = false
): Promise<Task[]> => {
  const today = formatDate(new Date());
  const includeCarryForward = date <= today;

  // Tasks relevant to a date:
  // - due_date == date (single-day)
  // - due_date <= date <= end_date (multi-day)
  // - overdue carry-forward (ONLY up to today): incomplete tasks with due/end before date
  const dateLogicParts = [
    `due_date.eq.${date}`,
    `and(due_date.lte.${date},end_date.gte.${date})`,
  ];

  if (includeCarryForward) {
    // Match the same logic as getTaskSummaryForDate - include all non-completed tasks
    dateLogicParts.push(
      `and(status.neq.completed,end_date.is.null,due_date.lt.${date})`,
      `and(status.neq.completed,end_date.lt.${date})`
    );
  }

  const dateLogic = `or(${dateLogicParts.join(',')})`;

  let query = supabase
    .from('tasks')
    .select('*')
    .or(buildScopeAndDateOrFilter(userId, teamIds, includeAllTeamTasks, dateLogic))
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks for date:', error);
    throw error;
  }

  return data || [];
};

// Get task summary (counts) for a specific date
export const getTaskSummaryForDate = (
  tasks: Task[],
  date: string,
  options: { includeCarryForward?: boolean } = {}
): TaskSummary => {
  const today = formatDate(new Date());
  const { includeCarryForward = true } = options;
  
  const tasksForDate = tasks.filter((task) => {
    const effectiveEnd = task.end_date || task.due_date;

    // Carry-forward overdue tasks onto future dates
    // Only roll over up to today (avoid pre-populating into future calendar dates)
    if (
      includeCarryForward &&
      task.status !== 'completed' &&
      effectiveEnd < date &&
      date <= today
    ) {
      return true;
    }

    // Single-day task
    if (!task.end_date) {
      return task.due_date === date;
    }

    // Multi-day task
    return task.due_date <= date && task.end_date >= date;
  });

  const summary: TaskSummary = {
    new: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
  };

  tasksForDate.forEach((task) => {
    if (task.status === 'completed') {
      summary.completed++;
    } else if (task.due_date < today) {
      summary.overdue++;
    } else if (task.status === 'in_progress') {
      summary.in_progress++;
    } else {
      summary.new++;
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
  } else if (updates.status === 'new' || updates.status === 'in_progress') {
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
  const newStatus: TaskStatus = task.status === 'completed' ? 'new' : 'completed';
  return updateTask(task.id, { status: newStatus });
};

export const setTaskStatus = async (task: Task, status: TaskStatus): Promise<Task> => {
  return updateTask(task.id, { status });
};
