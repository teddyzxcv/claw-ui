# Claw UI

Agent-Native UI MVP with:

- `backend/`: FastAPI UI gateway, in-memory AUIP state store, websocket broadcaster
- `frontend/`: Next.js realtime dashboard renderer with Zustand state
- `skill/`: original skill docs
- `claw-ui/`: GitHub-installable OpenClaw skill folder

## Run

Backend:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the dashboard.

The frontend dev server now acts as a same-origin proxy for the FastAPI API and
WebSocket endpoints. Run the backend locally on port `8000`, then expose only the
frontend port `3000` when sharing the app externally.

By default the proxy targets `http://127.0.0.1:8000`. To point it somewhere else:

```bash
cd frontend
BACKEND_ORIGIN=http://127.0.0.1:8000 npm run dev
```

## Install As OpenClaw Skill

This repo now includes an installable skill at `claw-ui/SKILL.md`, so OpenClaw can install it directly from the GitHub repo path instead of requiring a manual copy.

If the repo is published at `OWNER/REPO`, install with:

```bash
scripts/install-skill-from-github.py --repo OWNER/REPO --path claw-ui
```

Or with a direct GitHub URL:

```bash
scripts/install-skill-from-github.py --url https://github.com/OWNER/REPO/tree/main/claw-ui
```

Because the folder name is `claw-ui`, the installed skill name will also be `claw-ui`.

## Example AUIP patch

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
            "id": "w_news",
            "kind": "feed",
            "variant": "news",
            "title": "AI News",
            "config": {
              "items": [
                {
                  "title": "Agent-native interfaces are shipping",
                  "summary": "Realtime UI protocols are becoming easier to wire into assistants.",
                  "source": "Lab Notes",
                  "url": "https://example.com/story"
                }
              ]
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

## UI events

The frontend posts user actions back to `POST /event`:

- `widget_removed`
- `todo_toggled`

## Iframe widget

To render agent-generated custom content, use a `content:iframe` widget and put the raw iframe markup in `config.iframe`:

```json
{
  "id": "w_custom_embed",
  "kind": "content",
  "variant": "iframe",
  "title": "Custom Preview",
  "config": {
    "iframe": "<iframe title=\"Custom Preview\" srcdoc=\"<html><body style='margin:0;font-family:sans-serif'><div style='padding:24px'>Hello from OpenClaw</div></body></html>\" sandbox=\"allow-scripts\" height=\"280\"></iframe>"
  }
}
```

The renderer only accepts a single raw `<iframe>` element and maps its safe attributes onto a real iframe component.
