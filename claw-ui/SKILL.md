---
name: claw-ui
description: Use this skill when OpenClaw needs to inspect or change the live dashboard through the AUIP backend, especially to fetch `GET /state`, choose between `set_ui` and `patch_ui`, and post safe validated payloads.
---

# Claw UI

Use this skill when OpenClaw needs to inspect or change the live Claw dashboard through the backend UI gateway.

## When to use this skill

Use it for requests such as:

- inspect the current dashboard before changing it
- add, update, move, or remove widgets through AUIP
- replace the full dashboard layout
- reorganize columns and widget ordering
- craft or validate AUIP payloads and `curl` commands
- react to frontend UI events that require follow-up state changes

Do not use it for ordinary frontend component or styling work unless the user explicitly wants AUIP-driven live dashboard edits.

## Endpoints

```text
Frontend: http://localhost:3000
Backend:  http://127.0.0.1:8000
```

If the environment uses different ports or hosts, substitute them consistently.

HTTP endpoints:

- `GET /state`: inspect the current UI state
- `POST /auip`: submit `set_ui` or `patch_ui`
- `POST /event`: submit user-originated UI events

Send mutations to `POST /auip` with this envelope:

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

- `set_ui`: replace the full UI state
- `patch_ui`: apply incremental operations

## Default workflow

1. Inspect first: always fetch `GET /state` before any nontrivial UI mutation.
2. Summarize the current state briefly: columns, widget ids, and any constraints that matter.
3. Write a short layout plan before generating AUIP payloads. If multiple columns are involved, name each column's role clearly, for example `col_1 = product news`, `col_2 = industry moves`.
4. Choose mutation type deliberately:
   - prefer `set_ui` for empty dashboards, full resets, or clear redesign requests
   - prefer `patch_ui` for small edits to existing known widgets
5. Preserve `protocol_version: "1.0"` and `target.view_id: "main"`.
6. Use only supported widget kinds, variants, and operations.
7. For `patch_ui`, keep patches focused and capped at 20 operations.
8. After mutation, fetch `GET /state` again to verify the result instead of assuming it applied correctly.
9. Return ready-to-run commands or payload files the user can use immediately.

## Mutation choice

Choose `set_ui` when:

- the dashboard is empty or nearly empty
- the user asks for a full redesign, reset, or replacement
- the change would be simpler and safer as one complete state
- you want to define layout and widgets together from scratch

Choose `patch_ui` when:

- the existing dashboard already contains the target widgets
- the user wants a small edit such as rename, move, remove, or refresh content
- widget ids and placement are known from fresh `GET /state` output
- the change can be expressed as a few precise operations

If you do not know the current widget ids or layout, inspect with `GET /state` before choosing `patch_ui`.

## Layout planning rule

Before producing AUIP JSON, include a short plan in the response:

- current state snapshot: what exists now
- intended layout: what will change
- column roles: what each column is for
- mutation mode: why `set_ui` or `patch_ui` is the safer choice

Favor semantic column roles over vague labels. Good examples:

- `col_1`: product news
- `col_2`: industry moves
- `col_1`: market snapshot
- `col_2`: operator checklist

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

### `content:iframe`

Use this when OpenClaw should render custom embedded content from a raw iframe tag.

```json
{
  "iframe": "<iframe title=\"Custom Preview\" srcdoc=\"<html><body style='margin:0;font-family:sans-serif'><div style='padding:24px'>Hello from OpenClaw</div></body></html>\" sandbox=\"allow-scripts\" height=\"280\"></iframe>"
}
```

Rules:

- put the full raw `<iframe ...></iframe>` markup in `config.iframe`
- use exactly one iframe element, not a larger HTML document
- prefer `srcdoc` for agent-generated custom content
- include a `title`
- set `sandbox` deliberately based on the embed's needs
- prefer file-based JSON posting when `srcdoc` content is long or heavily quoted

## Supported operations

Use only these `patch_ui` operations:

- `add_widget`
- `remove_widget`
- `move_widget`
- `update_widget`
- `set_layout`

Before `update_widget`, `move_widget`, or `remove_widget`, confirm the widget id exists in fresh state.

## Safety rules

