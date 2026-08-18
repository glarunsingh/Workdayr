# Workdayr - Personal Profile Database Schema

> **Scope:** Personal mode only. Business tables (companies, teams, team_members, invite_codes) are excluded and will be added separately when business mode is implemented.

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Tables](#tables)
4. [Task Classification System](#task-classification-system)
5. [Seed Data](#seed-data)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Helper Functions & Triggers](#helper-functions--triggers)
8. [Migration Files](#migration-files)

---

## Schema Overview

The personal profile schema consists of **7 tables** in the `public` schema:

| # | Table | Purpose | Row Count Expectation |
|---|-------|---------|----------------------|
| 1 | `profiles` | User identity + preferences | 1 per user |
| 2 | `tasks` | All tasks (personal) | Thousands per user |
| 3 | `task_categories` | Life area classification | 8 system + custom per user |
| 4 | `task_tags` | User-defined flexible labels | Dozens per user |
| 5 | `task_tag_map` | Task ↔ Tag many-to-many join | Many per user |
| 6 | `task_subtasks` | Checklist items within a task | 0-20 per task |
| 7 | `task_recurrence_rules` | Recurring task definitions | 0-50 per user |

---

## Entity Relationship Diagram

```
┌──────────────────────────────────┐
│           profiles               │
│──────────────────────────────────│
│  id (PK, FK → auth.users)       │
│  email                           │
│  full_name                       │
│  avatar_url                      │
│  mode (personal | business)      │
│  week_starts_on (sun | mon)      │
│  timezone                        │
│  notification_preferences (JSONB)│
│  theme_preference                │
│  daily_goal                      │
│  created_at / updated_at         │
└──────────┬───────────────────────┘
           │ 1
           │
           │ ←────────────────────────────────────────────────────────┐
           │                                                          │
    ┌──────┴──────────────────────┐    ┌──────────────────────────┐   │
    │         tasks               │    │   task_recurrence_rules  │   │
    │─────────────────────────────│    │──────────────────────────│   │
    │  id (PK)                    │    │  id (PK)                 │   │
    │  title                      │    │  user_id (FK → profiles) │───┘
    │  description                │    │  frequency               │
    │  due_date                   │    │  interval                │
    │  end_date                   │    │  days_of_week []         │
    │  status                     │    │  day_of_month            │
    │  priority                   │    │  month_of_year           │
    │  created_by (FK → profiles) │    │  end_type                │
    │  category_id (FK → cats)    │    │  end_date                │
    │  recurrence_rule_id (FK) ───│───→│  max_occurrences         │
    │  task_type                  │    │  occurrences_created     │
    │  created_at / updated_at    │    │  created_at              │
    │  completed_at               │    └──────────────────────────┘
    └──┬────────┬─────────────────┘
       │ 1      │ 1
       │        │
       │        │    ┌───────────────────────┐
       │        └───→│    task_subtasks       │
       │             │───────────────────────│
       │             │  id (PK)              │
       │             │  task_id (FK → tasks)  │
       │             │  title                 │
       │             │  is_completed          │
       │             │  sort_order            │
       │             │  completed_at          │
       │             │  created_at/updated_at │
       │             └───────────────────────┘
       │ 
       │         ┌──────────────────────┐
       │    N    │    task_tag_map      │    N    ┌──────────────────┐
       └────────→│──────────────────────│────────→│   task_tags      │
                 │  task_id (FK, PK)    │         │──────────────────│
                 │  tag_id  (FK, PK)    │         │  id (PK)         │
                 └──────────────────────┘         │  user_id (FK)    │
                                                  │  name            │
    ┌───────────────────────────┐                  │  color           │
    │    task_categories        │                  │  created_at      │
    │───────────────────────────│                  └──────────────────┘
    │  id (PK)                  │
    │  user_id (FK, nullable)   │  ← NULL = system default
    │  name                     │
    │  icon (emoji)             │
    │  color (hex)              │
    │  is_system                │
    │  sort_order               │
    │  created_at               │
    └───────────────────────────┘
```

---

## Tables

### 1. `profiles`

Extends Supabase `auth.users` with app-specific data and personal preferences.

| Column | Type | Default | Nullable | Constraint |
|--------|------|---------|----------|------------|
| `id` | UUID (PK) | — | NO | FK → `auth.users` ON DELETE CASCADE |
| `email` | TEXT | — | NO | — |
| `full_name` | TEXT | — | YES | — |
| `avatar_url` | TEXT | — | YES | — |
| `mode` | TEXT | `'personal'` | YES | CHECK: `personal`, `business` |
| `week_starts_on` | TEXT | `'sunday'` | YES | CHECK: `sunday`, `monday` |
| `timezone` | TEXT | `'UTC'` | NO | — |
| `notification_preferences` | JSONB | `{"daily_summary":false,"due_date_reminder":true,"overdue_alert":true}` | NO | — |
| `theme_preference` | TEXT | `'system'` | NO | CHECK: `system`, `light`, `dark` |
| `daily_goal` | INTEGER | NULL | YES | CHECK: 1–50 or NULL |
| `created_at` | TIMESTAMPTZ | `NOW()` | YES | — |
| `updated_at` | TIMESTAMPTZ | `NOW()` | YES | Auto-updated by trigger |

**Notification Preferences JSON shape:**
```json
{
  "daily_summary": false,
  "due_date_reminder": true,
  "overdue_alert": true
}
```

---

### 2. `tasks`

Core task storage. Each task belongs to a user, optionally linked to a category and recurrence rule.

| Column | Type | Default | Nullable | Constraint |
|--------|------|---------|----------|------------|
| `id` | UUID (PK) | `gen_random_uuid()` | NO | — |
| `title` | TEXT | — | NO | — |
| `description` | TEXT | — | YES | — |
| `due_date` | DATE | — | NO | — |
| `end_date` | DATE | — | YES | For multi-day tasks |
| `status` | TEXT | `'new'` | YES | CHECK: `new`, `in_progress`, `completed` |
| `priority` | TEXT | `'medium'` | YES | CHECK: `low`, `medium`, `high` |
| `created_by` | UUID | — | NO | FK → `profiles` ON DELETE CASCADE |
| `assignee_id` | UUID | — | YES | FK → `profiles` ON DELETE SET NULL |
| `team_id` | UUID | — | YES | — |
| `task_type` | TEXT | `'personal'` | YES | CHECK: `personal`, `business` |
| `category_id` | UUID | — | YES | FK → `task_categories` ON DELETE SET NULL |
| `recurrence_rule_id` | UUID | — | YES | FK → `task_recurrence_rules` ON DELETE SET NULL |
| `created_at` | TIMESTAMPTZ | `NOW()` | YES | — |
| `updated_at` | TIMESTAMPTZ | `NOW()` | YES | Auto-updated by trigger |
| `completed_at` | TIMESTAMPTZ | — | YES | Set when status → completed |

**Constraints:**
- `tasks_team_type_consistency`: Personal tasks must have `team_id IS NULL`; business tasks must have `team_id IS NOT NULL`.

**Indexes:**
- `idx_tasks_created_by_due_date` — Fast calendar queries
- `idx_tasks_status` — Status filtering
- `idx_tasks_category` — Category filtering
- `idx_tasks_recurrence` — Recurrence lookups

---

### 3. `task_categories`

Life area classification for tasks. Includes 8 system-default categories shared by all users, plus user-created custom categories.

| Column | Type | Default | Nullable | Constraint |
|--------|------|---------|----------|------------|
| `id` | UUID (PK) | `gen_random_uuid()` | NO | — |
| `user_id` | UUID | — | YES | FK → `profiles` ON DELETE CASCADE. NULL = system default. |
| `name` | TEXT | — | NO | Unique per user (case-insensitive) |
| `icon` | TEXT | `'📋'` | NO | Emoji character |
| `color` | TEXT | `'#6B7280'` | NO | Hex color string |
| `is_system` | BOOLEAN | `false` | NO | `true` for the 8 defaults |
| `sort_order` | INTEGER | `0` | NO | Display ordering |
| `created_at` | TIMESTAMPTZ | `now()` | NO | — |

**Uniqueness:** A composite unique index on `(COALESCE(user_id, nil_uuid), LOWER(name))` prevents duplicate names per user and among system categories.

---

### 4. `task_tags`

User-defined flexible labels that can be applied to any task. Think of these as hashtags.

| Column | Type | Default | Nullable | Constraint |
|--------|------|---------|----------|------------|
| `id` | UUID (PK) | `gen_random_uuid()` | NO | — |
| `user_id` | UUID | — | NO | FK → `profiles` ON DELETE CASCADE |
| `name` | TEXT | — | NO | Unique per user (case-insensitive) |
| `color` | TEXT | `'#6B7280'` | YES | Hex color |
| `created_at` | TIMESTAMPTZ | `now()` | NO | — |

---

### 5. `task_tag_map`

Many-to-many join table linking tasks to tags. A task can have multiple tags, and a tag can be on multiple tasks.

| Column | Type | Constraint |
|--------|------|------------|
| `task_id` | UUID (PK) | FK → `tasks` ON DELETE CASCADE |
| `tag_id` | UUID (PK) | FK → `task_tags` ON DELETE CASCADE |

**Composite Primary Key:** `(task_id, tag_id)`

---

### 6. `task_subtasks`

Ordered checklist items within a task. Deleting a parent task cascades to its subtasks.

| Column | Type | Default | Nullable | Constraint |
|--------|------|---------|----------|------------|
| `id` | UUID (PK) | `gen_random_uuid()` | NO | — |
| `task_id` | UUID | — | NO | FK → `tasks` ON DELETE CASCADE |
| `title` | TEXT | — | NO | — |
| `is_completed` | BOOLEAN | `false` | NO | — |
| `sort_order` | INTEGER | `0` | NO | Display ordering |
| `completed_at` | TIMESTAMPTZ | — | YES | Auto-set by trigger |
| `created_at` | TIMESTAMPTZ | `now()` | NO | — |
| `updated_at` | TIMESTAMPTZ | `now()` | NO | Auto-updated by trigger |

---

### 7. `task_recurrence_rules`

Defines recurrence patterns for repeating tasks.

| Column | Type | Default | Nullable | Constraint |
|--------|------|---------|----------|------------|
| `id` | UUID (PK) | `gen_random_uuid()` | NO | — |
| `user_id` | UUID | — | NO | FK → `profiles` ON DELETE CASCADE |
| `frequency` | TEXT | — | NO | CHECK: `daily`, `weekly`, `monthly`, `yearly` |
| `interval` | INTEGER | `1` | NO | CHECK: >= 1. E.g., `2` = every 2 weeks |
| `days_of_week` | INTEGER[] | NULL | YES | For weekly: `[0,1,2,3,4,5,6]` (Sun=0) |
| `day_of_month` | INTEGER | NULL | YES | CHECK: 1–31. For monthly recurrence. |
| `month_of_year` | INTEGER | NULL | YES | CHECK: 1–12. For yearly recurrence. |
| `end_type` | TEXT | `'never'` | NO | CHECK: `never`, `on_date`, `after_count` |
| `end_date` | DATE | NULL | YES | Used when `end_type = 'on_date'` |
| `max_occurrences` | INTEGER | NULL | YES | CHECK: >= 1. Used when `end_type = 'after_count'` |
| `occurrences_created` | INTEGER | `0` | NO | Tracks how many task instances created |
| `created_at` | TIMESTAMPTZ | `now()` | NO | — |

**Recurrence Examples:**

| Use Case | frequency | interval | days_of_week | day_of_month |
|----------|-----------|----------|--------------|--------------|
| Every day | `daily` | 1 | — | — |
| Every weekday | `weekly` | 1 | `[1,2,3,4,5]` | — |
| Every 2 weeks on Mon | `weekly` | 2 | `[1]` | — |
| 1st of every month | `monthly` | 1 | — | 1 |
| Every quarter (3 months) | `monthly` | 3 | — | 1 |
| Every year on Jan 15 | `yearly` | 1 | — | 15 |

---

## Task Classification System

Personal tasks in Workdayr are classified across **6 dimensions**, providing a rich yet simple organizational model:

### Classification Dimensions

```
┌─────────────────────────────────────────────────────────────────┐
│                    TASK CLASSIFICATION                          │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│  CATEGORY    │  Life area the task belongs to                   │
│  (1 per task)│  Work | Home | Finance | Health | Learning |     │
│              │  Social | Errands | Goals | + Custom             │
│              │                                                  │
├──────────────┼──────────────────────────────────────────────────┤
│              │                                                  │
│  STATUS      │  Workflow state of the task                      │
│  (1 per task)│  New → In Progress → Completed                   │
│              │  (+ Overdue — computed, not stored)               │
│              │                                                  │
├──────────────┼──────────────────────────────────────────────────┤
│              │                                                  │
│  PRIORITY    │  Urgency / importance level                      │
│  (1 per task)│  Low | Medium | High                             │
│              │                                                  │
├──────────────┼──────────────────────────────────────────────────┤
│              │                                                  │
│  TAGS        │  Flexible user-defined labels                    │
│  (N per task)│  e.g., #quick, #weekend, #groceries, #urgent     │
│              │                                                  │
├──────────────┼──────────────────────────────────────────────────┤
│              │                                                  │
│  TIME        │  Computed from due_date (not stored)             │
│  HORIZON     │  Overdue | Today | This Week | Upcoming          │
│              │                                                  │
├──────────────┼──────────────────────────────────────────────────┤
│              │                                                  │
│  RECURRENCE  │  Repeating pattern                               │
│  (0-1/task)  │  Daily | Weekly | Monthly | Yearly               │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

### Categories vs Tags — When to Use Which

| Aspect | Category | Tags |
|--------|----------|------|
| **Cardinality** | 1 per task (single-select) | Many per task (multi-select) |
| **Purpose** | Primary classification — "What area of life?" | Secondary labels — "What else describes this?" |
| **Source** | 8 system + user custom | Entirely user-defined |
| **Examples** | Work, Home, Finance | #quick, #weekend, #call, #buy |
| **Required?** | No (nullable) | No (optional) |

### Default Category Breakdown

| Category | Icon | Color | Typical Tasks |
|----------|------|-------|---------------|
| **Work** | 💼 | Blue `#3B82F6` | Finish report, Send email, Prepare presentation |
| **Home** | 🏠 | Green `#10B981` | Clean kitchen, Fix leaky tap, Organize closet |
| **Finance** | 💰 | Amber `#F59E0B` | Pay rent, Review budget, File taxes, Transfer funds |
| **Health & Fitness** | 💪 | Red `#EF4444` | Gym workout, Doctor appointment, Meal prep |
| **Learning** | 📚 | Purple `#8B5CF6` | Read chapter, Online course, Practice coding |
| **Social** | 👥 | Pink `#EC4899` | Call mom, Plan party, Reply to messages |
| **Errands** | 🛒 | Orange `#F97316` | Grocery shopping, Pick up dry cleaning, Return package |
| **Goals** | 🎯 | Cyan `#06B6D4` | Save $1000, Run 5K, Learn Spanish, Launch side project |

---

## Seed Data

The following 8 system categories are pre-populated and available to all users:

```sql
INSERT INTO task_categories (user_id, name, icon, color, is_system, sort_order) VALUES
  (NULL, 'Work',             '💼', '#3B82F6', true, 1),
  (NULL, 'Home',             '🏠', '#10B981', true, 2),
  (NULL, 'Finance',          '💰', '#F59E0B', true, 3),
  (NULL, 'Health & Fitness', '💪', '#EF4444', true, 4),
  (NULL, 'Learning',         '📚', '#8B5CF6', true, 5),
  (NULL, 'Social',           '👥', '#EC4899', true, 6),
  (NULL, 'Errands',          '🛒', '#F97316', true, 7),
  (NULL, 'Goals',            '🎯', '#06B6D4', true, 8);
```

---

## Row Level Security (RLS)

All tables have RLS enabled. Here's a summary of the access rules:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Own profile only | Auto-created on signup | Own profile only | — |
| `tasks` | Own tasks only | Own personal tasks (no team/assignee) | Own personal tasks | Own tasks only |
| `task_categories` | System categories + own custom | Own custom only (`is_system=false`) | Own custom only | Own custom only |
| `task_tags` | Own tags only | Own tags only | Own tags only | Own tags only |
| `task_tag_map` | Tags on own tasks | Tag own tasks with own tags | — | Remove tags from own tasks |
| `task_subtasks` | Subtasks of own tasks | Add to own tasks | Update on own tasks | Delete from own tasks |
| `task_recurrence_rules` | Own rules only | Own rules only | Own rules only | Own rules only |

**Key Security Principle:** Every query is scoped to `auth.uid()` — a user can never see, modify, or delete another user's data.

---

## Helper Functions & Triggers

| Function / Trigger | Table | Purpose |
|-------------------|-------|---------|
| `handle_new_user()` | `auth.users` → `profiles` | Auto-creates a profile row when a new user signs up |
| `update_updated_at()` | `profiles`, `tasks`, `task_subtasks` | Auto-sets `updated_at = NOW()` on any row update |
| `handle_subtask_completion()` | `task_subtasks` | Auto-sets `completed_at` when `is_completed` toggles true, clears it when toggled false |

---

## Migration Files

Located in `app/supabase/migrations/`:

| # | File | Description |
|---|------|-------------|
| 1 | `add_week_starts_on.sql` | Adds `week_starts_on` column to profiles |
| 2 | `add_task_statuses_new_in_progress.sql` | Changes status values from pending/completed → new/in_progress/completed |
| 3 | `add_team_management_policies.sql` | RLS for team CRUD (business — not yet applied) |
| 4 | `fix_team_members_infinite_recursion.sql` | Fixes RLS recursion (business — not yet applied) |
| 5 | `add_invite_codes.sql` | Invite code system (business — not yet applied) |
| 6 | `fix_tasks_rls_and_constraints.sql` | Hardened task RLS (business — not yet applied) |
| 7 | **`add_personal_profile_schema.sql`** | **This migration — categories, tags, subtasks, recurrence, profile enhancements** |

> **Note:** Migrations 3-6 are business-mode migrations and have **not been applied** to the database. They will be applied when business mode is implemented. The base schema + migration 7 (personal profile) are the only active migrations.

---

## TypeScript Types

All database types are mirrored in `app/lib/types.ts`:

```typescript
// Core type aliases
type TaskStatus       = 'new' | 'in_progress' | 'completed';
type TaskPriority     = 'low' | 'medium' | 'high';
type ThemePreference  = 'system' | 'light' | 'dark';
type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
type RecurrenceEndType   = 'never' | 'on_date' | 'after_count';

// Interfaces: Profile, Task, TaskCategory, TaskTag,
//             TaskSubtask, RecurrenceRule, TaskSummary, etc.
```

See the full type definitions in [`app/lib/types.ts`](../app/lib/types.ts).

---

## What's Next (Personal Profile)

- [ ] Implement category picker in `TaskForm` component
- [ ] Add tag management UI (create, assign, filter)
- [ ] Build subtask/checklist UI within task detail view
- [ ] Implement recurrence logic (task generation engine)
- [ ] Add profile settings screen for timezone, theme, daily goal, notifications
- [ ] Category-based filtering on calendar day view
- [ ] Tag-based search/filter across all tasks
