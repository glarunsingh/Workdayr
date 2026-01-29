# Workdayr Development Plan

## Project Summary

**Product:** Workdayr - A Calendar-based Task Manager for Work  
**Developer:** Solo Developer  
**Target:** MVP Launch  

### Core Concept
A calendar-first task manager that unifies personal and business task management across web, Android, iOS, and desktop using a single codebase.

### Key Differentiators
1. **Calendar-first UX** — Monthly calendar as default view (not lists/boards)
2. **Unified personal + business** — No context switching between tools
3. **Overdue task continuity** — Past-due tasks roll forward visibly
4. **Simplicity for small teams** — Targets ≤10 user teams, not enterprise-heavy

### Tech Stack
- **Frontend:** React Native + React Native Web (unified codebase)
- **Backend:** Supabase (PostgreSQL, Auth, RLS, Realtime)
- **Hosting:** Vercel/Netlify (web), Play Store/App Store (mobile)

---

## Phase 1: Foundation & Setup

**Duration:** Week 1  
**Goal:** Project scaffolding, database setup, and authentication flow

### Tasks

| # | Task | Description |
|---|------|-------------|
| 1.1 | Setup React Native + RN Web project | Initialize project with Expo or bare React Native |
| 1.2 | Setup Supabase project | Create project, configure environment variables |
| 1.3 | Design database schema | Create tables: `users`, `tasks`, `teams`, `companies` |
| 1.4 | Setup authentication flow | Email/password signup and login |
| 1.5 | Setup navigation structure | Personal/Business mode toggle, basic routing |

### Acceptance Criteria

- [ ] App runs on web browser
- [ ] App runs on iOS simulator
- [ ] App runs on Android emulator
- [ ] User can sign up with email/password
- [ ] User can log in and see a home screen
- [ ] Database tables created with proper relationships
- [ ] Row Level Security (RLS) policies enabled
- [ ] Personal/Business mode toggle visible (even if not functional yet)

### Open Questions

| # | Question | Decision |
|---|----------|----------|
| Q1.1 | Monorepo with Expo Router or separate web/mobile builds? | _TBD_ |
| Q1.2 | Supabase free tier or paid from start? | _TBD_ |
| Q1.3 | Use Expo managed workflow or bare React Native? | _TBD_ |
| Q1.4 | Any UI component library preference (NativeBase, Tamagui, etc.)? | _TBD_ |

### Dependencies

- Node.js installed
- Supabase account created
- Expo CLI / React Native CLI installed
- Git repository initialized

---

## Phase 2: Core Calendar UI

**Duration:** Week 2–3  
**Goal:** Build the calendar-first interface (monthly view + day view)

### Tasks

| # | Task | Description |
|---|------|-------------|
| 2.1 | Build monthly calendar component | Grid layout with navigation (prev/next month) |
| 2.2 | Fetch tasks and aggregate by date | Query tasks, group by due date |
| 2.3 | Show task summary per day | Display `X Pending | Y Completed | Z Past Due` per cell |
| 2.4 | Build day view screen/modal | Clicking a date opens detailed task list |
| 2.5 | Task card component | Displays title, status, due indicator |
| 2.6 | Empty state handling | Show message when no tasks exist |

### Acceptance Criteria

- [ ] Monthly calendar displays current month
- [ ] User can navigate to previous/next months
- [ ] Each date cell shows task summary counts
- [ ] Clicking a date opens day view
- [ ] Day view lists all tasks for that date
- [ ] Task cards show title, status, and due indicator
- [ ] Calendar loads within 500ms
- [ ] Works on web and mobile

### Open Questions

| # | Question | Decision |
|---|----------|----------|
| Q2.1 | Use existing calendar library or build custom? | _TBD_ |
| Q2.2 | Week starts on Sunday or Monday? | _TBD_ |
| Q2.3 | How many tasks to show in summary before truncating? | _TBD_ |
| Q2.4 | Day view as modal overlay or separate screen? | _TBD_ |

