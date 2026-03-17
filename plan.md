---
name: Agent-Native UI MVP
overview: "Build a full-stack Agent-Native UI system: a Python FastAPI backend (UI Gateway + in-memory state store + WebSocket broadcaster), a Next.js frontend (realtime renderer with widget registry), and an OpenClaw skill that teaches the agent how to compose and send AUIP messages to control the dashboard."
todos:
  - id: scaffold
    content: "Scaffold monorepo: backend (FastAPI + pyproject.toml), frontend (Next.js + Tailwind + Zustand), skill directory"
    status: completed
  - id: backend-models
    content: Implement Pydantic models for AUIP protocol (envelope, operations, widget, placement)
    status: completed
  - id: backend-state
    content: Implement in-memory state store with patch application logic (add/remove/move/update widget, set_layout)
    status: completed
  - id: backend-routes
    content: "Implement FastAPI routes: POST /auip, POST /event, GET /state, and WebSocket /ws with connection manager"
    status: completed
  - id: frontend-types-store
    content: Define TypeScript types matching AUIP protocol and implement Zustand store with applyPatch logic
    status: completed
  - id: frontend-ws
    content: Implement WebSocket client hook with auto-reconnect and store integration
    status: completed
  - id: frontend-layout
    content: Build 2-column Layout renderer and WidgetRenderer with card container styling
    status: completed
  - id: frontend-widgets
    content: "Build 5 widget components: NewsWidget, WeatherWidget, CryptoWidget, TodoWidget, TextWidget"
    status: completed
  - id: frontend-events
    content: Wire UI events (widget removal, todo toggle) to POST /event on backend
    status: completed
  - id: skill
    content: Write OpenClaw SKILL.md with AUIP protocol reference, widget catalog, and curl examples
    status: completed
  - id: integration-test
    content: "End-to-end test: send AUIP via curl, verify dashboard updates in browser"
    status: in_progress
isProject: false
---

# Agent-Native UI System MVP

## Architecture

```mermaid
flowchart TB
    subgraph openclaw [OpenClaw Agent]
        Skill["claw-ui skill\n(SKILL.md)"]
    end

    subgraph backend [Python Backend - FastAPI]
        Gateway["UI Gateway\n(POST /auip)"]
        StateStore["In-Memory State Store"]
        WSServer["WebSocket Server\n(/ws)"]
        Gateway --> StateStore
        StateStore --> WSServer
    end

    subgraph frontend [Next.js Frontend]
        WSClient["WebSocket Client"]
        ZustandStore["Zustand Store"]
        LayoutRenderer["Layout Renderer\n(2-column grid)"]
        WidgetRegistry["Widget Registry"]
        WSClient --> ZustandStore
        ZustandStore --> LayoutRenderer
        LayoutRenderer --> WidgetRegistry
    end

    Skill -->|"HTTP POST\nAUIP messages\n(curl/fetch)"| Gateway
    WSServer -->|"WebSocket\nstate patches"| WSClient
    frontend -->|"ui_event\n(POST /event)"| Gateway
```



## Repository Structure

```
claw-ui/
  backend/                    # Python FastAPI server
    pyproject.toml
    app/
      main.py                 # FastAPI app, CORS, mount routes
      state.py                # In-memory UIState model + patch logic
      models.py               # Pydantic models for AUIP protocol
      routes/
        auip.py               # POST /auip - receive AUIP messages
        events.py             # POST /event - receive UI events
      ws/
        manager.py            # WebSocket connection manager + broadcast
  frontend/                   # Next.js app
    package.json
    next.config.js
    tailwind.config.ts
    app/
      layout.tsx
      page.tsx                # Main dashboard page
    lib/
      store.ts                # Zustand store (applyPatch, state)
      ws.ts                   # WebSocket client hook
      types.ts                # TypeScript types matching AUIP protocol
    components/
      Layout.tsx              # 2-column layout renderer
      WidgetRenderer.tsx      # Dynamic widget dispatcher
      widgets/
        NewsWidget.tsx         # feed:news
        WeatherWidget.tsx      # info:weather
        CryptoWidget.tsx       # finance:crypto
        TodoWidget.tsx         # productivity:todo
        TextWidget.tsx         # content:text
  skill/                      # OpenClaw skill
    SKILL.md                  # Teaches agent AUIP protocol
```

## 1. Backend (Python FastAPI)

### State Model (`app/state.py`)

In-memory singleton matching the spec's UI state model:

