from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    field_validator,
    model_validator,
)


GameStatus = Literal[
    "draft",
    "published",
    "maintenance",
    "disabled",
]

GameCategory = Literal[
    "arcade",
    "card",
    "casino",
    "casual",
    "puzzle",
    "sports",
    "strategy",
    "other",
]

GameOrientation = Literal[
    "portrait",
    "landscape",
    "responsive",
]

GameImageType = Literal[
    "logo",
    "thumbnail",
    "banner",
]

GameImageKind = GameImageType


def normalize_slug_value(value: str) -> str:
    slug = value.strip().lower()
    allowed_characters = set(
        "abcdefghijklmnopqrstuvwxyz0123456789-"
    )

    if any(character not in allowed_characters for character in slug):
        raise ValueError(
            "Slug may contain only lowercase letters, numbers, and hyphens."
        )

    if slug.startswith("-") or slug.endswith("-") or "--" in slug:
        raise ValueError("Slug format is invalid.")

    return slug


def normalize_tag_values(value: Any) -> list[str]:
    if value is None:
        return []

    if isinstance(value, str):
        value = value.split(",")

    if not isinstance(value, (list, tuple, set)):
        raise ValueError(
            "Tags must be provided as a list or comma-separated string."
        )

    normalized_tags = {
        str(item).strip().lower()
        for item in value
        if str(item).strip()
    }

    if len(normalized_tags) > 20:
        raise ValueError("A maximum of 20 tags may be provided.")

    return sorted(normalized_tags)


class GameBaseSchema(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    name: str = Field(
        ...,
        min_length=2,
        max_length=120,
    )
    slug: str = Field(
        ...,
        min_length=2,
        max_length=140,
    )
    short_description: str = Field(
        ...,
        min_length=5,
        max_length=240,
    )
    description: str = Field(
        ...,
        min_length=10,
        max_length=5000,
    )
    category: GameCategory = "other"
    game_url: HttpUrl

    # Files are uploaded after the initial draft is created.
    # The service must require logo_file_id before publishing.
    logo_file_id: str | None = Field(
        default=None,
        max_length=64,
    )
    thumbnail_file_id: str | None = Field(
        default=None,
        max_length=64,
    )
    banner_file_id: str | None = Field(
        default=None,
        max_length=64,
    )

    entry_fee_coins: int = Field(default=0, ge=0)
    minimum_age: int = Field(default=18, ge=0, le=100)
    provider_name: str | None = Field(default=None, max_length=120)
    provider_game_id: str | None = Field(default=None, max_length=160)
    orientation: GameOrientation = "responsive"
    tags: list[str] = Field(default_factory=list, max_length=20)
    instructions: str | None = Field(default=None, max_length=5000)
    terms_and_conditions: str | None = Field(
        default=None,
        max_length=5000,
    )

    status: GameStatus = "draft"
    is_featured: bool = False
    show_on_landing_page: bool = True
    sort_order: int = Field(default=0, ge=0)
    opens_in_new_tab: bool = True
    is_mobile_supported: bool = True
    is_desktop_supported: bool = True

    @field_validator(
        "name",
        "slug",
        "short_description",
        "description",
        "provider_name",
        "provider_game_id",
        "instructions",
        "terms_and_conditions",
        "logo_file_id",
        "thumbnail_file_id",
        "banner_file_id",
        mode="before",
    )
    @classmethod
    def strip_string_values(cls, value: Any) -> Any:
        if isinstance(value, str):
            normalized = value.strip()
            return normalized or None
        return value

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, value: str) -> str:
        return normalize_slug_value(value)

    @field_validator("tags", mode="before")
    @classmethod
    def normalize_tags(cls, value: Any) -> list[str]:
        return normalize_tag_values(value)

    @model_validator(mode="after")
    def validate_platform_support(self) -> "GameBaseSchema":
        if not self.is_mobile_supported and not self.is_desktop_supported:
            raise ValueError(
                "At least one platform must be supported: mobile or desktop."
            )
        return self


