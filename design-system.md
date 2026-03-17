# 🎨 OpenClaw Design System (Agent-Native UI)

---

# 1. 🧠 Design Philosophy

## 1.1 Core Idea

> This website is a **display surface for whatever OpenClaw decides to show**.
> The UI frame should stay quiet so the content stays in focus.

---

## 1.2 Principles

### 1. Stable but Alive

* UI should evolve
* But not jump unpredictably

---

### 2. Content First

* Information > controls
* Cards > panels
* Minimal chrome
* Static labels should be minimized

---

### 3. Glanceable + Deep

* Widget → glance
* Web → deep interaction

---

### 4. Agent Presence

UI must always answer:

> ❓ What is the agent doing right now?

But this answer should appear as a **small lightweight status popup**, not a hero block.

---

### 5. Minimize Hardcoded UI

* Avoid decorative summaries that repeat what widgets already show
* Avoid static counters, helper chips, and placeholder metadata unless needed
* Prefer rendering agent-provided content over product copy
* If a hardcoded element does not help understanding or control, remove it

---

# 2. 🎨 Color System

## 2.1 Primary Palette (Coral System)

```css
--coral-bright: #ff4d4d;
--coral-mid:    #e63946;
--coral-dark:   #991b1b;
```

---

## 2.2 Semantic Mapping

| Role             | Color        |
| ---------------- | ------------ |
| Primary Action   | coral-bright |
| Accent / Active  | coral-mid    |
| Critical / Alert | coral-dark   |

---

## 2.3 Neutral Palette

```css
--bg-primary:   #0f0f10;
--bg-secondary: #1a1a1d;
--bg-tertiary:  #232326;

--text-primary:   #ffffff;
--text-secondary: #b0b0b5;
--text-muted:     #6b6b70;

--border: #2a2a2e;
```

---

## 2.4 Usage Rules

* Coral ONLY used for:

  * actions
  * highlights
  * agent activity

❗ Never use coral as full background.

---

# 3. 🔤 Typography

## 3.1 Font Stack

```text
Primary: Inter / SF Pro
Mono: JetBrains Mono
```

---

## 3.2 Scale

| Level | Size | Usage        |
| ----- | ---- | ------------ |
| H1    | 24px | Page title   |
| H2    | 18px | Widget title |
| Body  | 14px | Content      |
| Small | 12px | Metadata     |

---

## 3.3 Rules

* No bold overload
* Use spacing instead of weight

---

# 4. 🧱 Layout System

---

## 4.1 Grid

* 2-column default
* Max 3-column
* Responsive collapse → 1 column (mobile)

---

## 4.2 Spacing

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
```

---

## 4.3 Card Rules

* Border radius: 12px
* Padding: 16px
* Gap between cards: 16px

---

# 5. 🧩 Core Components

---

# 5.1 Agent Status Popup (CRITICAL)

## Purpose

> Shows what OpenClaw is doing in real time

---

## Structure

```text
[🧠 OpenClaw]  STATUS
error text only when needed
```

---

## States

| State    | Color        |
| -------- | ------------ |
| idle     | text-muted   |
| thinking | coral-mid    |
| updating | coral-bright |
| error    | coral-dark   |

---

## Rules

* Keep it compact
* Float above content or sit unobtrusively in a corner
* Default to one-line status
* Show extra text only for errors or important transient work
* Never dominate the page

---

# 5.2 Widget Card

## Structure

```text
┌────────────────────┐
│ Title              │
├────────────────────┤
│ Content            │
│                    │
├────────────────────┤
│ Actions            │
└────────────────────┘
```

---

## Style

* Background: bg-secondary
* Border: 1px solid border
* Radius: 12px
* Header should be minimal
* Only one remove control per card

---

## Interaction

Hover:

* slight lift
* border highlight

---

# 5.3 Widget Types

---

## News Widget

```text
AI News
- OpenAI launches...
- Apple releases...
```

---

## Weather Widget

```text
Shanghai
24°C ☀️
H: 28 / L: 20
```

---

## Crypto Widget

```text
BTC  $65,200  +2.1%
ETH  $3,200   -1.2%
```

---

## Todo Widget

```text
☐ Finish report
☑ Review notes
```

---

## AI Summary Widget

```text
Today summary:
- You have 2 tasks pending
- Market is up
```

---

# 5.4 Widget Actions

Icons only:

* ❌ remove
* Avoid duplicate actions in multiple places inside one card

---

# 6. 🧠 Motion System

---

## 6.1 Principles

* Smooth
* Minimal
* Predictable

---

## 6.2 Animations

| Type     | Use Case   |
| -------- | ---------- |
| fade-in  | new widget |
| slide-up | insertion  |
| move     | reorder    |

---

## 6.3 Duration

* 150–250ms
* ease-in-out

---

# 7. 🧩 Realtime Behavior

---

## 7.1 Progressive Rendering

```text
Step 1: empty
Step 2: widget appears
Step 3: layout adjusts
```

---

## 7.2 Partial Updates

❗ Only update changed parts
Never re-render whole page

---

# 8. 📱 Widget (iOS) Design

---

## 8.1 Principles

* Glanceable
* Minimal text
* Max 3–4 items

---

## 8.2 Medium Widget Layout

```text
OpenClaw

1. AI News...
2. Todo: finish draft
3. Weather: 24°C

[Open] [Refresh]
```

---

## 8.3 Colors

* Dark background
* Coral only for highlights

---

# 9. 🧠 Interaction Design

---

## 9.1 User Control

* remove widget
* pin widget
* feedback

---

## 9.2 Agent Control

* reorder
* add
* update

---

## Rule

> User overrides agent

---

# 10. 🎯 UX Rules (CRITICAL)

---

## 10.1 Do NOT

* randomly reorder UI
* flood user with widgets
* change layout too often
* add decorative static sections that compete with content
* repeat information in both page chrome and widget cards

---

## 10.2 DO

* evolve gradually
* respect user pins
* keep mental model stable
* let the content area dominate the page
* keep website chrome quiet and minimal

---

# 11. 🔧 Component Naming (for dev)

---

## Layout

* AppLayout
* ColumnLayout

---

## Core

* AgentStatusBar
* WidgetCard
* WidgetRenderer

---

## Widgets

* NewsWidget
* WeatherWidget
* CryptoWidget
* TodoWidget
* SummaryWidget

---

# 12. 🎯 Design Summary

---

## This system is:

* calm
* minimal
* intelligent
* adaptive

---

## This system is NOT:

* flashy
* noisy
* over-animated
* control-heavy

---

# 🔥 FINAL

> “The UI should feel like an intelligent system quietly organizing your world.”
