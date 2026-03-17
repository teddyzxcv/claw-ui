---
name: claw-ui
description: Use this skill when OpenClaw needs to control its dashboard UI through the AUIP backend protocol, especially to inspect state, send `POST /auip` patches, and rely on `GET /apply-change` for HTTP-based sync.
---

# Claw UI

Use this skill when OpenClaw needs to inspect or change the live Claw dashboard through the backend UI gateway.

## When to use this skill

Use it for requests such as:

- inspect the current dashboard state before making a change
- add, update, move, or remove dashboard widgets
- replace the full dashboard state
- rearrange widgets between columns
- craft or validate AUIP payloads and `curl` commands
- interpret frontend UI events that should trigger follow-up AUIP patches or state refreshes

Do not use it for unrelated frontend styling or React component changes inside the codebase unless the user is explicitly asking for AUIP-driven dashboard state changes.

## Endpoint and envelope

The dashboard syncs through the backend:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8000
```

If the environment uses a different host or port, substitute that value consistently in examples and commands.

HTTP endpoints:

- `GET /state`: fetch the full current UI state before planning a patch
- `POST /auip`: submit `set_ui` or `patch_ui` mutations
- `POST /event`: submit user-originated UI events
- `GET /apply-change?since=<revision>`: fetch the latest applied state when the caller needs to know whether something changed

Send UI mutations to `POST /auip` with this envelope:

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

Supported AUIP message types:

- `set_ui`: replace the entire UI state
- `patch_ui`: apply incremental operations

## Default workflow

1. Determine whether the user wants a full replacement (`set_ui`) or an incremental change (`patch_ui`).
2. If the current layout or widget ids matter, read `GET /state` first instead of guessing.
3. Preserve `protocol_version: "1.0"` and `target.view_id: "main"`.
4. Use only supported widget kinds, variants, and operations.
5. For `patch_ui`, keep the patch to at most 20 operations.
6. Before updating, moving, or removing a widget, make sure the target widget already exists in the current UI state.
7. Before adding a widget, choose a fresh widget id and a valid placement.
8. After sending a mutation, assume clients will refresh over normal HTTP via `GET /apply-change`; do not rely on websockets.
9. Return the final payload or `curl` command in a form the user can run directly.

## Supported widget catalog

Only use these widget types. Do not invent new `kind` or `variant` values.

### `feed:news`

```json
{
  "items": [
    {
      "title": "...",
      "summary": "...",
      "source": "...",
      "url": "..."
    }
  ]
}
```

### `info:weather`

```json
{
  "location": "Shanghai",
  "temp_c": 19,
  "condition": "Cloudy",
  "high_c": 24,
  "low_c": 14
}
```

### `finance:crypto`

```json
{
  "currency": "USD",
  "items": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "price": 67200,
      "change_24h": 2.4
    }
  ]
}
```

### `productivity:todo`

```json
{
  "items": [
    {
      "id": "task_1",
      "label": "Ship MVP",
      "done": false
    }
  ]
}
```

### `content:text`

```json
{
  "content": "Plain text or markdown-like content"
}
```

## Supported operations

### `add_widget`

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

### `remove_widget`

```json
{
  "op": "remove_widget",
  "widget_id": "w_news"
}
```

### `move_widget`

```json
{
  "op": "move_widget",
  "widget_id": "w_news",
  "placement": {
    "column_id": "col_2",
    "position": 0
  }
}
```

### `update_widget`

```json
{
  "op": "update_widget",
  "widget_id": "w_news",
  "changes": {
    "title": "Top AI News",
    "config": {
      "items": []
    }
  }
}
```

### `set_layout`

```json
{
  "op": "set_layout",
  "layout": {
    "columns": [
      {
        "id": "col_1",
        "widget_ids": ["w_news"]
      },
      {
        "id": "col_2",
        "widget_ids": []
      }
    ]
  }
}
```

## Safety rules

- keep `protocol_version` at `1.0`
- keep `target.view_id` equal to `"main"`
- use only `col_1` and `col_2` unless the current UI state shows a different layout
- never reuse an existing widget id for a new widget
- never move, update, or remove a widget unless it already exists
- never exceed 20 operations in one patch
- never invent unsupported widget schemas
- never assume websocket delivery exists

## Response style

When fulfilling a user request with this skill:

- prefer a complete JSON payload or a ready-to-run `curl` command
- prefer checking `GET /state` before destructive changes
- include only the fields required for the requested change
- if the current widget state is unknown, state the assumption before issuing destructive operations
- if the user asks for multiple changes, combine them into a single `patch_ui` request when practical

## `curl` recipes

### Add a text widget

```bash
curl -X POST http://localhost:8000/auip \
  -H "Content-Type: application/json" \
  -d '{
    "protocol_version": "1.0",
    "type": "patch_ui",
    "target": { "view_id": "main" },
    "payload": {
      "operations": [
        {
          "op": "add_widget",
          "widget": {
            "id": "w_note",
            "kind": "content",
            "variant": "text",
            "title": "Ops Note",
            "config": {
              "content": "Backend online.\nFrontend synced.\nReady for AUIP patches."
            }
          },
          "placement": {
            "column_id": "col_1",
            "position": 0
          }
        }
      ]
    }
  }'
