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

## Phase 1: Foundation & Setup ✅ COMPLETE

**Duration:** Week 1  
**Completed:** January 30, 2026  
**Goal:** Project scaffolding, database setup, and authentication flow

### What Was Built

| Component | Files Created |
|-----------|---------------|
| Expo Project | `/app` folder with React Native + Expo Router |
| Supabase Config | `lib/supabase.ts` - Client with secure storage |
| Auth Context | `lib/auth.tsx` - signIn, signUp, signOut hooks |
| Login Screen | `app/(auth)/login.tsx` |
| Signup Screen | `app/(auth)/signup.tsx` |
| Protected Routes | `app/_layout.tsx` - Redirects unauthenticated users |
| Database Schema | `supabase/schema.sql` - 5 tables with RLS |

### Database Tables Created

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `companies` | Business entities |
| `teams` | Teams within companies |
| `team_members` | User-team relationships with roles |
| `tasks` | All tasks (personal & business) |

### Tasks

| # | Task | Status |
|---|------|--------|
| 1.1 | Setup React Native + RN Web project | ✅ Done |
| 1.2 | Setup Supabase project | ✅ Done |
| 1.3 | Design database schema | ✅ Done |
| 1.4 | Setup authentication flow | ✅ Done |
| 1.5 | Setup navigation structure | ✅ Done |

### Acceptance Criteria

- [x] App runs on web browser
- [ ] App runs on iOS simulator (not tested yet)
- [ ] App runs on Android emulator (not tested yet)
- [x] User can sign up with email/password
- [x] User can log in and see a home screen
- [x] Database tables created with proper relationships
- [x] Row Level Security (RLS) policies enabled
- [ ] Personal/Business mode toggle visible (Phase 2)

### Open Questions

| # | Question | Decision |
|---|----------|----------|
| Q1.1 | Monorepo with Expo Router or separate web/mobile builds? | ✅ **Expo Router** — Easier for solo dev, handles builds |
| Q1.2 | Supabase free tier or paid from start? | ✅ **Free tier** — Sufficient for MVP (500MB DB, 50K MAU) |
| Q1.3 | Use Expo managed workflow or bare React Native? | ✅ **Expo managed** — Simpler tooling, EAS builds |
| Q1.4 | Any UI component library preference (NativeBase, Tamagui, etc.)? | ✅ **Custom StyleSheet** — Learn fundamentals, full control over calendar UX |

### Tech Stack (Confirmed)

| Layer | Technology | Reason |
|-------|------------|--------|
| Framework | Expo SDK 52+ | Managed workflow, EAS builds |
| Routing | Expo Router | File-based routing for web + mobile |
| Styling | React Native StyleSheet | Learn fundamentals, no extra deps |
| Icons | @expo/vector-icons | Built into Expo |
| Backend | Supabase (Free tier) | Auth, DB, Realtime, RLS |
| Database | PostgreSQL (via Supabase) | Relational, date-friendly |
| Web Hosting | Vercel | Free, easy Expo web deploy |

### Dependencies

- Node.js installed
- Supabase account created
- Expo CLI / React Native CLI installed
- Git repository initialized

---

## Phase 2: Core Calendar UI

**Duration:** Week 2–3  
**Status:** ✅ COMPLETE  
**Completed:** January 30, 2026  
**Goal:** Build the calendar-first interface (monthly view + day view)

### What Was Built

| Component | Files Created |
|-----------|---------------|
| Calendar Components | `components/calendar/CalendarHeader.tsx`, `CalendarGrid.tsx`, `CalendarDay.tsx`, `MonthCalendar.tsx` |
| Task Components | `components/tasks/TaskCard.tsx`, `TaskList.tsx` |
| Tasks Service | `lib/tasks.ts` - Supabase queries and utilities |
| Settings | `lib/settings.tsx` - User preferences context |
| Types | `lib/types.ts` - TypeScript type definitions |
| Calendar Screen | `app/(tabs)/index.tsx` - Main calendar view |
| Settings Screen | `app/(tabs)/settings.tsx` - User preferences |
| Day View Screen | `app/day/[date].tsx` - Task list for selected date |
| DB Migration | `supabase/migrations/add_week_starts_on.sql` |

### Step-by-Step Implementation Order