```python
state = {
    "views": {
        "main": {
            "layout": {
                "columns": [
                    {"id": "col_1", "widget_ids": []},
                    {"id": "col_2", "widget_ids": []}
                ]
            }
        }
    },
    "widgets": {}
}
```

### AUIP Protocol Models (`app/models.py`)

Pydantic models for the envelope + all operations:

- Envelope: `protocol_version`, `type` (set_ui | patch_ui), `target.view_id`, `payload`
- Operations: `add_widget`, `remove_widget`, `move_widget`, `update_widget`, `set_layout`
- Widget: `id`, `kind`, `variant`, `title`, `config`
- Placement: `column_id`, `position`

### Endpoints

- `POST /auip` - Receives AUIP messages from OpenClaw, validates, applies to state, broadcasts delta via WebSocket
- `POST /event` - Receives UI events from the frontend (e.g., widget_removed by user)
- `GET /state` - Returns current full state (for initial frontend load)
- `WebSocket /ws` - Persistent connection for the frontend; sends `patch_ui` and `set_ui` messages

### Validation

- Reject unknown widget kinds
- Reject operations on non-existent widgets (for update/move/remove)
- Prevent duplicate widget IDs
- Limit patch size (max 20 operations per message)

## 2. Frontend (Next.js + React + Zustand + Tailwind)

### Zustand Store (`lib/store.ts`)

```typescript
interface UIState {
    views: Record<string, View>;
    widgets: Record<string, Widget>;
    applyPatch: (patch: PatchPayload) => void;
    setState: (state: UIStateData) => void;
}
```

### WebSocket Hook (`lib/ws.ts`)

- Connects to `ws://localhost:8000/ws` on mount
- Receives `patch_ui` and `set_ui` messages
- Calls `applyPatch` or `setState` on the Zustand store
- Auto-reconnect with exponential backoff

### Layout Renderer (`components/Layout.tsx`)

- Reads columns from `state.views.main.layout.columns`
- 2-column CSS Grid (responsive: 1 column on mobile)
- Maps `widget_ids` to `WidgetRenderer` components

### Widget Registry + Renderer

Registry maps `kind:variant` to React components:

- `feed:news` -> NewsWidget (shows title + list of items from config)
- `info:weather` -> WeatherWidget (shows location + temp/conditions)
- `finance:crypto` -> CryptoWidget (shows coin prices table)
- `productivity:todo` -> TodoWidget (shows checklist with toggle)
- `content:text` -> TextWidget (shows markdown/text block)

Each widget gets a card-style container with title bar, consistent styling via Tailwind.

### UI Events

When the user interacts (e.g., removes a widget, toggles a todo), send a `ui_event` POST to the backend so the agent can be notified.

## 3. OpenClaw Skill (`skill/SKILL.md`)

The skill teaches OpenClaw how to control the dashboard. It will:

- Describe the AUIP protocol (message format, operations)
- List available widget kinds and their configs
- Provide example `curl` commands the agent can execute via `bash` tool
- Explain the backend URL (configurable via skill config/env)

Example skill instruction to the agent:

```
To add a news widget:
bash curl -X POST http://localhost:8000/auip -H "Content-Type: application/json" -d '{
  "protocol_version": "1.0",
  "type": "patch_ui",
  "target": {"view_id": "main"},
  "payload": {
    "operations": [{
      "op": "add_widget",
      "widget": {"id": "w_news", "kind": "feed", "variant": "news", "title": "AI News", "config": {"items": [...]}},
      "placement": {"column_id": "col_1", "position": 0}
    }]
  }
}'
```

Skill metadata will require `CLAW_UI_URL` env var and declare itself in the `metadata.openclaw.requires.env` field.

## 4. Development Setup

- Backend: `uv` or `pip` for Python deps, `uvicorn` to run FastAPI (port 8000)
- Frontend: `pnpm` for Next.js deps, `next dev` (port 3000)
- Backend CORS configured to allow `localhost:3000`
- Single `docker-compose.yml` for running both together (optional, future)

## Key Design Decisions

- **No LLM subagent in the gateway** -- OpenClaw IS the LLM. The skill teaches it the protocol directly, so it constructs AUIP messages itself. This eliminates an intermediate LLM call and keeps the system simpler.
- **HTTP POST for AUIP input** (not WebSocket) -- simpler for the agent to call via `curl`/`bash` tool. WebSocket is used only for the frontend subscription.
- **In-memory state** for MVP -- fast and simple. The state resets on server restart. Redis/DB is a documented future path.
- **Widget configs carry display data** -- for MVP, the agent populates widget data (news items, weather info, etc.) directly in the config. No external API fetching in widgets themselves.
