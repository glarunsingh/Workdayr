# Workdayr MVP QA Checklist

Use this checklist to verify all features work correctly before release.

## Authentication (Phase 1)

### Sign Up
- [ ] Can create account with email/password
- [ ] Form validation shows errors for invalid inputs
- [ ] Password requirements are enforced (min 6 characters)
- [ ] Redirects to main app after successful signup
- [ ] Error message shown for existing email

### Sign In
- [ ] Can sign in with valid credentials
- [ ] Error message shown for invalid credentials
- [ ] Redirects to main app after successful login
- [ ] Remember session across app restarts

### Sign Out
- [ ] Sign out button works in Settings
- [ ] Confirmation dialog appears
- [ ] Redirects to login screen after sign out
- [ ] Session is properly cleared

### Password Reset
- [ ] Forgot password link works
- [ ] Password reset email is sent
- [ ] Can set new password from email link

## Core Task Management (Phase 2)

### Calendar View
- [ ] Month calendar displays correctly
- [ ] Current day is highlighted
- [ ] Days with tasks show indicator dots
- [ ] Can navigate between months
- [ ] Tapping a day opens day view
- [ ] Week starts on configured day (Sunday/Monday)

### Day View
- [ ] Shows all tasks for selected date
- [ ] Tasks display title, time, priority
- [ ] Can create new task from day view
- [ ] Can navigate to previous/next days

### Task Creation
- [ ] Can create task with title
- [ ] Can set due date using date picker
- [ ] Can set due time using time picker
- [ ] Can set priority (high, medium, low)
- [ ] Can add notes/description
- [ ] Task appears in calendar after creation

### Task Editing
- [ ] Can tap task to open edit view
- [ ] All fields are editable
- [ ] Changes are saved correctly
- [ ] Cancel discards changes

### Task Completion
- [ ] Can toggle task complete/incomplete
- [ ] Completed tasks show visual indicator
- [ ] Completion status persists

### Task Deletion
- [ ] Can delete task
- [ ] Confirmation dialog appears
- [ ] Task is removed from calendar

## Settings (Phase 3)

### Week Start Day
- [ ] Can toggle between Sunday and Monday
- [ ] Calendar updates immediately
- [ ] Setting persists across sessions

### User Profile
- [ ] Displays current user email
- [ ] Shows current mode (personal/business)

## Business Mode (Phase 4)

### Company Creation
- [ ] Can create a company
- [ ] Company name is required
- [ ] User becomes company owner
- [ ] Mode switches to business

### Team Management
- [ ] Can generate invite code
- [ ] Invite code is copyable
- [ ] Can view team members list
- [ ] Owner can see all members

### Join Team
- [ ] Can enter invite code
- [ ] Joins correct company
- [ ] Mode switches to business
- [ ] Added to team members list

### Task Assignment
- [ ] Can assign task to team member
- [ ] Assignee dropdown shows team members
- [ ] Can assign to self
- [ ] Can leave unassigned

### Team Tasks
- [ ] Can view own tasks
- [ ] Can view team tasks
- [ ] Filter by assignee works
- [ ] Real-time updates for team tasks

## Cross-Platform (Phase 5)

### iOS
- [ ] App launches without crash
- [ ] Navigation works correctly
- [ ] Haptic feedback on task toggle
- [ ] Haptic feedback on day selection
- [ ] Tab bar styled correctly
- [ ] Safe areas respected

### Android
- [ ] App launches without crash
- [ ] Navigation works correctly
- [ ] Back button behavior correct
- [ ] Status bar styled correctly
- [ ] Tab bar styled correctly

### Web
- [ ] App loads in browser
- [ ] Responsive layout on desktop
- [ ] Responsive layout on tablet
- [ ] Responsive layout on mobile
- [ ] All navigation works
- [ ] No horizontal scrolling

### Offline Mode
- [ ] Offline banner appears when disconnected
- [ ] Banner hides when connection restored
- [ ] Data syncs after reconnection
- [ ] Failed operations can be retried

### Real-time
- [ ] New tasks appear without refresh
- [ ] Task updates appear without refresh
- [ ] Task deletions sync without refresh
- [ ] Team changes sync in real-time

## Onboarding (Phase 6)

- [ ] New users see onboarding on first launch
- [ ] Can swipe through slides
- [ ] Can skip onboarding
- [ ] "Get Started" completes onboarding
- [ ] Onboarding doesn't show on subsequent launches

## Legal Pages (Phase 6)

- [ ] Terms of Service accessible from Settings
- [ ] Privacy Policy accessible from Settings
- [ ] Both pages display content correctly
- [ ] Back navigation works

## Performance

- [ ] App startup time < 3 seconds
- [ ] Calendar scrolling is smooth
- [ ] Task list scrolling is smooth
- [ ] No memory leaks during extended use
- [ ] Loading skeletons show during data fetch

## Error Handling

- [ ] Network errors show user-friendly message
- [ ] Form validation errors are clear
- [ ] App recovers from errors gracefully
- [ ] Retry option available where appropriate

---

## Test Devices

### iOS
- iPhone (physical): _________________
- iOS version: _________________
- iPad (if supporting tablets): _________________

### Android  
- Device model: _________________
- Android version: _________________

### Web
- Chrome: [ ] Tested
- Safari: [ ] Tested
- Firefox: [ ] Tested
- Edge: [ ] Tested

---

## Sign-off

- [ ] All critical features pass
- [ ] No crash bugs
- [ ] No data loss bugs
- [ ] Performance acceptable
- [ ] Ready for release

**Tested by:** _________________
**Date:** _________________
**Version:** 1.0.0