```

### Add a todo widget

```bash
curl -X POST http://localhost:8000/auip \
  -H "Content-Type: application/json" \
  -d '{
    "protocol_version": "1.0",
    "type": "patch_ui",
    "target": { "view_id": "main" },
    "payload": {
      "operations": [
        {
          "op": "add_widget",
          "widget": {
            "id": "w_todo",
            "kind": "productivity",
            "variant": "todo",
            "title": "Launch Checklist",
            "config": {
              "items": [
                { "id": "task_1", "label": "Start backend", "done": true },
                { "id": "task_2", "label": "Open dashboard", "done": true },
                { "id": "task_3", "label": "Send first AUIP patch", "done": false }
              ]
            }
          },
          "placement": {
            "column_id": "col_2",
            "position": 0
          }
        }
      ]
    }
  }'
```

### Update an existing widget

```bash
curl -X POST http://localhost:8000/auip \
  -H "Content-Type: application/json" \
  -d '{
    "protocol_version": "1.0",
    "type": "patch_ui",
    "target": { "view_id": "main" },
    "payload": {
      "operations": [
        {
          "op": "update_widget",
          "widget_id": "w_note",
          "changes": {
            "title": "Ops Summary",
            "config": {
              "content": "State store healthy.\nHTTP sync active.\nUI events enabled."
            }
          }
        }
      ]
    }
  }'
```

### Move a widget

```bash
curl -X POST http://localhost:8000/auip \
  -H "Content-Type: application/json" \
  -d '{
    "protocol_version": "1.0",
    "type": "patch_ui",
    "target": { "view_id": "main" },
    "payload": {
      "operations": [
        {
          "op": "move_widget",
          "widget_id": "w_note",
          "placement": {
            "column_id": "col_2",
            "position": 1
          }
        }
      ]
    }
  }'
```

### Remove a widget

```bash
curl -X POST http://localhost:8000/auip \
  -H "Content-Type: application/json" \
  -d '{
    "protocol_version": "1.0",
    "type": "patch_ui",
    "target": { "view_id": "main" },
    "payload": {
      "operations": [
        {
          "op": "remove_widget",
          "widget_id": "w_note"
        }
      ]
    }
  }'
```

## Frontend event follow-up

The dashboard posts user interactions to `POST /event`.

Known events:

- `widget_removed`
- `todo_toggled`

Treat these as user-originated state changes that may require a follow-up AUIP patch to keep the UI and backend state aligned.
If a caller needs to confirm the resulting UI state, check `GET /apply-change` or `GET /state` over HTTP.
