# Product Requirements Document (PRD)

# Name: Workdayr - A Calendar based Task manager for Work


## 1. Product Overview

### Vision
Create a unified task manager application that seamlessly supports **personal and business task management** within a single platform, accessible across web, Android, iOS, and desktop.

### Problem Statement
Most task management tools either focus on **personal productivity** or **business workflows**, forcing users to switch tools or compromise on features. This product aims to provide a **single, unified solution** with a clear separation between **Personal** and **Business** task spaces, while sharing a consistent and intuitive user experience.

### Goals & Success Metrics
**Primary Goal**: Convert the idea into a market-ready product and monetize it.

**Success Metrics**:
- MVP launched within planned timeline
- Active daily users (DAU)
- Task completion rate
- User retention (30-day retention)
- Conversion from free → paid (business users)

---

## 2. Target Users & Personas

### Who This App Is For
- **Individuals** – Users managing personal or professional tasks for themselves
- **Business Users (MVP Focus)** – Users mapped to a company, team, project, and sprint
- **Admins** – Manage users, teams, and company-level settings

> Note: **Manager role is intentionally merged with Business User for MVP**. Manager-specific capabilities will be introduced post-POC.

### Refined Pain Points (POC-Aligned)
Even without active investors, these pain points justify the POC and future pitch:

1. **Context Switching Between Tools**  
   Users often manage personal tasks in one app and work tasks in another, leading to fragmentation and poor follow-through.

2. **Lack of Calendar-First Task Visibility**  
   Most task tools focus on lists or boards, making it hard to answer a simple question: *“What exactly do I need to do today?”*

3. **Poor Overdue Task Continuity**  
   Missed tasks often disappear or get buried, instead of clearly rolling forward and demanding attention.

4. **Overkill Tools for Small Teams**  
   Existing enterprise tools are heavy, complex, and costly for small teams (≤10 users) who need simplicity, not process overhead.

---

## 3. Core Features

### 3.1 Task Creation & Management

**Calendar-Based UX (Core Design Principle)**
- Monthly calendar view as the default landing screen
- Each date displays task summary:
  - X New | Y In Progress | Z Completed | W Past Due

**On Clicking a Date**:
- Opens a day-level task view
- Shows detailed list of tasks
- Displays:
  - Task title
  - Status
  - Due indicator

**Personal Mode**:
- Create tasks for self
- Basic task attributes:
  - Title
  - Description
  - Due date
  - Status (New, In Progress, Completed)

**Business Mode**:
- Assign tasks to team members
- Manager view includes:
  - Own tasks
  - Team tasks
- Additional attributes:
  - Assignee
  - Priority
  - Deadline
  - Status (New, In Progress, Completed)

### 3.2 Multi-Day Tasks & Overdue Logic
- Tasks spanning multiple days appear on all relevant dates
- If a task is not completed on the due date:
  - It continues to appear on subsequent days until completed (shown as Past Due)
  - Marked as **Past Due**
  - Visually distinguished from other tasks

### 3.3 Cross-Platform Sync
- Real-time sync across:
  - Web
  - Android
  - iOS
  - Desktop

### 3.4 Notifications & Reminders
- Due date reminders
- Overdue notifications
- Optional daily summary

---

## 4. User Journeys / Flows

### Web
- Monthly calendar → Day view → Task actions

### Android
- Same flow adapted for mobile interaction

### iOS
- Same flow adapted for iOS design guidelines

> Principle: **Consistent experience across all platforms**

---

## 5. Functional Requirements

### Feature-Wise Breakdown
- Monthly calendar UI
- Day-level task detail view (loaded on click)
- Add/Edit/Delete task
- Assign tasks (business only)
- Task status management
- Overdue task handling

### Task Dates (MVP)
- MVP is **date-based** (no due time).
- Due time / reminders are deferred to post-MVP.

### Visibility Rules
- Monthly view: summary only
- Day view: full task details

### Edge Cases
- Deferred to post-happy-path implementation

