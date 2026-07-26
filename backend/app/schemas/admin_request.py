from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class AdminRequestType(str, Enum):
    recruiter_registration = "recruiter_registration"
    company_verification = "company_verification"
    kyc_verification = "kyc_verification"
    wallet_deposit = "wallet_deposit"
    wallet_withdrawal = "wallet_withdrawal"
    role_change = "role_change"
    vip_upgrade = "vip_upgrade"
    bonus_request = "bonus_request"
    account_recovery = "account_recovery"
    support_escalation = "support_escalation"
    custom = "custom"


class AdminRequestStatus(str, Enum):
    pending = "pending"
    assigned = "assigned"
    in_review = "in_review"
    waiting_for_information = "waiting_for_information"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"


class AdminRequestPriority(str, Enum):
    low = "low"
    normal = "normal"
    high = "high"
    urgent = "urgent"


class AdminRequestSort(str, Enum):
    newest = "newest"
    oldest = "oldest"
    priority = "priority"
    updated = "updated"


class RequestAttachment(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=255)
    url: str = Field(..., min_length=1, max_length=2048)
    content_type: str | None = Field(None, max_length=120)
    size_bytes: int | None = Field(None, ge=0)


class AdminRequestCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    request_type: AdminRequestType
    title: str = Field(..., min_length=3, max_length=180)
    description: str = Field(..., min_length=5, max_length=10000)
    priority: AdminRequestPriority = AdminRequestPriority.normal
    requester_id: str | None = Field(None, max_length=64)
    requester_name: str | None = Field(None, max_length=160)
    requester_email: str | None = Field(None, max_length=320)
    requester_role: str | None = Field(None, max_length=60)
    company_id: str | None = Field(None, max_length=64)
    company_name: str | None = Field(None, max_length=180)
    country: str | None = Field(None, max_length=120)
    payload: dict[str, Any] = Field(default_factory=dict)
    attachments: list[RequestAttachment] = Field(default_factory=list, max_length=20)
    idempotency_key: str | None = Field(None, min_length=8, max_length=128)

    @field_validator("requester_email")
    @classmethod
    def normalise_email(cls, value: str | None) -> str | None:
        return value.lower() if value else value


class AdminRequestFilter(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    search: str | None = Field(None, max_length=200)
    request_type: AdminRequestType | None = None
    status: AdminRequestStatus | None = None
    priority: AdminRequestPriority | None = None
    requester_role: str | None = Field(None, max_length=60)
    country: str | None = Field(None, max_length=120)
    assigned_admin_id: str | None = Field(None, max_length=64)
    created_from: datetime | None = None
    created_to: datetime | None = None
    include_deleted: bool = False
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
    sort: AdminRequestSort = AdminRequestSort.newest

    @model_validator(mode="after")
    def validate_dates(self):
        if self.created_from and self.created_to and self.created_from > self.created_to:
            raise ValueError("created_from cannot be later than created_to")
        return self


class AdminRequestApprove(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    note: str | None = Field(None, max_length=3000)
    resolution_data: dict[str, Any] = Field(default_factory=dict)


class AdminRequestReject(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    reason: str = Field(..., min_length=3, max_length=3000)
    resolution_data: dict[str, Any] = Field(default_factory=dict)


class AdminRequestAssign(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    admin_id: str = Field(..., min_length=1, max_length=64)
    admin_name: str | None = Field(None, max_length=160)
    note: str | None = Field(None, max_length=1000)


class AdminRequestNoteCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    note: str = Field(..., min_length=1, max_length=3000)
    internal: bool = True


class AdminRequestInformationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    message: str = Field(..., min_length=3, max_length=3000)
    requested_items: list[str] = Field(default_factory=list, max_length=30)


class AdminRequestPriorityUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    priority: AdminRequestPriority


class AdminRequestCancel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    reason: str | None = Field(None, max_length=2000)


class BulkAdminRequestAction(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    request_ids: list[str] = Field(..., min_length=1, max_length=100)
    note: str | None = Field(None, max_length=2000)


class BulkAdminRequestReject(BulkAdminRequestAction):
    reason: str = Field(..., min_length=3, max_length=3000)
