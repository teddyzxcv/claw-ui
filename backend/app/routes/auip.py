from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

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


@router.get("/apply-change")
async def apply_change(since: int = Query(default=-1, ge=-1)) -> dict:
    snapshot = state_store.snapshot_payload()
    revision = snapshot["revision"]
    if since >= revision:
        return {"ok": True, "applied": False, "revision": revision}

    return {
        "ok": True,
        "applied": True,
        "revision": revision,
        "state": snapshot["state"],
    }