### Dependencies

- Phase 1 completed
- Database schema finalized
- Authentication working

---

## Phase 3: Personal Task Management

**Duration:** Week 3–4  
**Goal:** Full CRUD for personal tasks with overdue logic

### Tasks

| # | Task | Description |
|---|------|-------------|
| 3.1 | Create task form | Fields: title, description, due date, status |
| 3.2 | Task validation | Required fields, date validation |
| 3.3 | Edit task functionality | Update any task field |
| 3.4 | Delete task with confirmation | Soft delete or hard delete |
| 3.5 | Task status toggle | Pending ↔ Completed transition |
| 3.6 | Multi-day task logic | Task appears on all dates in range |
| 3.7 | Overdue rollover logic | Incomplete tasks show as "Past Due" |
| 3.8 | Visual distinction for overdue | Different color/badge for past due tasks |

### Acceptance Criteria

- [ ] User can create a task with title, description, due date
- [ ] User can edit any task field
- [ ] User can delete a task (with confirmation)
- [ ] User can mark task as complete/incomplete
- [ ] Multi-day tasks appear on all relevant dates
- [ ] Overdue tasks show "Past Due" badge
- [ ] Overdue tasks appear on current day
- [ ] Form validation prevents invalid submissions
- [ ] Success/error feedback shown to user

### Open Questions

| # | Question | Decision |
|---|----------|----------|
| Q3.1 | Should overdue tasks show on every day until completed, or just today? | _TBD_ |
| Q3.2 | Maximum task duration (can it span more than 7 days)? | _TBD_ |
| Q3.3 | Should deleted tasks be soft-deleted (recoverable) or hard-deleted? | _TBD_ |
| Q3.4 | Task statuses: just Pending/Completed, or add In Progress? | _TBD_ |

### Dependencies

- Phase 2 completed
- Calendar UI functional
- Day view working

---

## Phase 4: Business Mode

**Duration:** Week 5–6  
**Goal:** Team-based task management with assignments

### Tasks

| # | Task | Description |
|---|------|-------------|
| 4.1 | Company entity & creation | User can create a company |
| 4.2 | Team entity & creation | Admin can create teams within company |
| 4.3 | Invite users to team | Admin can add users by email |
| 4.4 | User-company-team relationships | Proper hierarchy in database |
| 4.5 | Assign task to team member | Task has `assignee_id` field |
| 4.6 | View own tasks + team tasks | Business user sees combined view |
| 4.7 | Priority field | Low / Medium / High priority |
| 4.8 | Filter tasks by assignee | Optional filter in day view |
| 4.9 | Admin role management | First user = Admin, can manage team |

### Acceptance Criteria

- [ ] User can create a company
- [ ] Admin can create teams within company
- [ ] Admin can invite users via email
- [ ] Invited user receives invitation (or can join)
- [ ] Business tasks can be assigned to team members
- [ ] Tasks show assignee name
- [ ] Priority can be set (Low/Medium/High)
- [ ] Business user sees own tasks + assigned tasks
- [ ] RLS ensures users only see their company's data

### Open Questions

| # | Question | Decision |
|---|----------|----------|
| Q4.1 | Can one user belong to multiple companies? | _TBD_ |
| Q4.2 | Is the first user who creates company automatically Admin? | _TBD_ |
| Q4.3 | Invitation flow: email invite or invite code? | _TBD_ |
| Q4.4 | Can a user be in multiple teams within same company? | _TBD_ |
| Q4.5 | Should unassigned tasks be visible to all team members? | _TBD_ |

### Dependencies

- Phase 3 completed
- Personal task CRUD working
- Supabase RLS configured

---

## Phase 5: Cross-Platform Polish & Sync

**Duration:** Week 7  
**Goal:** Real-time sync, platform-specific polish, performance

### Tasks

