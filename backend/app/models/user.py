from datetime import datetime, timezone
from typing import Any


def create_user_document(
    *,
    full_name: str,
    email: str,
    phone: str,
    password_hash: str,
    date_of_birth: str,
    country: str,
    state: str,
    preferred_language: str,
    avatar_url: str | None = None,
) -> dict[str, Any]:
    now = datetime.now(
        timezone.utc
    )

    return {
        "full_name": full_name.strip(),
        "email": email.strip().lower(),
        "phone": phone.strip(),

        "password_hash": password_hash,

        "date_of_birth":
            date_of_birth,

        "country": country,
        "state": state.strip(),

        "preferred_language":
            preferred_language,

        "avatar_url": avatar_url,

        "role": "player",

        "account_status": "active",

        "email_verified": False,
        "phone_verified": False,
        "age_verified": True,

        "terms_accepted": True,

        "wallet": {
            "balance": 0,
            "currency": "GC",
        },

        "created_at": now,
        "updated_at": now,

        "last_login_at": None,
    }