| Step | Task | Description | Status |
|------|------|-------------|--------|
| 2.1 | Replace default tabs with Calendar tab | Update tab navigation to show Calendar as home | ✅ Done |
| 2.2 | Build CalendarHeader component | Month/year display + prev/next navigation | ✅ Done |
| 2.3 | Build CalendarGrid component | 7-column grid with day labels (Mon-Sun or Sun-Sat) | ✅ Done |
| 2.4 | Build CalendarDay component | Individual day cell, handles today/selected state | ✅ Done |
| 2.5 | Add month navigation logic | State for current month, prev/next handlers | ✅ Done |
| 2.6 | Create tasks service | `lib/tasks.ts` - Supabase queries for tasks | ✅ Done |
| 2.7 | Fetch tasks for current month | Query tasks by date range, aggregate counts | ✅ Done |
| 2.8 | Show task counts in day cells | Display new/in-progress/completed/overdue counts | ✅ Done |
| 2.9 | Build DayView screen | Full task list for selected date | ✅ Done |
| 2.10 | Build TaskCard component | Displays task title, status, priority | ✅ Done |
| 2.11 | Add empty states | "No tasks" messages for calendar and day view | ✅ Done |
| 2.12 | Add loading states | Skeleton/spinner while fetching | ✅ Done |

### Files Created

```
app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Calendar screen (replace existing)
│   │   └── _layout.tsx        # Update tab labels/icons
│   └── day/
│       └── [date].tsx         # Day view screen (dynamic route)
├── components/
│   ├── calendar/
│   │   ├── CalendarHeader.tsx
│   │   ├── CalendarGrid.tsx
│   │   ├── CalendarDay.tsx
│   │   └── MonthCalendar.tsx  # Main calendar component
│   └── tasks/
│       ├── TaskCard.tsx
│       └── TaskList.tsx
└── lib/
    └── tasks.ts               # Task queries and types
```

### Acceptance Criteria

- [x] Monthly calendar displays current month
- [x] User can navigate to previous/next months
- [x] Each date cell shows task summary counts
- [x] Clicking a date opens day view
- [x] Day view lists all tasks for that date
- [x] Task cards show title, status, and due indicator
- [ ] Calendar loads within 500ms (not benchmarked yet)
- [x] Works on web and mobile
- [x] User can configure week start day (Sunday/Monday) in Settings

### Open Questions (Need Decisions)

| # | Question | Decision |
|---|----------|----------|
| Q2.1 | Use existing calendar library or build custom? | ✅ **Build custom** — More control for task integration |
| Q2.2 | Week starts on Sunday or Monday? | ✅ **User-configurable** — Dropdown in Settings, stored in `profiles.week_starts_on` |
| Q2.3 | How many tasks to show in summary before truncating? | ✅ **Show counts only** (e.g., "3 new") |
| Q2.4 | Day view as modal overlay or separate screen? | ✅ **Separate screen** — Better for mobile UX |

### Dependencies

- Phase 1 completed
- Database schema finalized
- Authentication working

---

## Phase 3: Personal Task Management

**Duration:** Week 3–4  
**Status:** ✅ COMPLETE  
**Completed:** January 30, 2026  
**Goal:** Full CRUD for personal tasks with overdue logic

### What Was Built

| Component | Files Created |
|-----------|---------------|
| Task Form | `components/tasks/TaskForm.tsx` - Reusable form with validation |
| New Task Screen | `app/task/new.tsx` - Create new tasks |
| Edit Task Screen | `app/task/[id].tsx` - Edit/delete existing tasks |
| Date Picker | Integrated `@react-native-community/datetimepicker` |

### Tasks

| # | Task | Description | Status |
|---|------|-------------|--------|
| 3.1 | Create task form | Fields: title, description, due date, priority | ✅ Done |
| 3.2 | Task validation | Required fields, date validation | ✅ Done |
| 3.3 | Edit task functionality | Update any task field | ✅ Done |
| 3.4 | Delete task with confirmation | Hard delete with Alert confirmation | ✅ Done |
| 3.5 | Task status toggle | New/In Progress/Completed transitions | ✅ Done (Phase 2) |
| 3.6 | Multi-day task logic | Task appears on all dates in range | ✅ Done |
| 3.7 | Overdue rollover logic | Incomplete tasks show as "Past Due" | ✅ Done (Phase 2) |
| 3.8 | Visual distinction for overdue | Different color/badge for past due tasks | ✅ Done (Phase 2) |

