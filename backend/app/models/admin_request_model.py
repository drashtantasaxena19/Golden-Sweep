from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def public_request_number() -> str:
    now = utc_now()
    return f"AR-{now:%Y%m%d}-{uuid4().hex[:8].upper()}"


def timeline_event(
    *,
    action: str,
    actor_id: str | None,
    actor_name: str | None,
    actor_role: str | None,
    message: str,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "event_id": uuid4().hex,
        "action": action,
        "actor_id": actor_id,
        "actor_name": actor_name,
        "actor_role": actor_role,
        "message": message,
        "metadata": metadata or {},
        "created_at": utc_now(),
    }
