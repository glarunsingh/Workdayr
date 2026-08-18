# Workdayr Design System — Color Palette

> **Version:** 1.0  
> **Date:** 15 February 2026  
> **Principle:** Minimalist grayscale — no pure black, no pure white.

---

## 1. Base Palette

All UI colors are drawn from this single 9-step neutral gray ramp:

| Step | Hex       | Role Summary                              |
|------|-----------|-------------------------------------------|
| 1    | `#F8F9FA` | Lightest — surfaces, on-primary text       |
| 2    | `#E9ECEF` | Light — page background (light mode)       |
| 3    | `#DEE2E6` | Light-mid — muted/disabled surfaces        |
| 4    | `#CED4DA` | Mid-light — borders, taglines             |
| 5    | `#ADB5BD` | Mid — subtle text, shadows, subtitles      |
| 6    | `#6C757D` | Mid-dark — captions, hint text             |
| 7    | `#495057` | Dark — muted text, dark borders            |
| 8    | `#343A40` | Darker — hover states, dark surfaces       |
| 9    | `#212529` | Darkest — primary actions, headings, bg    |

---

## 2. Light Theme Tokens

| Token            | Hex       | Palette Step | Usage                                    |
|------------------|-----------|--------------|------------------------------------------|
| `background`     | `#E9ECEF` | 2            | Page/screen canvas                       |
| `surface`        | `#F8F9FA` | 1            | Cards, modals, inputs                    |
| `surfaceMuted`   | `#DEE2E6` | 3            | Disabled areas, inactive surfaces        |
| `primary`        | `#212529` | 9            | Buttons, links, active tab icons         |
| `primaryHover`   | `#343A40` | 8            | Hover/pressed state on primary elements  |
| `text`           | `#212529` | 9            | Headings, body text                      |
| `textMuted`      | `#495057` | 7            | Secondary labels, descriptions           |
| `textSubtle`     | `#6C757D` | 6            | Hints, captions, placeholders            |
| `border`         | `#CED4DA` | 4            | Dividers, input outlines, separators     |
| `onPrimary`      | `#F8F9FA` | 1            | Text/icons on dark primary buttons       |
| `shadow`         | `#ADB5BD` | 5            | Soft shadow color                        |

### WCAG Contrast Ratios (Light Theme)

| Pair                          | Ratio  | Level   |
|-------------------------------|--------|---------|
| `text` on `surface`           | 15.4:1 | AAA     |
| `text` on `background`        | 13.4:1 | AAA     |
| `textMuted` on `surface`      | 8.5:1  | AAA     |
| `textSubtle` on `surface`     | 4.68:1 | AA      |
| `onPrimary` on `primary`      | 15.4:1 | AAA     |

---

## 3. Dark Theme Tokens

| Token            | Hex       | Palette Step | Usage                                    |
|------------------|-----------|--------------|------------------------------------------|
| `background`     | `#212529` | 9            | Page/screen canvas                       |
| `surface`        | `#343A40` | 8            | Cards, modals, inputs                    |
| `surfaceMuted`   | `#495057` | 7            | Disabled areas, inactive surfaces        |
| `primary`        | `#F8F9FA` | 1            | Buttons, links, active tab icons         |
| `primaryHover`   | `#E9ECEF` | 2            | Hover/pressed state on primary elements  |
| `text`           | `#F8F9FA` | 1            | Headings, body text                      |
| `textMuted`      | `#CED4DA` | 4            | Secondary labels, descriptions           |
| `textSubtle`     | `#ADB5BD` | 5            | Hints, captions, placeholders            |
| `border`         | `#495057` | 7            | Dividers, input outlines, separators     |
| `onPrimary`      | `#212529` | 9            | Text/icons on light primary buttons      |
| `shadow`         | `#212529` | 9            | Shadow blends with background            |

### WCAG Contrast Ratios (Dark Theme)

| Pair                          | Ratio  | Level   |
|-------------------------------|--------|---------|
| `text` on `surface`           | 10.1:1 | AAA     |
| `text` on `background`        | 15.4:1 | AAA     |
| `textMuted` on `surface`      | 6.3:1  | AAA     |
| `textSubtle` on `surface`     | 4.22:1 | AA      |
| `onPrimary` on `primary`      | 15.4:1 | AAA     |

---

## 4. Semantic Colors (Theme-Independent)

These convey functional meaning and remain the same in both themes:

