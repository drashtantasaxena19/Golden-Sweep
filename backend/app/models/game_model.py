from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Mapping


DEFAULT_GAME_STATUS = "draft"
DEFAULT_GAME_CATEGORY = "other"
DEFAULT_GAME_ORIENTATION = "responsive"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _to_optional_string(value: Any) -> str | None:
    if value is None:
        return None

    normalized = str(value).strip()
    return normalized or None


def _to_string(value: Any, *, default: str = "") -> str:
    if value is None:
        return default
    return str(value)


def _to_datetime(value: Any, *, fallback: datetime) -> datetime:
    return value if isinstance(value, datetime) else fallback


def build_game_document(
    payload: Mapping[str, Any],
    *,
    created_by: str | None = None,
) -> dict[str, Any]:
    now = utc_now()
    document = dict(payload)

    if "game_url" in document and document["game_url"] is not None:
        document["game_url"] = str(document["game_url"])

    document.setdefault("logo_file_id", None)
    document.setdefault("thumbnail_file_id", None)
    document.setdefault("banner_file_id", None)
    document.setdefault("status", DEFAULT_GAME_STATUS)
    document.setdefault("category", DEFAULT_GAME_CATEGORY)
    document.setdefault("orientation", DEFAULT_GAME_ORIENTATION)
    document.setdefault("entry_fee_coins", 0)
    document.setdefault("minimum_age", 18)
    document.setdefault("tags", [])
    document.setdefault("is_featured", False)
    document.setdefault("show_on_landing_page", True)
    document.setdefault("sort_order", 0)
    document.setdefault("opens_in_new_tab", True)
    document.setdefault("is_mobile_supported", True)
    document.setdefault("is_desktop_supported", True)
    document.setdefault("play_count", 0)

    document["created_by"] = created_by
    document["updated_by"] = created_by
    document["created_at"] = now
    document["updated_at"] = now

    return document


def build_game_update_document(
    payload: Mapping[str, Any],
    *,
    updated_by: str | None = None,
) -> dict[str, Any]:
    document = dict(payload)

    if "game_url" in document and document["game_url"] is not None:
        document["game_url"] = str(document["game_url"])

    document["updated_by"] = updated_by
    document["updated_at"] = utc_now()

    return document


def serialize_game_document(document: Mapping[str, Any]) -> dict[str, Any]:
    now = utc_now()
    created_at = _to_datetime(document.get("created_at"), fallback=now)
    updated_at = _to_datetime(document.get("updated_at"), fallback=created_at)

    document_id = document.get("_id", document.get("id"))

    return {
        "id": _to_string(document_id),
        "name": _to_string(document.get("name")),
        "slug": _to_string(document.get("slug")),
        "short_description": _to_string(document.get("short_description")),
        "description": _to_string(document.get("description")),
        "category": _to_string(
            document.get("category"),
            default=DEFAULT_GAME_CATEGORY,
        ),
        "game_url": _to_string(document.get("game_url")),
        "logo_file_id": _to_optional_string(document.get("logo_file_id")),
        "thumbnail_file_id": _to_optional_string(
            document.get("thumbnail_file_id")
        ),
        "banner_file_id": _to_optional_string(document.get("banner_file_id")),
        "entry_fee_coins": int(document.get("entry_fee_coins") or 0),
        "minimum_age": int(document.get("minimum_age") or 18),
        "provider_name": _to_optional_string(document.get("provider_name")),
        "provider_game_id": _to_optional_string(
            document.get("provider_game_id")
        ),
        "orientation": _to_string(
            document.get("orientation"),
            default=DEFAULT_GAME_ORIENTATION,
        ),
        "tags": list(document.get("tags") or []),
        "instructions": _to_optional_string(document.get("instructions")),
        "terms_and_conditions": _to_optional_string(
            document.get("terms_and_conditions")
        ),
        "status": _to_string(
            document.get("status"),
            default=DEFAULT_GAME_STATUS,
        ),
        "is_featured": bool(document.get("is_featured", False)),
        "show_on_landing_page": bool(
            document.get("show_on_landing_page", True)
        ),
        "sort_order": int(document.get("sort_order") or 0),
        "opens_in_new_tab": bool(document.get("opens_in_new_tab", True)),
        "is_mobile_supported": bool(
            document.get("is_mobile_supported", True)
        ),
        "is_desktop_supported": bool(
            document.get("is_desktop_supported", True)
        ),
        "play_count": int(document.get("play_count") or 0),
        "created_by": _to_optional_string(document.get("created_by")),
        "updated_by": _to_optional_string(document.get("updated_by")),
        "created_at": created_at,
        "updated_at": updated_at,
    }


__all__ = [
    "DEFAULT_GAME_STATUS",
    "DEFAULT_GAME_CATEGORY",
    "DEFAULT_GAME_ORIENTATION",
    "utc_now",
    "build_game_document",
    "build_game_update_document",
    "serialize_game_document",
]