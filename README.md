# Claw UI

Agent-Native UI MVP with:

- `backend/`: FastAPI UI gateway, in-memory AUIP state store, websocket broadcaster
- `frontend/`: Next.js realtime dashboard renderer with Zustand state
- `skill/`: OpenClaw skill instructions for composing AUIP messages

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
