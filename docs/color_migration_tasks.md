# Color Migration — Micro Task List

> **Reference:** [docs/design_system_colors.md](design_system_colors.md)  
> **Total hardcoded hex occurrences:** ~297 across 27 files  
> **Status:** Not started

---

## Phase 1: Update Theme Source Files (Foundation)

These define the token values — everything else depends on them.

| # | Task | File | Occurrences | Status |
|---|------|------|-------------|--------|
| 1.1 | Update `Colors.ts` — replace all hex values with new palette | `constants/Colors.ts` | 8 | ⬜ |
| 1.2 | Update `theme.ts` — replace all `appColors` light/dark values, add `primaryHover` token | `lib/theme.ts` | 26 | ⬜ |

**After Phase 1:** All components already using `useAppTheme()` will automatically pick up new colors.

---

## Phase 2: Fix Residual Hardcoded Hex in Themed Components

These files already use `useAppTheme()` but have leftover hardcoded values.

| # | Task | File | Hardcoded Count | Status |
|---|------|------|-----------------|--------|
| 2.1 | Replace `#fff` with `colors.surface` | `components/calendar/CalendarDay.tsx` | 1 | ⬜ |
| 2.2 | Replace priority color map + `#000`/`#fff` with theme tokens | `components/tasks/TaskCard.tsx` | 6 | ⬜ |
| 2.3 | Replace `#666`/`#999` with theme tokens | `components/tasks/TaskList.tsx` | 3 | ⬜ |
| 2.4 | Replace `#000` shadow with theme token | `app/(tabs)/index.tsx` | 1 | ⬜ |
| 2.5 | Replace `#000` shadow with theme token | `app/day/[date].tsx` | 1 | ⬜ |

---

## Phase 3: Migrate Standalone Components (No current theme usage)

These need `useAppTheme()` added + all hex replaced.

| # | Task | File | Hardcoded Count | Status |
|---|------|------|-----------------|--------|
| 3.1 | Migrate `Skeleton.tsx` — add theme, replace `#e0e0e0`/`#fff` | `components/Skeleton.tsx` | 2 | ⬜ |
| 3.2 | Migrate `OfflineBanner.tsx` — replace `#FF9500`/`#FF3B30`/`#fff` with theme tokens | `components/OfflineBanner.tsx` | 4 | ⬜ |
| 3.3 | Migrate `ResponsiveLayout.tsx` — replace `#f5f5f5` | `components/ResponsiveLayout.tsx` | 1 | ⬜ |
| 3.4 | Migrate `CalendarGrid.tsx` — add theme, replace `#fff`/`#8E8E93`/`#E5E5EA` | `components/calendar/CalendarGrid.tsx` | 5 | ⬜ |
| 3.5 | Migrate `MonthCalendar.tsx` — add theme, replace `#000`/`#fff` | `components/calendar/MonthCalendar.tsx` | 2 | ⬜ |
| 3.6 | Migrate `ErrorBoundary.tsx` — add theme, replace 10 unique colors | `components/ErrorBoundary.tsx` | 20 | ⬜ |

---

## Phase 4: Migrate Auth Screens

All auth screens are fully hardcoded, no theme usage.

| # | Task | File | Hardcoded Count | Status |
|---|------|------|-----------------|--------|
| 4.1 | Migrate `login.tsx` — add theme, replace all 11 unique colors | `app/(auth)/login.tsx` | 24 | ⬜ |
| 4.2 | Migrate `signup.tsx` — add theme, replace all 10 unique colors | `app/(auth)/signup.tsx` | 26 | ⬜ |
| 4.3 | Migrate `forgot-password.tsx` — add theme, replace all 10 unique colors | `app/(auth)/forgot-password.tsx` | 23 | ⬜ |

---

## Phase 5: Migrate Branding & Onboarding

| # | Task | File | Hardcoded Count | Status |
|---|------|------|-----------------|--------|
| 5.1 | Update `BrandingPanel.tsx` — replace all 11 unique colors with palette values (keep hardcoded, no theme hook needed — decorative) | `components/BrandingPanel.tsx` | 21 | ⬜ |
| 5.2 | Migrate `onboarding.tsx` — add theme, replace `#007AFF`/`#fff`/`#333`/`#666`/`#ddd` + semantic colors | `app/onboarding.tsx` | 13 | ⬜ |

---

## Phase 6: Migrate Main Tab Screens (Largest effort)

| # | Task | File | Hardcoded Count | Status |
|---|------|------|-----------------|--------|
| 6.1 | Migrate `settings.tsx` — add theme, replace 12 unique colors | `app/(tabs)/settings.tsx` | 33 | ⬜ |
| 6.2 | Migrate `business.tsx` — add theme, replace 18 unique colors (**biggest file**) | `app/(tabs)/business.tsx` | 86 | ⬜ |

---

## Phase 7: Migrate Remaining Screens

| # | Task | File | Hardcoded Count | Status |
|---|------|------|-----------------|--------|
| 7.1 | Migrate `task/[id].tsx` — add theme, replace `#f5f5f5`/`#007AFF`/`#FF3B30` | `app/task/[id].tsx` | 4 | ⬜ |
| 7.2 | Migrate `task/new.tsx` — add theme, replace `#f5f5f5` | `app/task/new.tsx` | 1 | ⬜ |
| 7.3 | Migrate `legal/privacy.tsx` — add theme, replace 5 unique colors | `app/legal/privacy.tsx` | 6 | ⬜ |
| 7.4 | Migrate `legal/terms.tsx` — add theme, replace 5 unique colors | `app/legal/terms.tsx` | 5 | ⬜ |
| 7.5 | Migrate `+not-found.tsx` — replace `#007AFF` | `app/+not-found.tsx` | 1 | ⬜ |

---

## Phase 8: Config & Misc Files

| # | Task | File | Hardcoded Count | Status |
|---|------|------|-----------------|--------|
| 8.1 | Update `+html.tsx` — replace `#fff`/`#000` in CSS `<style>` tag | `app/+html.tsx` | 2 | ⬜ |
| 8.2 | Update `app.json` — replace `#ffffff` splash/background colors | `app/app.json` | 2 | ⬜ |
| 8.3 | Update `_layout.tsx` — replace `#007AFF`/`#f5f5f5` | `app/_layout.tsx` | 2 | ⬜ |

---

## Phase 9: Verification

| # | Task | Status |
|---|------|--------|
| 9.1 | Global search for any remaining pure `#000000`, `#000`, `#FFFFFF`, `#fff`, `#FFF` — ensure zero matches (excluding semantic colors) | ⬜ |
| 9.2 | Global search for `#007AFF` — should only remain in `theme.ts` as `info` token | ⬜ |
| 9.3 | Visual spot-check: Light theme renders correctly | ⬜ |
| 9.4 | Visual spot-check: Dark theme renders correctly | ⬜ |

---

## Summary by Phase

| Phase | Files | Hex to Replace | Complexity |
|-------|-------|----------------|------------|
| 1. Theme sources | 2 | 34 | Low |
| 2. Themed components (residuals) | 5 | 12 | Low |
| 3. Standalone components | 6 | 34 | Medium |
| 4. Auth screens | 3 | 73 | Medium |
| 5. Branding & onboarding | 2 | 34 | Medium |
| 6. Main tab screens | 2 | 119 | **High** |
| 7. Remaining screens | 5 | 17 | Low |
| 8. Config & misc | 3 | 6 | Low |
| 9. Verification | — | — | Low |
| **Total** | **28 files** | **~297** | |