---

## 6. Non-Functional Requirements

### Performance
- Page load < 2 seconds
- Day view load < 500ms
- Support thousands of tasks per user

### Security
- Secure authentication (OAuth / Token-based)
- Role-based access control (RBAC)
- Data encryption:
  - At rest
  - In transit (HTTPS)

### Scalability
- Horizontally scalable backend
- Support growth from individual users to enterprise teams

### Availability
- Target uptime: 99.9%
- Graceful degradation for non-critical features

---

## 7. Platform Strategy

### Web
- Primary platform for business users

### Android & iOS
- Optimized for daily personal usage
- Native-like experience

### Unified Codebase Approach
- Single shared codebase
- Platform-specific UI adaptations where required
- Shared business logic and APIs

---

## 8. High-Level Architecture (HLD)

### Frontend
- Cross-platform framework (single codebase)
- Calendar-first UI

### Backend
- REST / GraphQL APIs
- Stateless services

### Database
- Relational DB for tasks & users
- Indexed by date and user

### APIs
- Task APIs
- User & Team APIs
- Notification APIs

### Authentication
- Email / OAuth login
- Role-based permissions

---

## 9. MVP Scope vs V1.1

### Must Ship – Day 1 (POC / MVP)
- Monthly calendar UI (core experience)
- Day-level task view on date click
- Personal task creation
- Business task creation (team-based)
- Multi-day tasks
- Overdue task carry-forward logic
- Task status tracking
- Web + Mobile support (single codebase)

### Can Wait – V1.1 (30–60 Days)
- Manager-specific views
- Advanced filters & search
- Task analytics & reports
- Third-party integrations
- AI-driven features

---

## 10. Monetization Strategy

### Free Tier
- Individuals: Unlimited personal tasks
- Business teams: Up to **10 users per company**

### Paid Tier
- $10 / month per company
- Unlocks:
  - More than 10 users
  - Advanced team controls (future)
  - Priority support

---

## 11. High-Level System Architecture (Text-Based)

### Client Layer
- Web App
- Android App
- iOS App

(All share the same core UI and logic)

### API Layer
- Authentication Service
- Task Management Service
- Team & Company Service
- Notification Service

### Backend Services
- Stateless REST APIs
- Role-based access control
- Business logic for task rollover & visibility

### Data Layer
- Primary Database (Tasks, Users, Teams)
- Cache Layer (optional, future)

---

## 12. Recommended Open-Source Tech Stack

### Frontend (Unified Codebase)
**React Native + React Native Web**
- Single codebase for **Android, iOS, and Web**
- Uses **TypeScript / JavaScript**
- Large open-source ecosystem
- Easy integration with modern UI libraries
- Strong developer availability and community support

### Backend (Backend-as-a-Service)
**Supabase**
- Open-source Firebase alternative
- Built on top of PostgreSQL
- Provides:
  - Database
  - Authentication
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Storage (future use)

### Database
**PostgreSQL (via Supabase)**
- Relational, calendar-friendly data modeling
- Excellent support for:
  - Date ranges
  - Indexing by user / team / date
- No separate DB management required

### API & Data Access
- Supabase auto-generated REST APIs
- Supabase client SDKs
- Optional custom API layer (later)

### Authentication
- Supabase Auth
- Email / Password
- OAuth (Google, GitHub – future)
- Role-based access using RLS

### Notifications (Future Phase)
- Supabase Functions / Edge Functions
- External notification services (later)

### Hosting & Deployment
- Frontend: Web hosting (Vercel / Netlify)
- Mobile: Play Store / App Store
- Backend: Supabase managed cloud

---

## 13. Future Enhancements

### AI Features
- Smart task prioritization
- Auto-reschedule overdue tasks
- Task insights based on behavior

### Integrations
- Google Calendar
- Outlook
- Slack / Teams

### Long-Term Monetization
- Tiered business plans
- Enterprise licensing
- Add-on AI features