| # | Task | Description |
|---|------|-------------|
| 5.1 | Enable Supabase Realtime | Subscribe to task changes |
| 5.2 | Real-time UI updates | Changes reflect instantly across devices |
| 5.3 | iOS-specific UI tweaks | Follow iOS Human Interface Guidelines |
| 5.4 | Android-specific UI tweaks | Follow Material Design guidelines |
| 5.5 | Responsive web layout | Works on desktop, tablet, mobile browser |
| 5.6 | Performance optimization | Lazy loading, query optimization |
| 5.7 | Offline handling (basic) | Show cached data when offline |
| 5.8 | Loading states & skeletons | Smooth loading experience |

### Acceptance Criteria

- [ ] Changes sync in real-time across devices
- [ ] App feels native on iOS
- [ ] App feels native on Android
- [ ] Web app is responsive (desktop + mobile)
- [ ] Page load < 2 seconds
- [ ] Day view load < 500ms
- [ ] Loading states shown during data fetch
- [ ] Basic offline indicator (if no connection)

### Open Questions

| # | Question | Decision |
|---|----------|----------|
| Q5.1 | How critical is offline-first for MVP? | _TBD_ |
| Q5.2 | Any specific animations/transitions desired? | _TBD_ |

### Dependencies

- Phase 4 completed
- Core functionality working
- All platforms buildable

---

## Phase 6: MVP Launch Prep

**Duration:** Week 8  
**Goal:** Production readiness, deployment, basic analytics

### Tasks

| # | Task | Description |
|---|------|-------------|
| 6.1 | Error handling & edge cases | Graceful fallbacks, error boundaries |
| 6.2 | Basic onboarding flow | Explain Personal vs Business mode |
| 6.3 | Terms of Service & Privacy Policy | Required for app stores |
| 6.4 | Deploy web to Vercel/Netlify | Production web URL |
| 6.5 | Build Android APK | TestFlight/Play Store internal testing |
| 6.6 | Build iOS IPA | TestFlight internal testing |
| 6.7 | Basic analytics setup | Track DAU, task creation, retention |
| 6.8 | Error monitoring setup | Sentry or similar for crash reporting |
| 6.9 | Final QA testing | Test all flows on all platforms |

### Acceptance Criteria

- [ ] No unhandled errors crash the app
- [ ] New users understand the app via onboarding
- [ ] Web app deployed and accessible
- [ ] Android app builds successfully
- [ ] iOS app builds successfully
- [ ] Analytics tracking active
- [ ] Error monitoring active
- [ ] All acceptance criteria from previous phases verified

### Open Questions

| # | Question | Decision |
|---|----------|----------|
| Q6.1 | Analytics tool preference (Mixpanel, Amplitude, PostHog)? | _TBD_ |
| Q6.2 | Launch to public stores or internal testing first? | _TBD_ |
| Q6.3 | Custom domain for web app? | _TBD_ |

### Dependencies

- Phase 5 completed
- All core features working
- Apple Developer & Google Play accounts ready

---

## Post-MVP (V1.1) — Future Phases

These are explicitly deferred per the PRD:

| Feature | Priority | Notes |
|---------|----------|-------|
| Manager-specific views | High | Separate view for managers to see team overview |
| Advanced filters & search | Medium | Filter by status, priority, date range, assignee |
| Task analytics & reports | Medium | Completion rates, productivity metrics |
| Notifications & reminders | High | Push notifications, email reminders |
| OAuth login (Google, GitHub) | Medium | Additional login options |
| Third-party integrations | Low | Google Calendar, Outlook, Slack |
| AI-driven features | Low | Smart prioritization, auto-reschedule |
| Monetization enforcement | High | 10-user limit for free tier |

---

## Decision Log

Track key decisions made during development:

| Date | Decision | Rationale |
|------|----------|-----------|
| _YYYY-MM-DD_ | _Decision made_ | _Why this was chosen_ |

---

## Notes

- Update this document as decisions are made
- Mark completed phases with ✅
- Add blockers/risks as they arise
