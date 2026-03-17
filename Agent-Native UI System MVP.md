# 🧠 Agent-Native UI Runtime (AUIP + Realtime Renderer + LLM Subagents)

---

# 1. 📌 Product Definition

## 1.1 Problem

Current agent systems (e.g., OpenClaw) interact via:

* Chat interfaces (Telegram / Discord)
* Text / logs

Limitations:

* No persistent UI state
* No visual structure of agent reasoning
* No evolving interface
* Poor daily usability

---

## 1.2 Vision

> Enable OpenClaw to **express itself through a continuously evolving UI**, not just text.

---

## 1.3 Core Idea

We introduce a new layer:

```text
User Intent
   ↓
OpenClaw Agent
   ↓
AUIP (Agent UI Protocol)
   ↓
LLM Subagent (Renderer Adapter)
   ↓
Realtime UI Renderer
   ↓
Dynamic UI
```

---

## 1.4 Key Principles

* UI is **agent-driven**
* UI is **stateful and persistent**
* UI evolves via **incremental patches**
* Protocol is **stable**
* Renderer is **replaceable**

---

# 2. 🎯 MVP Scope

## 2.1 Goal

> Build a system where OpenClaw can create and modify a UI in real time.

---

## 2.2 MVP Features

### Must Have

* Create dashboard
* Add widget
* Remove widget
* Move widget
* Update widget
* Realtime UI updates

---

### Widgets

* News (RSS / AI summary)
* Weather
* Crypto
* Todo
* Text block

---

### UI Layout

* Column-based layout (2 columns)

---

### Communication

* WebSocket (preferred)
* or SSE

---

## 2.3 Non-Goals

* Drag-and-drop UI editor
* AI learning behavior
* Marketplace
* Multi-user collaboration

---

# 3. 🧩 System Architecture

```text
                ┌────────────────────┐
                │      User          │
                └────────┬───────────┘
                         ↓
                ┌────────────────────┐
                │  OpenClaw Agent    │
                └────────┬───────────┘
                         ↓
                ┌────────────────────┐
                │      AUIP          │
                └────────┬───────────┘
                         ↓
                ┌────────────────────┐
                │  LLM Subagent      │
                │ (Renderer Adapter) │
                └────────┬───────────┘
                         ↓
                ┌────────────────────┐
                │   UI Gateway       │
                └────────┬───────────┘
                         ↓
                ┌────────────────────┐
                │   State Store      │
                └────────┬───────────┘
                         ↓
                ┌────────────────────┐
                │ Realtime Renderer  │
                └────────────────────┘
```

---

# 4. 🔥 AUIP (Agent UI Protocol)

## 4.1 Purpose

AUIP describes:

* WHAT should change
* NOT how to render it

---

## 4.2 Message Envelope

```json
{
  "protocol_version": "1.0",
  "type": "patch_ui",
  "target": {
    "view_id": "main"
  },
  "payload": {}
}
```

---

## 4.3 set_ui (Full UI)

```json
{
  "type": "set_ui",
  "payload": {
    "state": { ... }
  }
}
```

---

## 4.4 patch_ui (Incremental)

```json
{
  "type": "patch_ui",
  "payload": {
    "operations": []
  }
}
```

---

## 4.5 Operations

### add_widget

```json
{
  "op": "add_widget",
  "widget": {
    "id": "w_news",
    "kind": "feed",
    "variant": "news",
    "title": "AI News",
    "config": {}
  },
  "placement": {
    "column_id": "col_1",
    "position": 0
  }
}
```

---

### remove_widget

```json
{
  "op": "remove_widget",
  "widget_id": "w_news"
}
```

---

### move_widget

```json
{
  "op": "move_widget",
  "widget_id": "w_news",
  "placement": {
    "column_id": "col_2",
    "position": 1
  }
}
```

---

### update_widget

```json
{
  "op": "update_widget",
  "widget_id": "w_news",
  "changes": {
    "title": "Top AI News"
  }
}
```

---

### set_layout

```json
{
  "op": "set_layout",
  "layout": { ... }
}
```

---

# 5. 🧠 UI State Model

```json
{
  "views": {
    "main": {
      "layout": {
        "columns": [
          { "id": "col_1", "widget_ids": [] },
          { "id": "col_2", "widget_ids": [] }
        ]
      }
    }
  },
  "widgets": {}
}
```

---

## Principles

* State = source of truth
* Renderer = pure function of state

---

# 6. 🤖 LLM Subagent (Renderer Adapter)

## 6.1 Role

* Convert AUIP → renderer-specific patch
* Understand widget mapping
* Decide placement

---

## 6.2 Input

```json
{
  "auip": {},
  "state": {},
  "renderer_schema": {}
}
```

---

## 6.3 Output (Renderer Patch)

```json
{
  "type": "renderer_patch",
  "operations": [
    {
      "op": "add_widget",
      "widget": {
        "id": "w_news",
        "component": "NewsWidget"
      }
    }
  ]
}
```

---

## 6.4 Rules

* Must preserve state consistency
* Must not delete unrelated widgets
* Must use valid widget types

---

# 7. ⚙️ UI Gateway

## Responsibilities

* Receive AUIP
* Call subagent
* Validate output
* Update state
* Broadcast updates

---

# 8. 🧠 State Store

## Options

* In-memory (MVP)
* Redis (next)
* DB (future)

---

# 9. 🖥 Realtime UI Renderer

## Tech Stack

* Next.js
* React
* TypeScript
* Zustand (state)
* Tailwind CSS

---

## State Hook

```ts
const useUIStore = create((set) => ({
  state: {},
  applyPatch: (patch) => set(...)
}))
```

---

## Layout Renderer

```tsx
function Layout({ columns }) {
  return columns.map(col => (
    <Column key={col.id}>
      {col.widget_ids.map(id => (
        <WidgetRenderer key={id} id={id} />
      ))}
    </Column>
  ))
}
```

---

## Widget Registry

```ts
const registry = {
  "feed:news": NewsWidget,
  "info:weather": WeatherWidget,
  "finance:crypto": CryptoWidget,
  "productivity:todo": TodoWidget
}
```

---

## Widget Renderer

```tsx
function WidgetRenderer({ id }) {
  const widget = useUIStore(s => s.state.widgets[id])
  const key = `${widget.kind}:${widget.variant}`
  const Comp = registry[key]
  return <Comp {...widget} />
}
```

---

# 10. 🔄 Realtime Sync

## WebSocket Message

```json
{
  "type": "patch_ui",
  "payload": { ... }
}
```

---

## Flow

```text
Server → WebSocket → Client → applyPatch → UI updates
```

---

# 11. 🔁 UI Events → Agent

```json
{
  "type": "ui_event",
  "payload": {
    "event": "widget_removed",
    "widget_id": "w_news"
  }
}
```

---

# 12. ⚠️ Safety

* Validate all patches
* Reject invalid widget types
* Prevent layout corruption
* Limit patch size

---

# 13. 🚀 Future Extensions

* Multi-view support
* Mobile UI
* Animation / transitions
* Behavior learning
* Plugin system

---

# 14. 🧠 Key Insight

> This is NOT a dashboard system.

It is:

> 🔥 **Agent UI Runtime + Protocol + Renderer System**

---

# 15. ✅ MVP Checklist

* [ ] AUIP implemented
* [ ] Subagent working
* [ ] WebSocket live updates
* [ ] Renderer renders widgets
* [ ] State updates correctly
* [ ] UI events captured

---

# 🎯 FINAL

> “An agent that builds and evolves a visual interface in real time.”