class GameCreateSchema(GameBaseSchema):
    # Creation is always internal draft-first. The frontend should not ask
    # the admin to choose a status during game creation.
    status: Literal["draft"] = "draft"


class GameUpdateSchema(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    name: str | None = Field(default=None, min_length=2, max_length=120)
    slug: str | None = Field(default=None, min_length=2, max_length=140)
    short_description: str | None = Field(
        default=None,
        min_length=5,
        max_length=240,
    )
    description: str | None = Field(
        default=None,
        min_length=10,
        max_length=5000,
    )
    category: GameCategory | None = None
    game_url: HttpUrl | None = None
    logo_file_id: str | None = Field(default=None, max_length=64)
    thumbnail_file_id: str | None = Field(default=None, max_length=64)
    banner_file_id: str | None = Field(default=None, max_length=64)
    entry_fee_coins: int | None = Field(default=None, ge=0)
    minimum_age: int | None = Field(default=None, ge=0, le=100)
    provider_name: str | None = Field(default=None, max_length=120)
    provider_game_id: str | None = Field(default=None, max_length=160)
    orientation: GameOrientation | None = None
    tags: list[str] | None = Field(default=None, max_length=20)
    instructions: str | None = Field(default=None, max_length=5000)
    terms_and_conditions: str | None = Field(
        default=None,
        max_length=5000,
    )
    status: GameStatus | None = None
    is_featured: bool | None = None
    show_on_landing_page: bool | None = None
    sort_order: int | None = Field(default=None, ge=0)
    opens_in_new_tab: bool | None = None
    is_mobile_supported: bool | None = None
    is_desktop_supported: bool | None = None

    @field_validator(
        "name",
        "slug",
        "short_description",
        "description",
        "provider_name",
        "provider_game_id",
        "instructions",
        "terms_and_conditions",
        "logo_file_id",
        "thumbnail_file_id",
        "banner_file_id",
        mode="before",
    )
    @classmethod
    def strip_string_values(cls, value: Any) -> Any:
        if isinstance(value, str):
            normalized = value.strip()
            return normalized or None
        return value

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return normalize_slug_value(value)

    @field_validator("tags", mode="before")
    @classmethod
    def normalize_tags(cls, value: Any) -> list[str] | None:
        if value is None:
            return None
        return normalize_tag_values(value)

    @model_validator(mode="after")
    def validate_platform_support(self) -> "GameUpdateSchema":
        if (
            self.is_mobile_supported is False
            and self.is_desktop_supported is False
        ):
            raise ValueError(
                "At least one platform must be supported: mobile or desktop."
            )
        return self


class GameResponseSchema(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
    )

    id: str
    name: str
    slug: str
    short_description: str
    description: str
    category: GameCategory
    game_url: str
    logo_file_id: str | None = None
    thumbnail_file_id: str | None = None
    banner_file_id: str | None = None
    entry_fee_coins: int = 0
    minimum_age: int = 18
    provider_name: str | None = None
    provider_game_id: str | None = None
    orientation: GameOrientation = "responsive"
    tags: list[str] = Field(default_factory=list)
    instructions: str | None = None
    terms_and_conditions: str | None = None
    status: GameStatus = "draft"
    is_featured: bool = False
    show_on_landing_page: bool = True
    sort_order: int = 0
    opens_in_new_tab: bool = True
    is_mobile_supported: bool = True
    is_desktop_supported: bool = True
    play_count: int = 0
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class GameListResponseSchema(BaseModel):
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    limit: int = Field(ge=1)
    total_pages: int = Field(ge=0)
    games: list[GameResponseSchema] = Field(default_factory=list)


class GameStatisticsResponseSchema(BaseModel):
    total_games: int = Field(default=0, ge=0)
    published_games: int = Field(default=0, ge=0)
    draft_games: int = Field(default=0, ge=0)
    maintenance_games: int = Field(default=0, ge=0)
    disabled_games: int = Field(default=0, ge=0)
    featured_games: int = Field(default=0, ge=0)
    landing_page_games: int = Field(default=0, ge=0)
    total_play_count: int = Field(default=0, ge=0)


class GameImageMetadataSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")

    file_id: str
    filename: str
    content_type: str
    size_bytes: int = Field(ge=0)
    uploaded_at: datetime
    image_type: GameImageType
    image_url: str


class GameImageUploadResponseSchema(BaseModel):
    success: bool = True
    message: str | None = None
    game: GameResponseSchema
    image: GameImageMetadataSchema
    replaced_file_id: str | None = None


class GameMultiImageUploadResponseSchema(BaseModel):
    success: bool = True
    message: str | None = None
    game: GameResponseSchema
    images: dict[str, GameImageMetadataSchema]


class GameImageDeleteResponse(BaseModel):
    success: bool
    image_type: GameImageType
    file_id: str | None = None
    storage_status: str
    game: GameResponseSchema


class GameImageValidationResponseSchema(BaseModel):
    game_id: str
    slug: str
    is_valid: bool
    valid: list[dict[str, str]]
    missing: list[dict[str, str]]


class GameMessageResponseSchema(BaseModel):
    success: bool
    message: str


class GameStatusResponse(BaseModel):
    success: bool
    message: str
    game: GameResponseSchema


class GameDeleteResponseSchema(BaseModel):
    success: bool
    game_id: str
    slug: str | None = None
    image_cleanup: dict[str, list[str]]


class GameReorderRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sort_order: int = Field(ge=0, le=1_000_000)


class GameBulkStatusRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    game_ids: list[str] = Field(..., min_length=1, max_length=500)
    status: GameStatus


class GameBulkFeatureRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    game_ids: list[str] = Field(..., min_length=1, max_length=500)
    is_featured: bool


class GameBulkLandingPageRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    game_ids: list[str] = Field(..., min_length=1, max_length=500)
    show_on_landing_page: bool


class GameBulkDeleteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    game_ids: list[str] = Field(..., min_length=1, max_length=500)


class GameBulkStatusResultSchema(BaseModel):
    requested: int
    matched: list[str]
    missing: list[str]
    invalid: list[dict[str, str]]
    modified_count: int
    status: GameStatus


class GameBulkBooleanResultSchema(BaseModel):
    requested: int
    matched_count: int
    modified_count: int
    invalid: list[str]
    field: str
    value: bool


class GameBulkDeleteResultSchema(BaseModel):
    requested: int
    deleted: list[str]
    missing: list[str]
    invalid: list[str]
    failed: list[dict[str, str]]


GameCreate = GameCreateSchema
GameUpdate = GameUpdateSchema
GameResponse = GameResponseSchema
GameListResponse = GameListResponseSchema
GameStatisticsResponse = GameStatisticsResponseSchema
GameImageUploadResponse = GameImageUploadResponseSchema
GameMessageResponse = GameMessageResponseSchema


__all__ = [
    "GameStatus",
    "GameCategory",
    "GameOrientation",
    "GameImageType",
    "GameImageKind",
    "GameBaseSchema",
    "GameCreateSchema",
    "GameUpdateSchema",
    "GameResponseSchema",
    "GameListResponseSchema",
    "GameStatisticsResponseSchema",
    "GameImageMetadataSchema",
    "GameImageUploadResponseSchema",
    "GameMultiImageUploadResponseSchema",
    "GameImageDeleteResponse",
    "GameImageValidationResponseSchema",
    "GameMessageResponseSchema",
    "GameStatusResponse",
    "GameDeleteResponseSchema",
    "GameReorderRequest",
    "GameBulkStatusRequest",
    "GameBulkFeatureRequest",
    "GameBulkLandingPageRequest",
    "GameBulkDeleteRequest",
    "GameBulkStatusResultSchema",
    "GameBulkBooleanResultSchema",
    "GameBulkDeleteResultSchema",
    "GameCreate",
    "GameUpdate",
    "GameResponse",
    "GameListResponse",
    "GameStatisticsResponse",
    "GameImageUploadResponse",
    "GameMessageResponse",
]