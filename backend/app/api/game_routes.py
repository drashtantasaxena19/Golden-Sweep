from __future__ import annotations

from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    Request,
    UploadFile,
    status,
)
from fastapi.responses import StreamingResponse

from app.core.database import get_database
from app.repositories.game_repository import GameRepository
from app.schemas.game_schema import (
    GameBulkDeleteRequest,
    GameBulkDeleteResultSchema,
    GameBulkFeatureRequest,
    GameBulkLandingPageRequest,
    GameBulkStatusRequest,
    GameBulkStatusResultSchema,
    GameBulkBooleanResultSchema,
    GameCategory,
    GameCreate,
    GameDeleteResponseSchema,
    GameImageDeleteResponse,
    GameImageMetadataSchema,
    GameImageType,
    GameImageUploadResponse,
    GameImageValidationResponseSchema,
    GameListResponse,
    GameMultiImageUploadResponseSchema,
    GameReorderRequest,
    GameResponse,
    GameStatisticsResponse,
    GameStatus,
    GameStatusResponse,
    GameUpdate,
)
from app.services.game_service import (
    GameConflictError,
    GameNotFoundError,
    GameService,
    GameServiceError,
    GameValidationError,
)
from app.services.gridfs_storage_service import (
    GridFSFileNotFoundError,
    GridFSFileTooLargeError,
    GridFSInvalidFileError,
    GridFSStorageError,
    GridFSStorageService,
)


admin_router = APIRouter(prefix="/admin/games", tags=["Admin Games"])
public_router = APIRouter(prefix="/games", tags=["Public Games"])


def get_gridfs_storage(database=Depends(get_database)) -> GridFSStorageService:
    return GridFSStorageService(database)


def get_game_service(
    database=Depends(get_database),
    gridfs_storage: GridFSStorageService = Depends(get_gridfs_storage),
) -> GameService:
    return GameService(
        repository=GameRepository(database),
        gridfs_storage=gridfs_storage,
    )


def get_admin_id(request: Request) -> str | None:
    """Resolve the acting admin's identifier from request state.

    Assumes an upstream authentication dependency/middleware (already
    present elsewhere in the GoldenSweep backend, e.g. on admin_router)
    populates `request.state.user` for authenticated admin requests.
    """
    user = getattr(request.state, "user", None)

    if isinstance(user, dict):
        return str(
            user.get("id") or user.get("uid") or user.get("sub") or ""
        ) or None

    return str(getattr(user, "id", "") or getattr(user, "uid", "") or "") or None


def map_error(error: Exception) -> HTTPException:
    if isinstance(error, GameConflictError):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))

    if isinstance(error, GameNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))

    if isinstance(error, GameValidationError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))

    if isinstance(error, GridFSFileNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))

    if isinstance(error, GridFSFileTooLargeError):
        return HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(error)
        )

    if isinstance(error, GridFSInvalidFileError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))

    if isinstance(error, GridFSStorageError):
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error)
        )

    if isinstance(error, GameServiceError):
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error)
        )

    if isinstance(error, ValueError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))

    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="An unexpected game service error occurred.",
    )


# ---------------------------------------------------------------------------
# Admin: statistics
# ---------------------------------------------------------------------------


