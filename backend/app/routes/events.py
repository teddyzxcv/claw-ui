from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models import UIEventMessage
from app.state import StateValidationError, state_store

router = APIRouter()


@router.post("/event")
async def post_event(message: UIEventMessage) -> dict:
    try:
        outbound = state_store.apply_event(message)
    except StateValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"ok": True, "message": outbound}
