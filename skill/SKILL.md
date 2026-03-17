# claw-ui

Use this skill when you want OpenClaw to create, update, remove, or rearrange widgets in the Claw UI dashboard.

## Purpose

Send AUIP messages to the backend UI gateway so the dashboard at `http://localhost:3000` updates in real time through WebSocket sync.

Default backend URL:

```text
http://localhost:8000
```

If your environment uses a different host or port, replace that URL in the examples below.

## AUIP envelope

Every request goes to `POST /auip` with JSON:

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

Supported `type` values:

- `set_ui`: replace the full UI state
- `patch_ui`: apply incremental operations

## Supported widget catalog

Use only these widget types:

- `feed:news`
  Config:
  `{"items":[{"title":"...","summary":"...","source":"...","url":"..."}]}`
- `info:weather`
  Config:
  `{"location":"Shanghai","temp_c":19,"condition":"Cloudy","high_c":24,"low_c":14}`
- `finance:crypto`
  Config:
  `{"currency":"USD","items":[{"symbol":"BTC","name":"Bitcoin","price":67200,"change_24h":2.4}]}`
- `productivity:todo`
  Config:
  `{"items":[{"id":"task_1","label":"Ship MVP","done":false}]}`
- `content:text`
  Config:
  `{"content":"Plain text or markdown-like content"}`

Do not invent new `kind:variant` values. The backend rejects unknown widget types.

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
      { "id": "col_1", "widget_ids": ["w_news"] },
      { "id": "col_2", "widget_ids": [] }
    ]
  }
}
```

## Safety rules

- Keep `protocol_version` at `1.0`
- Use `target.view_id = "main"`
- Maximum 20 operations per patch
- Never reuse an existing widget id for a new widget
- Never remove, move, or update a widget unless it already exists
- Use only `col_1` and `col_2` unless the state explicitly shows a different layout

## Curl recipes

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

## UI events from the frontend

The dashboard posts user interactions to `POST /event`:

- `widget_removed`
- `todo_toggled`

Treat those as user-originated actions that may require a follow-up AUIP patch.
