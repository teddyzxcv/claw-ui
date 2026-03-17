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
