from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


PackageStatus = Literal["active", "inactive"]


class RechargePackageCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    price: float = Field(gt=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    coins: int = Field(gt=0)
    bonus_coins: int = Field(default=0, ge=0)
    badge: Optional[str] = Field(default=None, max_length=50)
    sort_order: int = Field(default=0, ge=0)
    is_active: bool = True

    @field_validator("name", "description", "badge", mode="before")
    @classmethod
    def strip_optional_text(cls, value):
        if isinstance(value, str):
            value = value.strip()
        return value

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.strip().upper()


class RechargePackageUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    price: Optional[float] = Field(default=None, gt=0)
    currency: Optional[str] = Field(default=None, min_length=3, max_length=3)
    coins: Optional[int] = Field(default=None, gt=0)
    bonus_coins: Optional[int] = Field(default=None, ge=0)
    badge: Optional[str] = Field(default=None, max_length=50)
    sort_order: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None

    @field_validator("name", "description", "badge", mode="before")
    @classmethod
    def strip_optional_text(cls, value):
        if isinstance(value, str):
            value = value.strip()
        return value

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: Optional[str]) -> Optional[str]:
        return value.strip().upper() if isinstance(value, str) else value


class RechargePackageResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: float
    currency: str
    coins: int
    bonus_coins: int
    total_coins: int
    badge: Optional[str] = None
    sort_order: int
    is_active: bool
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class RechargePackageListResponse(BaseModel):
    total: int
    page: int
    limit: int
    packages: list[RechargePackageResponse]


class RechargePackageStatistics(BaseModel):
    total_packages: int
    active_packages: int
    inactive_packages: int
    lowest_price: float
    highest_price: float
    total_base_coins: int
    total_bonus_coins: int