- always fetch `GET /state` before any nontrivial mutation
- always fetch `GET /state` after mutating to verify the result
- keep `protocol_version` at `1.0`
- keep `target.view_id` equal to `"main"`
- use only `col_1` and `col_2` unless current state shows a different layout
- never reuse an existing widget id for a new widget
- never move, update, or remove a widget unless it already exists
- never exceed 20 operations in one patch
- never invent unsupported widget schemas
- never rely on websocket delivery
- never hand-escape large inline JSON blobs in shell commands
- never put arbitrary HTML outside the single raw iframe string in `config.iframe`

## Large payload guidance

For larger updates, do not manually embed big JSON bodies inside a shell string. That is fragile and commonly causes broken escaping.

Prefer one of these patterns:

- save JSON to a file and post with `curl --data @payload.json`
- generate JSON with a serializer before posting, then send the serialized file or output

Safer file-based pattern:

```bash
curl -X POST http://127.0.0.1:8000/auip \
  -H "Content-Type: application/json" \
  --data @payload.json
```

If a payload contains many nested objects, quotes, or multiline text, prefer file-based posting by default.

## Response style

When using this skill, make the response actionable for iterative dashboard design:

1. Start with a short state summary from `GET /state`.
2. Give a compact layout plan before the AUIP payload.
3. State whether you are using `set_ui` or `patch_ui`, and why.
4. Return a ready-to-run command or a clean JSON payload.
5. End with a verification command using `GET /state`.

Prefer short, practical responses that help the user iterate quickly. When the request is design-oriented, suggest clear column roles and a minimal next step instead of dumping a large speculative payload.

## Ready-to-run examples

### Inspect current state

```bash
curl -sS http://127.0.0.1:8000/state
```

### Replace an empty dashboard with a two-column redesign

Plan:

- `col_1`: product news
- `col_2`: industry moves
- use `set_ui` because this is a full layout definition from scratch

```json
{
  "protocol_version": "1.0",
  "type": "set_ui",
  "target": { "view_id": "main" },
  "payload": {
    "state": {
      "views": {
        "main": {
          "layout": {
            "columns": [
              { "id": "col_1", "widget_ids": ["w_product_news"] },
              { "id": "col_2", "widget_ids": ["w_industry_moves"] }
            ]
          }
        }
      },
      "widgets": {
        "w_product_news": {
          "id": "w_product_news",
          "kind": "feed",
          "variant": "news",
          "title": "Product News",
          "config": {
            "items": []
          }
        },
        "w_industry_moves": {
          "id": "w_industry_moves",
          "kind": "feed",
          "variant": "news",
          "title": "Industry Moves",
          "config": {
            "items": []
          }
        }
      }
    }
  }
}
```

Post it safely:

```bash
curl -X POST http://127.0.0.1:8000/auip \
  -H "Content-Type: application/json" \
  --data @payload.json
```

Verify:

```bash
curl -sS http://127.0.0.1:8000/state
```

### Patch an existing known widget

Plan:

- keep the current layout
- update only `w_note`
- use `patch_ui` because the widget id is already known from fresh state

```bash
curl -X POST http://127.0.0.1:8000/auip \
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

Verify:

```bash
curl -sS http://127.0.0.1:8000/state
```

## Troubleshooting

### JSON decode error

- most often caused by broken quoting or hand-escaped inline JSON
- move the payload into a file and post with `--data @payload.json`
- if generating JSON programmatically, serialize it instead of manually concatenating strings

### Connection failure

- confirm the backend is running on `http://127.0.0.1:8000`
- retry `curl -sS http://127.0.0.1:8000/state`
- if ports differ in the environment, update every example consistently

### Unknown widget ID during patching

- fetch `GET /state` again and confirm the widget still exists
- switch to `set_ui` if the dashboard was reset or the intended change is effectively a redesign
- do not guess widget ids

### Unsupported widget kind or variant

- use only the widget catalog in this skill
- if the requested widget does not map cleanly to a supported schema, say so and offer the closest supported alternative

## Frontend event follow-up

The dashboard posts user interactions to `POST /event`.

Known events:

- `widget_removed`
- `todo_toggled`

Treat these as user-originated state changes that may require follow-up AUIP mutations. If the resulting UI state matters, confirm it with `GET /state`.
