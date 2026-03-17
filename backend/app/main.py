from __future__ import annotations

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auip import router as auip_router
from app.routes.events import router as events_router
from app.state import state_store
from app.ws.manager import ws_manager

app = FastAPI(title="Agent-Native UI Gateway", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auip_router)
app.include_router(events_router)


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await ws_manager.connect(websocket)
    await websocket.send_json(
        {
            "protocol_version": "1.0",
            "type": "set_ui",
            "target": {"view_id": "main"},
            "payload": {"state": state_store.snapshot().model_dump(mode="json")},
        }
    )

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