### Acceptance Criteria

- [x] User can create a task with title, description, due date
- [x] User can edit any task field
- [x] User can delete a task (with confirmation)
- [x] User can mark task as complete/incomplete
- [x] Multi-day tasks appear on all relevant dates
- [x] Overdue tasks show "Past Due" badge
- [x] Overdue tasks appear on current day
- [x] Form validation prevents invalid submissions
- [x] Success/error feedback shown to user

### Open Questions

| # | Question | Decision |
|---|----------|----------|
| Q3.1 | Should overdue tasks show on every day until completed, or just today? | ✅ **Show on every day until completed** — Past due tasks carry forward on the calendar/day view until marked completed |
| Q3.2 | Maximum task duration (can it span more than 7 days)? | ✅ **No limit** — Users can create any duration multi-day tasks |
| Q3.3 | Should deleted tasks be soft-deleted (recoverable) or hard-deleted? | ✅ **Hard delete** — With confirmation dialog before deletion |
| Q3.4 | Task statuses: New/In Progress/Completed? | ✅ **New/In Progress/Completed** — Better visibility and workflow |

### Dependencies

- Phase 2 completed
- Calendar UI functional
- Day view working

---

## Phase 4: Business Mode

**Duration:** Week 5–6  
**Status:** 🚧 IN PROGRESS  
**Goal:** Team-based task management with assignments

### What's Being Built

| Component | Files Created |
|-----------|---------------|
| Company Context | `lib/company.tsx` - Company management with teams, invites |
| Business Screen | `app/(tabs)/business.tsx` - Company, team & invite management UI |
| Tab Update | Updated `app/(tabs)/_layout.tsx` - Added Business tab |
| Provider Integration | Updated `app/_layout.tsx` - Added CompanyProvider |
| Team RLS Policies | `supabase/migrations/add_team_management_policies.sql` |
| Invite Codes Table | `supabase/migrations/add_invite_codes.sql` |
| Types | Updated `lib/types.ts` - Added InviteCode, InviteValidation |

### Tasks

| # | Task | Description | Status |
|---|------|-------------|--------|
| 4.1 | Company entity & creation | User can create a company | ✅ Done |
| 4.2 | Team entity & creation | Admin can create teams within company | ✅ Done |
| 4.3 | Invite users to team | Admin can add users by invite code | ✅ Done |
| 4.4 | User-company-team relationships | Proper hierarchy in database | ✅ Done |
| 4.5 | Assign task to team member | Task has `assignee_id` field | ⬜ Not Started |
| 4.6 | View own tasks + team tasks | Business user sees combined view | ⬜ Not Started |
| 4.7 | Priority field | Low / Medium / High priority | ✅ Done (Phase 3) |
| 4.8 | Filter tasks by assignee | Optional filter in day view | ⬜ Not Started |
| 4.9 | Admin role management | First user = Admin, can manage team | ✅ Done |

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
| Q4.1 | Can one user belong to multiple companies? | ✅ **No** for MVP - simplifies RLS |
| Q4.2 | Is the first user who creates company automatically Admin? | ✅ **Yes** - Implemented in createCompany flow |
| Q4.3 | Invitation flow: email invite or invite code? | **Invite code** for MVP (pending) |
| Q4.4 | Can a user be in multiple teams within same company? | ✅ **Yes** - Schema supports this |
| Q4.5 | Should unassigned tasks be visible to all team members? | **Yes** (pending implementation) |

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
| 2026-01-30 | Use Expo Router (monorepo) | Solo developer, simpler setup, EAS handles builds |
| 2026-01-30 | Supabase Free Tier | Sufficient for MVP (500MB DB, 50K MAU) |
| 2026-01-30 | Custom StyleSheet (no UI library) | Learn RN fundamentals, full control over calendar UX |
| 2026-01-30 | Expo managed workflow | Avoid native complexity, easier updates |
| 2026-01-30 | User-configurable week start | Dropdown setting for Sunday/Monday, stored in profiles table |
| 2026-02-03 | One user = one company (MVP) | Simplifies RLS policies and company context |
| 2026-02-03 | Company creator is auto-admin | Standard pattern, creator gets admin role on default team |
| 2026-02-03 | Default "General" team on company creation | Every company starts with one team for immediate use |

---

## Notes

- Update this document as decisions are made
- Mark completed phases with ✅
- Add blockers/risks as they arise
