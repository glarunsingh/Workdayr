// Types for the Workdayr app
export type WeekStartDay = 'sunday' | 'monday';
export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskType = 'personal' | 'business';
export type UserMode = 'personal' | 'business';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  mode: UserMode;
  week_starts_on: WeekStartDay;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string; // YYYY-MM-DD
  end_date: string | null; // For multi-day tasks
  status: TaskStatus;
  priority: TaskPriority;
  created_by: string;
  assignee_id: string | null;
  team_id: string | null;
  task_type: TaskType;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface TaskSummary {
  pending: number;
  completed: number;
  overdue: number;
}

export interface DayData {
  date: Date;
  dateString: string; // YYYY-MM-DD
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  taskSummary: TaskSummary;
}

export interface Company {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface TeamMemberWithProfile extends TeamMember {
  profile: Profile | null;
}

export interface InviteCode {
  id: string;
  code: string;
  team_id: string;
  created_by: string | null;
  expires_at: string;
  max_uses: number | null;
  use_count: number;
  is_active: boolean;
  created_at: string;
}

export interface InviteValidation {
  team_id: string | null;
  team_name: string | null;
  company_id: string | null;
  company_name: string | null;
  is_valid: boolean;
  error_message: string | null;
}
