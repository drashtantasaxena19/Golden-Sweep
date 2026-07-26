from __future__ import annotations
import re
from datetime import datetime, timezone
from typing import Any, Final, Iterable, Literal, Optional
from fastapi import UploadFile
from pymongo import UpdateOne
from pymongo.errors import DuplicateKeyError
from app.models.game_model import build_game_document, build_game_update_document, serialize_game_document
from app.repositories.game_repository import GameRepository
from app.services.gridfs_storage_service import GridFSFileNotFoundError, GridFSInvalidFileError, GridFSStorageError, GridFSStorageService
GameImageType = Literal['logo', 'thumbnail', 'banner']

class GameServiceError(Exception):
    pass

class GameValidationError(GameServiceError):
    pass

class GameNotFoundError(GameServiceError):
    pass

class GameConflictError(GameServiceError):
    pass

class GameService:
    SLUG_PATTERN = re.compile('^[a-z0-9]+(?:-[a-z0-9]+)*$')
    IMAGE_FIELD_MAP: dict[GameImageType, str] = {'logo': 'logo_file_id', 'thumbnail': 'thumbnail_file_id', 'banner': 'banner_file_id'}
    ALLOWED_STATUSES: Final[frozenset[str]] = frozenset({'draft', 'published', 'maintenance', 'disabled'})
    MAX_BULK_ITEMS: Final[int] = 500
    IMAGE_FIELD_BY_TYPE: dict[str, str] = IMAGE_FIELD_MAP

    def __init__(self, repository: GameRepository, gridfs_storage: GridFSStorageService) -> None:
        self.repository = repository
        self.gridfs_storage = gridfs_storage

    @staticmethod
    def serialize_game(document: dict[str, Any]) -> dict[str, Any]:
        if not document:
            raise GameNotFoundError('Game not found.')
        return serialize_game_document(document)

    @classmethod
    def validate_slug(cls, slug: str) -> str:
        normalized_slug = str(slug or '').strip().lower()
        if len(normalized_slug) < 2:
            raise GameValidationError('Game slug must contain at least 2 characters.')
        if len(normalized_slug) > 140:
            raise GameValidationError('Game slug must not exceed 140 characters.')
        if not cls.SLUG_PATTERN.fullmatch(normalized_slug):
            raise GameValidationError('Game slug may contain only lowercase letters, numbers, and single hyphens between words.')
        return normalized_slug

    @staticmethod
    def _normalize_optional_text(value: Any) -> Any:
        if not isinstance(value, str):
            return value
        normalized = value.strip()
        return normalized or None

    @classmethod
    def _normalize_payload(cls, payload: dict[str, Any], *, partial: bool) -> dict[str, Any]:
        normalized = dict(payload)
        text_fields = {'name', 'short_description', 'description', 'provider_name', 'provider_game_id', 'instructions', 'terms_and_conditions', 'logo_file_id', 'thumbnail_file_id', 'banner_file_id'}
        for field in text_fields:
            if field in normalized:
                normalized[field] = cls._normalize_optional_text(normalized[field])
        if 'slug' in normalized and normalized['slug'] is not None:
            normalized['slug'] = cls.validate_slug(normalized['slug'])
        if 'game_url' in normalized and normalized['game_url'] is not None:
            normalized['game_url'] = str(normalized['game_url']).strip()
        if 'tags' in normalized:
            tags = normalized.get('tags')
            if tags is None and partial:
                pass
            else:
                if isinstance(tags, str):
                    tags = tags.split(',')
                normalized['tags'] = sorted({str(tag).strip().lower() for tag in tags or [] if str(tag).strip()})
        return normalized

    @staticmethod
    def _validate_image_reference_fields(payload: dict[str, Any]) -> None:
        image_fields = ('logo_file_id', 'thumbnail_file_id', 'banner_file_id')
        for field in image_fields:
            value = payload.get(field)
            if value is not None and len(str(value)) > 64:
                raise GameValidationError(f'{field} must not exceed 64 characters.')

    @staticmethod
    def _validate_platform_support(payload: dict[str, Any], *, existing: Optional[dict[str, Any]]=None) -> None:
        mobile_supported = payload.get('is_mobile_supported', existing.get('is_mobile_supported', True) if existing else True)
        desktop_supported = payload.get('is_desktop_supported', existing.get('is_desktop_supported', True) if existing else True)
        if not mobile_supported and (not desktop_supported):
            raise GameValidationError('At least one platform must be supported: mobile or desktop.')

    @staticmethod
    def _validate_publish_requirements(payload: dict[str, Any], *, existing: Optional[dict[str, Any]]=None) -> None:
        status = payload.get('status', existing.get('status', 'draft') if existing else 'draft')
        if status != 'published':
            return

        def resolve(field: str, default: Any=None) -> Any:
            if field in payload:
                return payload[field]
            if existing:
                return existing.get(field, default)
            return default
        required_fields = {'name': resolve('name'), 'slug': resolve('slug'), 'short_description': resolve('short_description'), 'description': resolve('description'), 'game_url': resolve('game_url'), 'logo_file_id': resolve('logo_file_id')}
        missing_fields = [field for field, value in required_fields.items() if value is None or str(value).strip() == '']
        if missing_fields:
            readable_fields = ', '.join((field.replace('_', ' ') for field in missing_fields))
            raise GameValidationError(f'Game cannot be published without: {readable_fields}.')

    async def create_game(self, payload: dict[str, Any], *, created_by: str | None=None) -> dict[str, Any]:
        normalized_payload = self._normalize_payload(payload, partial=False)
        normalized_payload['status'] = 'draft'
        required_fields = ('name', 'slug', 'short_description', 'description', 'game_url')
        missing_fields = [field for field in required_fields if normalized_payload.get(field) in (None, '')]
        if missing_fields:
            readable_fields = ', '.join((field.replace('_', ' ') for field in missing_fields))
            raise GameValidationError(f'Missing required game fields: {readable_fields}.')
        self._validate_image_reference_fields(normalized_payload)
        self._validate_platform_support(normalized_payload)
        self._validate_publish_requirements(normalized_payload)
        if await self.repository.slug_exists(normalized_payload['slug']):
            raise GameConflictError('A game with this slug already exists.')
        document = build_game_document(normalized_payload, created_by=created_by)
        try:
            created_game = await self.repository.create(document)
        except DuplicateKeyError as error:
            raise GameConflictError('A game with this slug already exists.') from error
        except Exception as error:
            raise GameServiceError('Game could not be created.') from error
        return self.serialize_game(created_game)

    async def update_game(self, game_id: str, payload: dict[str, Any], *, updated_by: str | None=None) -> dict[str, Any]:
        existing_game = await self.repository.get_by_id(game_id)
        if existing_game is None:
            raise GameNotFoundError('Game not found.')
        normalized_payload = self._normalize_payload(payload, partial=True)
        if not normalized_payload:
            return self.serialize_game(existing_game)
        self._validate_image_reference_fields(normalized_payload)
        self._validate_platform_support(normalized_payload, existing=existing_game)
        self._validate_publish_requirements(normalized_payload, existing=existing_game)
        new_slug = normalized_payload.get('slug')
        if new_slug and await self.repository.slug_exists(new_slug, exclude_game_id=game_id):
            raise GameConflictError('A game with this slug already exists.')
        update_document = build_game_update_document(normalized_payload, updated_by=updated_by)
        try:
            updated_game = await self.repository.update(game_id, update_document)
        except DuplicateKeyError as error:
            raise GameConflictError('A game with this slug already exists.') from error
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game could not be updated.') from error
        if updated_game is None:
            raise GameNotFoundError('Game not found.')
        return self.serialize_game(updated_game)

    async def get_game_by_id(self, game_id: str) -> dict[str, Any]:
        try:
            game = await self.repository.get_by_id(game_id)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        if game is None:
            raise GameNotFoundError('Game not found.')
        return self.serialize_game(game)

    async def get_game_by_slug(self, slug: str, *, public_only: bool=False) -> dict[str, Any]:
        normalized_slug = self.validate_slug(slug)
        game = await self.repository.get_by_slug(normalized_slug)
        if game is None:
            raise GameNotFoundError('Game not found.')
        if public_only:
            if game.get('status') != 'published':
                raise GameNotFoundError('Game not found.')
            if not game.get('show_on_landing_page', True):
                raise GameNotFoundError('Game not found.')
        return self.serialize_game(game)

    async def list_admin_games(self, *, page: int=1, limit: int=20, search: str | None=None, status: str | None=None, category: str | None=None, provider_name: str | None=None, is_featured: bool | None=None, show_on_landing_page: bool | None=None) -> dict[str, Any]:
        if page < 1:
            raise GameValidationError('Page must be at least 1.')
        if limit < 1 or limit > 100:
            raise GameValidationError('Limit must be between 1 and 100.')
        result = await self.repository.list_admin(page=page, limit=limit, search=search.strip() if search else None, status=status, category=category, provider_name=provider_name.strip() if provider_name else None, is_featured=is_featured, show_on_landing_page=show_on_landing_page)
        return {'total': result['total'], 'page': result['page'], 'limit': result['limit'], 'total_pages': result['total_pages'], 'games': [self.serialize_game(game) for game in result['games']]}

    async def list_public_games(self, *, page: int=1, limit: int=24, category: str | None=None, featured_only: bool=False) -> dict[str, Any]:
        if page < 1:
            raise GameValidationError('Page must be at least 1.')
        if limit < 1 or limit > 100:
            raise GameValidationError('Limit must be between 1 and 100.')
        result = await self.repository.list_public(page=page, limit=limit, category=category, featured_only=featured_only)
        return {'total': result['total'], 'page': result['page'], 'limit': result['limit'], 'total_pages': result['total_pages'], 'games': [self.serialize_game(game) for game in result['games']]}

    @classmethod
    def _validate_image_type(cls, image_type: str) -> GameImageType:
        normalized = str(image_type or '').strip().lower()
        if normalized not in cls.IMAGE_FIELD_MAP:
            allowed = ', '.join(cls.IMAGE_FIELD_MAP)
            raise GameValidationError(f'Invalid image type. Allowed values: {allowed}.')
        return normalized

    async def upload_game_image(self, game_id: str, *, image_type: str, file: UploadFile, uploaded_by: Optional[str]=None, extra_metadata: Optional[dict[str, Any]]=None) -> dict[str, Any]:
        normalized_image_type = self._validate_image_type(image_type)
        image_field = self.IMAGE_FIELD_MAP[normalized_image_type]
        game = await self.repository.get_by_id(game_id)
        if game is None:
            await file.close()
            raise GameNotFoundError('Game not found.')
        previous_file_id = game.get(image_field)
        uploaded_file_id: Optional[str] = None
        metadata: dict[str, Any] = {'game_id': str(game.get('_id', game_id)), 'game_name': game.get('name'), 'game_status': game.get('status')}
        if extra_metadata:
            metadata.update(extra_metadata)
        try:
            uploaded_file = await self.gridfs_storage.upload_image(file=file, image_type=normalized_image_type, game_slug=game.get('slug'), uploaded_by=uploaded_by, extra_metadata=metadata)
            uploaded_file_id = uploaded_file.file_id
            update_payload = {image_field: uploaded_file.file_id}
            if normalized_image_type == 'logo':
                publish_candidate = dict(game)
                publish_candidate.update(update_payload)
                self._validate_publish_requirements_for_game(
                    publish_candidate
                )
                update_payload['status'] = 'published'
            update_document = build_game_update_document(update_payload, updated_by=uploaded_by)
            updated_game = await self.repository.update(game_id, update_document)
            if updated_game is None:
                raise GameNotFoundError('Game not found.')
        except (GridFSInvalidFileError, GridFSStorageError, GameNotFoundError):
            if uploaded_file_id:
                await self._delete_uploaded_file_safely(uploaded_file_id)
            raise
        except Exception as error:
            if uploaded_file_id:
                await self._delete_uploaded_file_safely(uploaded_file_id)
            raise GameServiceError(f'Game {normalized_image_type} could not be uploaded.') from error
        if previous_file_id and previous_file_id != uploaded_file_id:
            await self._delete_uploaded_file_safely(previous_file_id)
        return {'game': self.serialize_game(updated_game), 'image': {'file_id': uploaded_file.file_id, 'filename': uploaded_file.filename, 'content_type': uploaded_file.content_type, 'size_bytes': uploaded_file.size_bytes, 'uploaded_at': uploaded_file.uploaded_at, 'image_type': normalized_image_type, 'image_url': f'/api/games/image/{uploaded_file.file_id}'}, 'replaced_file_id': previous_file_id}

    async def replace_game_logo(self, game_id: str, *, file: UploadFile, uploaded_by: Optional[str]=None, extra_metadata: Optional[dict[str, Any]]=None) -> dict[str, Any]:
        return await self.upload_game_image(game_id, image_type='logo', file=file, uploaded_by=uploaded_by, extra_metadata=extra_metadata)

    async def replace_game_thumbnail(self, game_id: str, *, file: UploadFile, uploaded_by: Optional[str]=None, extra_metadata: Optional[dict[str, Any]]=None) -> dict[str, Any]:
        return await self.upload_game_image(game_id, image_type='thumbnail', file=file, uploaded_by=uploaded_by, extra_metadata=extra_metadata)

    async def replace_game_banner(self, game_id: str, *, file: UploadFile, uploaded_by: Optional[str]=None, extra_metadata: Optional[dict[str, Any]]=None) -> dict[str, Any]:
        return await self.upload_game_image(game_id, image_type='banner', file=file, uploaded_by=uploaded_by, extra_metadata=extra_metadata)

    async def replace_multiple_game_images(self, game_id: str, *, logo: Optional[UploadFile]=None, thumbnail: Optional[UploadFile]=None, banner: Optional[UploadFile]=None, uploaded_by: Optional[str]=None) -> dict[str, Any]:
        supplied_files: list[tuple[GameImageType, UploadFile]] = [(image_type, file) for image_type, file in (('logo', logo), ('thumbnail', thumbnail), ('banner', banner)) if file is not None]
        if not supplied_files:
            raise GameValidationError('At least one image file must be provided.')
        game = await self.repository.get_by_id(game_id)
        if game is None:
            for _, upload in supplied_files:
                await upload.close()
            raise GameNotFoundError('Game not found.')
        uploaded_files: dict[GameImageType, Any] = {}
        old_file_ids: dict[GameImageType, Optional[str]] = {image_type: game.get(self.IMAGE_FIELD_MAP[image_type]) for image_type, _ in supplied_files}
        try:
            for image_type, upload in supplied_files:
                uploaded_files[image_type] = await self.gridfs_storage.upload_image(file=upload, image_type=image_type, game_slug=game.get('slug'), uploaded_by=uploaded_by, extra_metadata={'game_id': str(game.get('_id', game_id)), 'game_name': game.get('name')})
            update_payload = {self.IMAGE_FIELD_MAP[image_type]: metadata.file_id for image_type, metadata in uploaded_files.items()}
            if 'logo' in uploaded_files:
                publish_candidate = dict(game)
                publish_candidate.update(update_payload)
                self._validate_publish_requirements_for_game(
                    publish_candidate
                )
                update_payload['status'] = 'published'
            update_document = build_game_update_document(update_payload, updated_by=uploaded_by)
            updated_game = await self.repository.update(game_id, update_document)
            if updated_game is None:
                raise GameNotFoundError('Game not found.')
        except Exception:
            for metadata in uploaded_files.values():
                await self._delete_uploaded_file_safely(metadata.file_id)
            raise
        for image_type, old_file_id in old_file_ids.items():
            new_file_id = uploaded_files[image_type].file_id
            if old_file_id and old_file_id != new_file_id:
                await self._delete_uploaded_file_safely(old_file_id)
        return {'game': self.serialize_game(updated_game), 'images': {image_type: {'file_id': metadata.file_id, 'filename': metadata.filename, 'content_type': metadata.content_type, 'size_bytes': metadata.size_bytes, 'uploaded_at': metadata.uploaded_at, 'image_type': image_type, 'image_url': f'/api/games/image/{metadata.file_id}'} for image_type, metadata in uploaded_files.items()}}

    async def get_game_image_metadata(self, game_id: str, *, image_type: str) -> dict[str, Any]:
        normalized_image_type = self._validate_image_type(image_type)
        image_field = self.IMAGE_FIELD_MAP[normalized_image_type]
        game = await self.repository.get_by_id(game_id)
        if game is None:
            raise GameNotFoundError('Game not found.')
        file_id = game.get(image_field)
        if not file_id:
            raise GameNotFoundError(f'Game {normalized_image_type} is not available.')
        try:
            metadata = await self.gridfs_storage.get_metadata(file_id)
        except GridFSFileNotFoundError as error:
            raise GameNotFoundError(f'Game {normalized_image_type} file was not found.') from error
        return {'file_id': metadata.file_id, 'filename': metadata.filename, 'content_type': metadata.content_type, 'size_bytes': metadata.size_bytes, 'uploaded_at': metadata.uploaded_at, 'image_type': metadata.image_type, 'game_slug': metadata.game_slug, 'uploaded_by': metadata.uploaded_by, 'image_url': f'/api/games/image/{metadata.file_id}', 'metadata': metadata.metadata}

    async def _delete_uploaded_file_safely(self, file_id: str) -> bool:
        try:
            await self.gridfs_storage.delete_file(file_id)
            return True
        except GridFSFileNotFoundError:
            return False
        except Exception:
            return False

    def _ensure_image_dependencies(self) -> None:
        if not hasattr(self, 'repository'):
            raise RuntimeError('Game repository is not configured.')
        if not hasattr(self, 'gridfs_storage'):
            raise RuntimeError('GridFS storage service is not configured.')

    @classmethod
    def _normalize_image_type(cls, image_type: str) -> str:
        normalized = str(image_type or '').strip().lower()
        if normalized not in cls.IMAGE_FIELD_BY_TYPE:
            allowed = ', '.join(sorted(cls.IMAGE_FIELD_BY_TYPE))
            raise GameValidationError(f'Invalid image type. Allowed values: {allowed}.')
        return normalized

    @classmethod
    def _image_field_for_type(cls, image_type: str) -> str:
        normalized = cls._normalize_image_type(image_type)
        return cls.IMAGE_FIELD_BY_TYPE[normalized]

    @staticmethod
    def _serialize_game(document: dict[str, Any]) -> dict[str, Any]:
        if not document:
            raise GameNotFoundError('Game not found.')
        return serialize_game_document(document)

    @classmethod
    def _collect_image_ids(cls, game: dict[str, Any]) -> dict[str, str]:
        collected: dict[str, str] = {}
        for image_type, field_name in cls.IMAGE_FIELD_BY_TYPE.items():
            raw_file_id = game.get(field_name)
            if raw_file_id:
                collected[image_type] = str(raw_file_id)
        return collected

    async def _safe_delete_gridfs_file(self, file_id: str) -> dict[str, str]:
        self._ensure_image_dependencies()
        normalized_file_id = str(file_id or '').strip()
        if not normalized_file_id:
            return {'file_id': normalized_file_id, 'status': 'missing'}
        try:
            await self.gridfs_storage.delete_file(normalized_file_id)
            return {'file_id': normalized_file_id, 'status': 'deleted'}
        except (GridFSFileNotFoundError, GridFSInvalidFileError):
            return {'file_id': normalized_file_id, 'status': 'missing'}
        except GridFSStorageError:
            return {'file_id': normalized_file_id, 'status': 'failed'}
        except Exception:
            return {'file_id': normalized_file_id, 'status': 'failed'}

    async def _delete_game_gridfs_files(self, game: dict[str, Any]) -> dict[str, list[str]]:
        image_ids = self._collect_image_ids(game)
        result: dict[str, list[str]] = {'deleted': [], 'missing': [], 'failed': []}
        for file_id in image_ids.values():
            deletion = await self._safe_delete_gridfs_file(file_id)
            result[deletion['status']].append(file_id)
        return result

    async def _clear_image_fields(self, game_id: str, *, fields: Optional[list[str]]=None, updated_by: str | None=None) -> dict[str, Any]:
        self._ensure_image_dependencies()
        selected_fields = fields or list(self.IMAGE_FIELD_BY_TYPE.values())
        invalid_fields = [field for field in selected_fields if field not in self.IMAGE_FIELD_BY_TYPE.values()]
        if invalid_fields:
            raise GameValidationError(f"Invalid image fields: {', '.join(invalid_fields)}.")
        updates: dict[str, Any] = {field: None for field in selected_fields}
        if 'logo_file_id' in selected_fields:
            updates['status'] = 'draft'
        updates['updated_by'] = updated_by
        updates['updated_at'] = datetime.now(timezone.utc)
        try:
            updated_game = await self.repository.update(game_id, updates)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game image references could not be cleared.') from error
        if updated_game is None:
            raise GameNotFoundError('Game not found.')
        return updated_game

    async def delete_game_image(self, game_id: str, image_type: str, *, updated_by: str | None=None) -> dict[str, Any]:
        self._ensure_image_dependencies()
        normalized_type = self._normalize_image_type(image_type)
        image_field = self.IMAGE_FIELD_BY_TYPE[normalized_type]
        try:
            game = await self.repository.get_by_id(game_id)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game could not be loaded.') from error
        if game is None:
            raise GameNotFoundError('Game not found.')
        raw_file_id = game.get(image_field)
        file_id = str(raw_file_id) if raw_file_id else None
        if file_id is None:
            return {'success': True, 'image_type': normalized_type, 'file_id': None, 'storage_status': 'missing', 'game': self._serialize_game(game)}
        deletion = await self._safe_delete_gridfs_file(file_id)
        if deletion['status'] == 'failed':
            raise GameServiceError(f'{normalized_type.capitalize()} image could not be deleted from GridFS.')
        updated_game = await self._clear_image_fields(game_id, fields=[image_field], updated_by=updated_by)
        return {'success': True, 'image_type': normalized_type, 'file_id': file_id, 'storage_status': deletion['status'], 'game': self._serialize_game(updated_game)}

    async def delete_logo(self, game_id: str, *, updated_by: str | None=None) -> dict[str, Any]:
        return await self.delete_game_image(game_id, 'logo', updated_by=updated_by)

    async def delete_thumbnail(self, game_id: str, *, updated_by: str | None=None) -> dict[str, Any]:
        return await self.delete_game_image(game_id, 'thumbnail', updated_by=updated_by)

    async def delete_banner(self, game_id: str, *, updated_by: str | None=None) -> dict[str, Any]:
        return await self.delete_game_image(game_id, 'banner', updated_by=updated_by)

    async def delete_all_game_images(self, game_id: str, *, updated_by: str | None=None) -> dict[str, Any]:
        self._ensure_image_dependencies()
        try:
            game = await self.repository.get_by_id(game_id)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game could not be loaded.') from error
        if game is None:
            raise GameNotFoundError('Game not found.')
        deletion_result = await self._delete_game_gridfs_files(game)
        if deletion_result['failed']:
            raise GameServiceError('One or more game images could not be deleted from GridFS.')
        updated_game = await self._clear_image_fields(game_id, updated_by=updated_by)
        return {'success': True, **deletion_result, 'game': self._serialize_game(updated_game)}

    async def remove_image_reference(self, game_id: str, image_type: str, *, updated_by: str | None=None) -> dict[str, Any]:
        self._ensure_image_dependencies()
        normalized_type = self._normalize_image_type(image_type)
        image_field = self.IMAGE_FIELD_BY_TYPE[normalized_type]
        updated_game = await self._clear_image_fields(game_id, fields=[image_field], updated_by=updated_by)
        return {'success': True, 'image_type': normalized_type, 'game': self._serialize_game(updated_game)}

    async def image_exists(self, file_id: str | None) -> bool:
        self._ensure_image_dependencies()
        if not file_id:
            return False
        try:
            return await self.gridfs_storage.exists(str(file_id))
        except Exception:
            return False

    async def delete_game(self, game_id: str) -> dict[str, Any]:
        self._ensure_image_dependencies()
        try:
            game = await self.repository.get_by_id(game_id)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game could not be loaded.') from error
        if game is None:
            raise GameNotFoundError('Game not found.')
        deletion_result = await self._delete_game_gridfs_files(game)
        try:
            deleted = await self.repository.delete(game_id)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game could not be deleted.') from error
        if not deleted:
            raise GameNotFoundError('Game not found.')
        return {'success': True, 'game_id': game_id, 'slug': game.get('slug'), 'image_cleanup': deletion_result}

    def get_image_urls(self, game: dict[str, Any], *, base_path: str='/api/games/image') -> dict[str, str | None]:
        normalized_base_path = str(base_path or '').strip().rstrip('/')
        if not normalized_base_path:
            raise GameValidationError('Image base path must not be empty.')
        result: dict[str, str | None] = {}
        for image_type, field_name in self.IMAGE_FIELD_BY_TYPE.items():
            raw_file_id = game.get(field_name)
            result[f'{image_type}_url'] = f'{normalized_base_path}/{raw_file_id}' if raw_file_id else None
        return result

    async def validate_game_images(self, game_id: str) -> dict[str, Any]:
        self._ensure_image_dependencies()
        try:
            game = await self.repository.get_by_id(game_id)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game could not be loaded.') from error
        if game is None:
            raise GameNotFoundError('Game not found.')
        valid: list[dict[str, str]] = []
        missing: list[dict[str, str]] = []
        for image_type, file_id in self._collect_image_ids(game).items():
            entry = {'image_type': image_type, 'file_id': file_id}
            if await self.image_exists(file_id):
                valid.append(entry)
            else:
                missing.append(entry)
        return {'game_id': game_id, 'slug': game.get('slug'), 'is_valid': not missing, 'valid': valid, 'missing': missing}

    async def cleanup_orphan_images(self, game_id: str) -> dict[str, Any]:
        self._ensure_image_dependencies()
        try:
            game = await self.repository.get_by_id(game_id)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game could not be loaded.') from error
        if game is None:
            raise GameNotFoundError('Game not found.')
        slug = str(game.get('slug') or '').strip().lower()
        if not slug:
            raise GameValidationError('Game slug is missing.')
        referenced_ids = set(self._collect_image_ids(game).values())
        try:
            stored_files = await self.gridfs_storage.list_for_game(game_slug=slug, limit=200)
        except Exception as error:
            raise GameServiceError('Game images could not be loaded from GridFS.') from error
        orphan_ids = [item.file_id for item in stored_files if item.file_id not in referenced_ids]
        if not orphan_ids:
            return {'game_id': game_id, 'slug': slug, 'deleted': [], 'missing': [], 'failed': []}
        try:
            cleanup_result = await self.gridfs_storage.delete_many(orphan_ids, ignore_missing=True)
        except Exception as error:
            raise GameServiceError('Orphan game images could not be deleted.') from error
        return {'game_id': game_id, 'slug': slug, **cleanup_result}

    async def cleanup_deleted_games(self, *, batch_size: int=200) -> dict[str, Any]:
        self._ensure_image_dependencies()
        if batch_size < 1 or batch_size > 1000:
            raise GameValidationError('Batch size must be between 1 and 1000.')
        deleted: list[str] = []
        missing: list[str] = []
        failed: list[str] = []
        scanned = 0
        cursor = self.gridfs_storage.files_collection.find({'metadata.game_slug': {'$type': 'string', '$ne': ''}}, {'_id': 1, 'metadata.game_slug': 1}).sort('uploadDate', 1).limit(batch_size)
        try:
            file_documents = await cursor.to_list(length=batch_size)
        except Exception as error:
            raise GameServiceError('GridFS images could not be scanned.') from error
        game_cache: dict[str, bool] = {}
        for file_document in file_documents:
            scanned += 1
            metadata = dict(file_document.get('metadata') or {})
            slug = str(metadata.get('game_slug') or '').strip().lower()
            file_id = str(file_document['_id'])
            if not slug:
                continue
            game_exists = game_cache.get(slug)
            if game_exists is None:
                try:
                    game_exists = await self.repository.get_by_slug(slug) is not None
                except Exception as error:
                    raise GameServiceError('Games could not be checked during GridFS cleanup.') from error
                game_cache[slug] = game_exists
            if game_exists:
                continue
            deletion = await self._safe_delete_gridfs_file(file_id)
            status = deletion['status']
            if status == 'deleted':
                deleted.append(file_id)
            elif status == 'missing':
                missing.append(file_id)
            else:
                failed.append(file_id)
        return {'scanned': scanned, 'deleted': deleted, 'missing': missing, 'failed': failed, 'has_more': len(file_documents) == batch_size}

    async def cleanup_missing_image_references(self, game_id: str, *, updated_by: str | None=None) -> dict[str, Any]:
        self._ensure_image_dependencies()
        try:
            game = await self.repository.get_by_id(game_id)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game could not be loaded.') from error
        if game is None:
            raise GameNotFoundError('Game not found.')
        missing_fields: list[str] = []
        missing_images: list[dict[str, str]] = []
        for image_type, field_name in self.IMAGE_FIELD_BY_TYPE.items():
            raw_file_id = game.get(field_name)
            if not raw_file_id:
                continue
            file_id = str(raw_file_id)
            if not await self.image_exists(file_id):
                missing_fields.append(field_name)
                missing_images.append({'image_type': image_type, 'file_id': file_id})
        if not missing_fields:
            return {'success': True, 'cleared': [], 'game': self._serialize_game(game)}
        updated_game = await self._clear_image_fields(game_id, fields=missing_fields, updated_by=updated_by)
        return {'success': True, 'cleared': missing_images, 'game': self._serialize_game(updated_game)}

    def _ensure_game_repository(self) -> None:
        if not hasattr(self, 'repository'):
            raise RuntimeError('Game repository is not configured.')

    @staticmethod
    def _utc_now() -> datetime:
        return datetime.now(timezone.utc)

    @classmethod
    def _normalize_status(cls, status: str) -> str:
        normalized = str(status or '').strip().lower()
        if normalized not in cls.ALLOWED_STATUSES:
            allowed = ', '.join(sorted(cls.ALLOWED_STATUSES))
            raise GameValidationError(f'Invalid game status. Allowed values: {allowed}.')
        return normalized

    @classmethod
    def _normalize_game_ids(cls, game_ids: Iterable[str]) -> list[str]:
        normalized: list[str] = []
        seen: set[str] = set()
        for raw_game_id in game_ids:
            game_id = str(raw_game_id or '').strip()
            if not game_id or game_id in seen:
                continue
            seen.add(game_id)
            normalized.append(game_id)
        if not normalized:
            raise GameValidationError('At least one game ID is required.')
        if len(normalized) > cls.MAX_BULK_ITEMS:
            raise GameValidationError(f'A maximum of {cls.MAX_BULK_ITEMS} games can be updated in one request.')
        return normalized

    @staticmethod
    def _validate_publish_requirements_for_game(game: dict[str, Any]) -> None:
        required_fields = {'name': game.get('name'), 'slug': game.get('slug'), 'short_description': game.get('short_description'), 'description': game.get('description'), 'game_url': game.get('game_url'), 'logo_file_id': game.get('logo_file_id')}
        missing_fields = [field for field, value in required_fields.items() if value is None or str(value).strip() == '']
        if missing_fields:
            readable = ', '.join((field.replace('_', ' ') for field in missing_fields))
            raise GameValidationError(f'Game cannot be published without: {readable}.')
        mobile_supported = bool(game.get('is_mobile_supported', True))
        desktop_supported = bool(game.get('is_desktop_supported', True))
        if not mobile_supported and (not desktop_supported):
            raise GameValidationError('At least one platform must be supported before publishing.')

    async def _get_game_document(self, game_id: str) -> dict[str, Any]:
        self._ensure_game_repository()
        try:
            game = await self.repository.get_by_id(game_id)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game could not be loaded.') from error
        if game is None:
            raise GameNotFoundError('Game not found.')
        return game

    async def set_game_status(self, game_id: str, status: str, *, updated_by: str | None=None) -> dict[str, Any]:
        normalized_status = self._normalize_status(status)
        game = await self._get_game_document(game_id)
        if normalized_status == 'published':
            self._validate_publish_requirements_for_game(game)
        updates = {'status': normalized_status, 'updated_by': updated_by, 'updated_at': self._utc_now()}
        try:
            updated_game = await self.repository.update(game_id, updates)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game status could not be updated.') from error
        if updated_game is None:
            raise GameNotFoundError('Game not found.')
        return self._serialize_game(updated_game)

    async def publish_game(self, game_id: str, *, updated_by: str | None=None) -> dict[str, Any]:
        return await self.set_game_status(game_id, 'published', updated_by=updated_by)

    async def unpublish_game(self, game_id: str, *, updated_by: str | None=None) -> dict[str, Any]:
        return await self.set_game_status(game_id, 'draft', updated_by=updated_by)

    async def set_featured(self, game_id: str, is_featured: bool, *, updated_by: str | None=None) -> dict[str, Any]:
        await self._get_game_document(game_id)
        updates = {'is_featured': bool(is_featured), 'updated_by': updated_by, 'updated_at': self._utc_now()}
        try:
            updated_game = await self.repository.update(game_id, updates)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Featured state could not be updated.') from error
        if updated_game is None:
            raise GameNotFoundError('Game not found.')
        return self._serialize_game(updated_game)

    async def feature_game(self, game_id: str, *, updated_by: str | None=None) -> dict[str, Any]:
        return await self.set_featured(game_id, True, updated_by=updated_by)

    async def unfeature_game(self, game_id: str, *, updated_by: str | None=None) -> dict[str, Any]:
        return await self.set_featured(game_id, False, updated_by=updated_by)

    async def set_landing_page_visibility(self, game_id: str, show_on_landing_page: bool, *, updated_by: str | None=None) -> dict[str, Any]:
        await self._get_game_document(game_id)
        updates = {'show_on_landing_page': bool(show_on_landing_page), 'updated_by': updated_by, 'updated_at': self._utc_now()}
        try:
            updated_game = await self.repository.update(game_id, updates)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Landing-page visibility could not be updated.') from error
        if updated_game is None:
            raise GameNotFoundError('Game not found.')
        return self._serialize_game(updated_game)

    async def show_on_landing_page(self, game_id: str, *, updated_by: str | None=None) -> dict[str, Any]:
        return await self.set_landing_page_visibility(game_id, True, updated_by=updated_by)

    async def hide_from_landing_page(self, game_id: str, *, updated_by: str | None=None) -> dict[str, Any]:
        return await self.set_landing_page_visibility(game_id, False, updated_by=updated_by)

    async def reorder_game(self, game_id: str, sort_order: int, *, updated_by: str | None=None) -> dict[str, Any]:
        if isinstance(sort_order, bool) or not isinstance(sort_order, int):
            raise GameValidationError('Sort order must be an integer.')
        if sort_order < 0:
            raise GameValidationError('Sort order must be zero or greater.')
        if sort_order > 1000000:
            raise GameValidationError('Sort order must not exceed 1000000.')
        await self._get_game_document(game_id)
        updates = {'sort_order': sort_order, 'updated_by': updated_by, 'updated_at': self._utc_now()}
        try:
            updated_game = await self.repository.update(game_id, updates)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game order could not be updated.') from error
        if updated_game is None:
            raise GameNotFoundError('Game not found.')
        return self._serialize_game(updated_game)

    async def increment_play_count(self, game_id: str) -> dict[str, Any]:
        self._ensure_game_repository()
        try:
            updated_game = await self.repository.increment_play_count(game_id)
        except ValueError as error:
            raise GameValidationError(str(error)) from error
        except Exception as error:
            raise GameServiceError('Game play count could not be updated.') from error
        if updated_game is None:
            game = await self._get_game_document(game_id)
            if game.get('status') != 'published':
                raise GameValidationError('Play count can be incremented only for published games.')
            raise GameNotFoundError('Game not found.')
        return self._serialize_game(updated_game)

    async def get_statistics(self) -> dict[str, int]:
        self._ensure_game_repository()
        try:
            return await self.repository.statistics()
        except Exception as error:
            raise GameServiceError('Game statistics could not be loaded.') from error

    async def bulk_update_status(self, game_ids: Iterable[str], status: str, *, updated_by: str | None=None) -> dict[str, Any]:
        self._ensure_game_repository()
        normalized_ids = self._normalize_game_ids(game_ids)
        normalized_status = self._normalize_status(status)
        matched: list[str] = []
        missing: list[str] = []
        invalid: list[dict[str, str]] = []
        games_by_id: dict[str, dict[str, Any]] = {}
        for game_id in normalized_ids:
            try:
                game = await self.repository.get_by_id(game_id)
            except ValueError:
                invalid.append({'game_id': game_id, 'reason': 'Invalid game ID.'})
                continue
            except Exception as error:
                raise GameServiceError('Games could not be loaded for bulk status update.') from error
            if game is None:
                missing.append(game_id)
                continue
            if normalized_status == 'published':
                try:
                    self._validate_publish_requirements_for_game(game)
                except GameValidationError as error:
                    invalid.append({'game_id': game_id, 'reason': str(error)})
                    continue
            games_by_id[game_id] = game
        now = self._utc_now()
        operations: list[UpdateOne] = []
        for game_id in games_by_id:
            operations.append(UpdateOne({'_id': self.repository.to_object_id(game_id)}, {'$set': {'status': normalized_status, 'updated_by': updated_by, 'updated_at': now}}))
            matched.append(game_id)
        modified_count = 0
        if operations:
            try:
                result = await self.repository.collection.bulk_write(operations, ordered=False)
                modified_count = int(result.modified_count)
            except Exception as error:
                raise GameServiceError('Bulk game status update failed.') from error
        return {'requested': len(normalized_ids), 'matched': matched, 'missing': missing, 'invalid': invalid, 'modified_count': modified_count, 'status': normalized_status}

    async def bulk_feature_games(self, game_ids: Iterable[str], is_featured: bool, *, updated_by: str | None=None) -> dict[str, Any]:
        return await self._bulk_boolean_update(game_ids, field_name='is_featured', value=bool(is_featured), updated_by=updated_by)

    async def bulk_landing_page_update(self, game_ids: Iterable[str], show_on_landing_page: bool, *, updated_by: str | None=None) -> dict[str, Any]:
        return await self._bulk_boolean_update(game_ids, field_name='show_on_landing_page', value=bool(show_on_landing_page), updated_by=updated_by)

    async def _bulk_boolean_update(self, game_ids: Iterable[str], *, field_name: str, value: bool, updated_by: str | None) -> dict[str, Any]:
        self._ensure_game_repository()
        allowed_fields = {'is_featured', 'show_on_landing_page'}
        if field_name not in allowed_fields:
            raise GameValidationError('Unsupported bulk update field.')
        normalized_ids = self._normalize_game_ids(game_ids)
        object_ids = []
        invalid: list[str] = []
        for game_id in normalized_ids:
            try:
                object_ids.append(self.repository.to_object_id(game_id))
            except ValueError:
                invalid.append(game_id)
        if not object_ids:
            return {'requested': len(normalized_ids), 'matched_count': 0, 'modified_count': 0, 'invalid': invalid, 'field': field_name, 'value': value}
        try:
            result = await self.repository.collection.update_many({'_id': {'$in': object_ids}}, {'$set': {field_name: value, 'updated_by': updated_by, 'updated_at': self._utc_now()}})
        except Exception as error:
            raise GameServiceError('Bulk game update failed.') from error
        return {'requested': len(normalized_ids), 'matched_count': int(result.matched_count), 'modified_count': int(result.modified_count), 'invalid': invalid, 'field': field_name, 'value': value}

    async def bulk_delete_games(self, game_ids: Iterable[str]) -> dict[str, Any]:
        self._ensure_game_repository()
        normalized_ids = self._normalize_game_ids(game_ids)
        deleted: list[str] = []
        missing: list[str] = []
        invalid: list[str] = []
        failed: list[dict[str, str]] = []
        delete_game_method = getattr(self, 'delete_game', None)
        if delete_game_method is None:
            raise RuntimeError('delete_game() must be available before using bulk deletion.')
        for game_id in normalized_ids:
            try:
                await delete_game_method(game_id)
                deleted.append(game_id)
            except ValueError:
                invalid.append(game_id)
            except GameNotFoundError:
                missing.append(game_id)
            except Exception as error:
                error_name = error.__class__.__name__
                if error_name in {'GameImageCleanupNotFoundError', 'GameNotFoundError'}:
                    missing.append(game_id)
                elif error_name in {'GameImageCleanupValidationError', 'GameValidationError'}:
                    invalid.append(game_id)
                else:
                    failed.append({'game_id': game_id, 'reason': str(error)})
        return {'requested': len(normalized_ids), 'deleted': deleted, 'missing': missing, 'invalid': invalid, 'failed': failed}