from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models import AUIPMessage
from app.state import StateValidationError, state_store

router = APIRouter()


@router.post("/auip")
async def post_auip(message: AUIPMessage) -> dict:
    try:
        outbound = state_store.apply_auip(message)
    except StateValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"ok": True, "message": outbound}


@router.get("/state")
async def get_state() -> dict:
    return state_store.snapshot().model_dump(mode="json")