| Token      | Hex       | Usage                                 |
|------------|-----------|---------------------------------------|
| `danger`   | `#FF3B30` | Destructive actions, errors, delete   |
| `success`  | `#34C759` | Completions, confirmations            |
| `warning`  | `#FF9500` | Caution states, warnings              |
| `info`     | `#007AFF` | Informational badges (optional use)   |
| `onDanger` | `#F8F9FA` | Text on danger backgrounds            |
| `onSuccess`| `#F8F9FA` | Text on success backgrounds           |

---

## 5. Branding (BrandingPanel & Auth Screens)

| Element              | Old Hex   | New Hex   | Palette Step |
|----------------------|-----------|-----------|--------------|
| Panel background     | `#111111` | `#212529` | 9            |
| Wordmark text        | `#FFFFFF` | `#F8F9FA` | 1            |
| Subtitle text        | `#888888` | `#ADB5BD` | 5            |
| Tagline text         | `#CCCCCC` | `#CED4DA` | 4            |
| Mountain ridge 1     | `#1A1A1A` | `#343A40` | 8            |
| Mountain ridge 2     | `#3E3E3E` | `#495057` | 7            |
| Mountain ridge 3     | `#6A6A6A` | `#6C757D` | 6            |
| Mountain ridge 4     | `#9A9A9A` | `#ADB5BD` | 5            |
| Mountain ridge 5     | `#C8C8C8` | `#CED4DA` | 4            |
| Auth button bg       | `#111111` | `#212529` | 9            |
| Auth button text     | `#FFFFFF` | `#F8F9FA` | 1            |

---

## 6. Migration Map (Old → New)

Quick reference for all hex values being replaced:

| Old Value   | New Value   | Token(s)                              |
|-------------|-------------|---------------------------------------|
| `#000` / `#000000` | `#212529` | text (light), background (dark), shadow (dark) |
| `#111111`   | `#212529`   | text (light), branding bg             |
| `#FFFFFF` / `#fff` | `#F8F9FA` | surface (light), text (dark), onPrimary |
| `#F5F5F7`   | `#E9ECEF`   | background (light)                    |
| `#F2F2F7`   | `#DEE2E6`   | surfaceMuted (light)                  |
| `#f5f5f5` / `#FAFAFA` | `#E9ECEF` | background (light)               |
| `#666666`   | `#495057`   | textMuted (light)                     |
| `#999999` / `#999` | `#6C757D` | textSubtle (light)               |
| `#E5E5EA`   | `#CED4DA`   | border (light)                        |
| `#E0E0E0` / `#e0e0e0` | `#CED4DA` | border (light)                  |
| `#1C1C1E`   | `#343A40`   | surface (dark)                        |
| `#2C2C2E`   | `#495057`   | surfaceMuted (dark)                   |
| `#C7C7CC`   | `#CED4DA`   | textMuted (dark)                      |
| `#8E8E93`   | `#ADB5BD`   | textSubtle (dark)                     |
| `#38383A`   | `#495057`   | border (dark)                         |
| `#333`      | `#343A40`   | dark text in hardcoded screens        |
| `#666`      | `#495057`   | muted text in hardcoded screens       |
| `#ddd`      | `#CED4DA`   | borders in hardcoded screens          |
| `#eee` / `#f0f0f0` | `#DEE2E6` | separators, inactive backgrounds |
| `#ccc`      | `#CED4DA`   | muted icons/borders                   |
| `#888888`   | `#ADB5BD`   | branding subtitle                     |
| `#CCCCCC`   | `#CED4DA`   | branding tagline                      |

---

## 7. Design Tokens (Unchanged)

### Spacing

| Token | Value |
|-------|-------|
| `xs`  | 4px   |
| `sm`  | 8px   |
| `md`  | 12px  |
| `lg`  | 16px  |
| `xl`  | 24px  |
| `2xl` | 32px  |

### Border Radius

| Token  | Value |
|--------|-------|
| `sm`   | 8px   |
| `md`   | 12px  |
| `lg`   | 16px  |
| `pill` | 999px |

### Typography (Font Sizes)

| Token     | Value |
|-----------|-------|
| `title`   | 20px  |
| `h2`      | 18px  |
| `body`    | 16px  |
| `subtext` | 14px  |
| `caption` | 12px  |

---

## 8. Implementation Notes

- **No pure `#000000` or `#FFFFFF`** should appear anywhere in the codebase after migration.
- All hardcoded hex values must be replaced with `useAppTheme()` color tokens where possible.
- Semantic colors (`danger`, `success`, `warning`) remain as-is — they serve functional roles.
- The `info` color (`#007AFF`) is retained only for informational badges; it is no longer the primary accent.
- BrandingPanel can remain hardcoded (it's a decorative fixed element) but must use palette values.
