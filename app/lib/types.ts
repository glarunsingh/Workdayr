// Types for the Workdayr app
export type WeekStartDay = 'sunday' | 'monday';
export type TaskStatus = 'new' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskType = 'personal' | 'business';
export type UserMode = 'personal' | 'business';
export type ThemePreference = 'system' | 'light' | 'dark';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RecurrenceEndType = 'never' | 'on_date' | 'after_count';

// ─── Notification Preferences ────────────────────────────
export interface NotificationPreferences {
  daily_summary: boolean;
  due_date_reminder: boolean;
  overdue_alert: boolean;
}

// ─── Profile ─────────────────────────────────────────────
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  mode: UserMode;
  week_starts_on: WeekStartDay;
  timezone: string;
  notification_preferences: NotificationPreferences;
  theme_preference: ThemePreference;
  daily_goal: number | null;
  created_at: string;
  updated_at: string;
}

// ─── Task Categories (Life Areas) ────────────────────────
export interface TaskCategory {
  id: string;
  user_id: string | null; // null = system default
  name: string;
  icon: string;           // emoji
  color: string;          // hex color
  is_system: boolean;
  sort_order: number;
  created_at: string;
}

// ─── Task Tags (User-Defined Labels) ─────────────────────
export interface TaskTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

// ─── Task Subtasks (Checklists) ──────────────────────────
export interface TaskSubtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Task Recurrence Rules ───────────────────────────────
export interface RecurrenceRule {
  id: string;
  user_id: string;
  frequency: RecurrenceFrequency;
  interval: number;          // e.g., every 2 weeks
  days_of_week: number[] | null;  // 0=Sun..6=Sat (for weekly)
  day_of_month: number | null;    // 1-31 (for monthly)
  month_of_year: number | null;   // 1-12 (for yearly)
  end_type: RecurrenceEndType;
  end_date: string | null;   // YYYY-MM-DD
  max_occurrences: number | null;
  occurrences_created: number;
  created_at: string;
}

// ─── Task ────────────────────────────────────────────────
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
  category_id: string | null;
  recurrence_rule_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  // Joined relations (optional, populated when fetched with joins)
  category?: TaskCategory;
  tags?: TaskTag[];
  subtasks?: TaskSubtask[];
  recurrence_rule?: RecurrenceRule;
}

// ─── Task Summary (Calendar Day Indicators) ──────────────
export interface TaskSummary {
  new: number;
  in_progress: number;
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
