---
name: claw-ui
description: Use this skill when working with the OpenClaw dashboard UI through the AUIP backend protocol, especially to create, update, move, remove, or replace widgets by sending `POST /auip` requests with valid widget schemas and layout operations.
---

# Claw UI

Use this skill when the user wants to change the live Claw dashboard by sending AUIP messages to the backend UI gateway.

## When to use this skill

Use it for requests such as:

- add, update, move, or remove dashboard widgets
- replace the full dashboard state
- rearrange widgets between columns
- craft or validate AUIP payloads and `curl` commands
- interpret frontend UI events that should trigger follow-up AUIP patches

Do not use it for unrelated frontend styling or React component changes inside the codebase unless the user is explicitly asking for AUIP-driven dashboard state changes.

## Endpoint and envelope

The dashboard syncs through the backend:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8000
```

If the environment uses a different host or port, substitute that value consistently in examples and commands.

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
2. Preserve `protocol_version: "1.0"` and `target.view_id: "main"`.
3. Use only supported widget kinds, variants, and operations.
4. For `patch_ui`, keep the patch to at most 20 operations.
5. Before updating, moving, or removing a widget, make sure the target widget already exists in the current UI state.
6. Before adding a widget, choose a fresh widget id and a valid placement.
7. Return the final payload or `curl` command in a form the user can run directly.

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

## Response style

When fulfilling a user request with this skill:

- prefer a complete JSON payload or a ready-to-run `curl` command
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
              "content": "State store healthy.\nWebSocket connected.\nUI events enabled."
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