@admin_router.get("/statistics", response_model=GameStatisticsResponse)
async def get_game_statistics(
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.get_statistics()
    except Exception as error:
        raise map_error(error) from error


# ---------------------------------------------------------------------------
# Admin: bulk operations
# ---------------------------------------------------------------------------


@admin_router.post("/bulk/status", response_model=GameBulkStatusResultSchema)
async def bulk_update_game_status(
    payload: GameBulkStatusRequest,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.bulk_update_status(
            payload.game_ids,
            payload.status,
            updated_by=get_admin_id(request),
        )
    except Exception as error:
        raise map_error(error) from error


@admin_router.post("/bulk/feature", response_model=GameBulkBooleanResultSchema)
async def bulk_feature_games(
    payload: GameBulkFeatureRequest,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.bulk_feature_games(
            payload.game_ids,
            payload.is_featured,
            updated_by=get_admin_id(request),
        )
    except Exception as error:
        raise map_error(error) from error


@admin_router.post("/bulk/landing-page", response_model=GameBulkBooleanResultSchema)
async def bulk_landing_page_update(
    payload: GameBulkLandingPageRequest,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.bulk_landing_page_update(
            payload.game_ids,
            payload.show_on_landing_page,
            updated_by=get_admin_id(request),
        )
    except Exception as error:
        raise map_error(error) from error


@admin_router.post("/bulk/delete", response_model=GameBulkDeleteResultSchema)
async def bulk_delete_games(
    payload: GameBulkDeleteRequest,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.bulk_delete_games(payload.game_ids)
    except Exception as error:
        raise map_error(error) from error


# ---------------------------------------------------------------------------
# Admin: CRUD & listing
# ---------------------------------------------------------------------------


@admin_router.get("", response_model=GameListResponse)
async def list_admin_games(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    status_filter: Optional[GameStatus] = Query(default=None, alias="status"),
    category: Optional[GameCategory] = Query(default=None),
    provider_name: Optional[str] = Query(default=None),
    is_featured: Optional[bool] = Query(default=None),
    show_on_landing_page: Optional[bool] = Query(default=None),
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.list_admin_games(
            page=page,
            limit=limit,
            search=search,
            status=status_filter,
            category=category,
            provider_name=provider_name,
            is_featured=is_featured,
            show_on_landing_page=show_on_landing_page,
        )
    except Exception as error:
        raise map_error(error) from error


@admin_router.post("", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
async def create_game(
    payload: GameCreate,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.create_game(
            payload=payload.model_dump(),
            created_by=get_admin_id(request),
        )
    except Exception as error:
        raise map_error(error) from error


@admin_router.get("/{game_id}", response_model=GameResponse)
async def get_admin_game(
    game_id: str,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.get_game_by_id(game_id)
    except Exception as error:
        raise map_error(error) from error


@admin_router.patch("/{game_id}", response_model=GameResponse)
async def update_game(
    game_id: str,
    payload: GameUpdate,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.update_game(
            game_id=game_id,
            payload=payload.model_dump(exclude_unset=True),
            updated_by=get_admin_id(request),
        )
    except Exception as error:
        raise map_error(error) from error


@admin_router.delete("/{game_id}", response_model=GameDeleteResponseSchema)
async def delete_game(
    game_id: str,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.delete_game(game_id)
    except Exception as error:
        raise map_error(error) from error


# ---------------------------------------------------------------------------
# Admin: status / feature / landing-page / ordering
# ---------------------------------------------------------------------------


@admin_router.patch(
    "/{game_id}/publish",
    response_model=GameResponse,
    deprecated=True,
)
async def publish_game(
    game_id: str,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.publish_game(game_id, updated_by=get_admin_id(request))
    except Exception as error:
        raise map_error(error) from error


@admin_router.patch(
    "/{game_id}/unpublish",
    response_model=GameResponse,
    deprecated=True,
)
async def unpublish_game(
    game_id: str,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.unpublish_game(game_id, updated_by=get_admin_id(request))
    except Exception as error:
        raise map_error(error) from error


@admin_router.patch(
    "/{game_id}/status",
    response_model=GameResponse,
    deprecated=True,
)
async def set_game_status(
    game_id: str,
    request: Request,
    new_status: GameStatus = Query(..., alias="status"),
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.set_game_status(
            game_id, new_status, updated_by=get_admin_id(request)
        )
    except Exception as error:
        raise map_error(error) from error


@admin_router.patch("/{game_id}/feature", response_model=GameResponse)
async def feature_game(
    game_id: str,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.feature_game(game_id, updated_by=get_admin_id(request))
    except Exception as error:
        raise map_error(error) from error


@admin_router.patch("/{game_id}/unfeature", response_model=GameResponse)
async def unfeature_game(
    game_id: str,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.unfeature_game(game_id, updated_by=get_admin_id(request))
    except Exception as error:
        raise map_error(error) from error


@admin_router.patch("/{game_id}/show-on-landing-page", response_model=GameResponse)
async def show_game_on_landing_page(
    game_id: str,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.show_on_landing_page(
            game_id, updated_by=get_admin_id(request)
        )
    except Exception as error:
        raise map_error(error) from error


@admin_router.patch("/{game_id}/hide-from-landing-page", response_model=GameResponse)
async def hide_game_from_landing_page(
    game_id: str,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.hide_from_landing_page(
            game_id, updated_by=get_admin_id(request)
        )
    except Exception as error:
        raise map_error(error) from error


@admin_router.patch("/{game_id}/reorder", response_model=GameResponse)
async def reorder_game(
    game_id: str,
    payload: GameReorderRequest,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.reorder_game(
            game_id, payload.sort_order, updated_by=get_admin_id(request)
        )
    except Exception as error:
        raise map_error(error) from error


# ---------------------------------------------------------------------------
# Admin: images
# ---------------------------------------------------------------------------


@admin_router.post(
    "/{game_id}/images/{image_type}",
    response_model=GameImageUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload or replace a game image",
    description=(
        "Uploads or replaces a logo, thumbnail, or banner. "
        "Uploading the required logo automatically publishes a complete game."
    ),
)
async def upload_game_image(
    game_id: str,
    image_type: GameImageType,
    request: Request,
    file: UploadFile = File(...),
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.upload_game_image(
            game_id,
            image_type=image_type,
            file=file,
            uploaded_by=get_admin_id(request),
        )
    except Exception as error:
        raise map_error(error) from error


@admin_router.post(
    "/{game_id}/images",
    response_model=GameMultiImageUploadResponseSchema,
    status_code=status.HTTP_200_OK,
    summary="Upload multiple game images",
    description=(
        "Uploads any supplied logo, thumbnail, and banner files. "
        "Thumbnail and banner are optional; a supplied logo triggers "
        "automatic publishing after validation."
    ),
)
async def upload_game_images(
    game_id: str,
    request: Request,
    logo: Optional[UploadFile] = File(default=None),
    thumbnail: Optional[UploadFile] = File(default=None),
    banner: Optional[UploadFile] = File(default=None),
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.replace_multiple_game_images(
            game_id,
            logo=logo,
            thumbnail=thumbnail,
            banner=banner,
            uploaded_by=get_admin_id(request),
        )
    except Exception as error:
        raise map_error(error) from error


@admin_router.get(
    "/{game_id}/images/validate",
    response_model=GameImageValidationResponseSchema,
)
async def validate_game_images(
    game_id: str,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.validate_game_images(game_id)
    except Exception as error:
        raise map_error(error) from error


@admin_router.get(
    "/{game_id}/images/{image_type}",
    response_model=GameImageMetadataSchema,
)
async def get_game_image_metadata(
    game_id: str,
    image_type: GameImageType,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.get_game_image_metadata(game_id, image_type=image_type)
    except Exception as error:
        raise map_error(error) from error


@admin_router.delete(
    "/{game_id}/images/{image_type}",
    response_model=GameImageDeleteResponse,
)
async def delete_game_image(
    game_id: str,
    image_type: GameImageType,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.delete_game_image(
            game_id, image_type, updated_by=get_admin_id(request)
        )
    except Exception as error:
        raise map_error(error) from error


@admin_router.delete("/{game_id}/images", response_model=GameStatusResponse)
async def delete_all_game_images(
    game_id: str,
    request: Request,
    service: GameService = Depends(get_game_service),
):
    try:
        result = await service.delete_all_game_images(
            game_id, updated_by=get_admin_id(request)
        )
        return {
            "success": True,
            "message": "All game images deleted successfully.",
            "game": result["game"],
        }
    except Exception as error:
        raise map_error(error) from error


# ---------------------------------------------------------------------------
# Public: listing / details / play
# ---------------------------------------------------------------------------


@public_router.get("", response_model=GameListResponse)
async def list_public_games(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=24, ge=1, le=100),
    category: Optional[GameCategory] = Query(default=None),
    featured_only: bool = Query(default=False),
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.list_public_games(
            page=page,
            limit=limit,
            category=category,
            featured_only=featured_only,
        )
    except Exception as error:
        raise map_error(error) from error


@public_router.get("/image/{file_id}")
async def get_public_game_image(
    file_id: str,
    gridfs_storage: GridFSStorageService = Depends(get_gridfs_storage),
):
    try:
        download = await gridfs_storage.open_download(file_id)
        return StreamingResponse(
            download.stream,
            media_type=download.content_type,
            headers={
                "Content-Length": str(download.size_bytes),
                "Content-Disposition": (
                    f'inline; filename="{download.filename}"'
                ),
                "Cache-Control": "public, max-age=31536000, immutable",
                "X-Content-Type-Options": "nosniff",
            },
        )
    except Exception as error:
        raise map_error(error) from error


@public_router.get("/{slug}", response_model=GameResponse)
async def get_public_game(
    slug: str,
    service: GameService = Depends(get_game_service),
):
    try:
        return await service.get_game_by_slug(slug, public_only=True)
    except Exception as error:
        raise map_error(error) from error


@public_router.post("/{game_id}/play", response_model=GameStatusResponse)
async def register_game_play(
    game_id: str,
    service: GameService = Depends(get_game_service),
):
    try:
        game = await service.increment_play_count(game_id)
        return {
            "success": True,
            "message": "Game play registered.",
            "game": game,
        }
    except Exception as error:
        raise map_error(error) from error