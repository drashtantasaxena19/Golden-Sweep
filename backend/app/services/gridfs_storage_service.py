from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, AsyncIterator, Final

from bson import ObjectId
from fastapi import UploadFile
from gridfs.asynchronous import AsyncGridFSBucket
from gridfs.errors import NoFile
from pymongo.asynchronous.database import AsyncDatabase


ALLOWED_IMAGE_CONTENT_TYPES: Final[dict[str, str]] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
CONTENT_TYPE_ALIASES: Final[dict[str, str]] = {
    "image/jpg": "image/jpeg",
    "image/pjpeg": "image/jpeg",
}
ALLOWED_IMAGE_TYPES: Final[frozenset[str]] = frozenset(
    {"logo", "thumbnail", "banner"}
)
DEFAULT_MAX_IMAGE_SIZE_BYTES: Final[int] = 5 * 1024 * 1024
DEFAULT_CHUNK_SIZE_BYTES: Final[int] = 255 * 1024
DEFAULT_BUCKET_NAME: Final[str] = "game_images"


class GridFSStorageError(Exception):
    pass


class GridFSInvalidFileError(GridFSStorageError):
    pass


class GridFSFileTooLargeError(GridFSStorageError):
    pass


class GridFSFileNotFoundError(GridFSStorageError):
    pass


@dataclass(frozen=True)
class GridFSFileMetadata:
    file_id: str
    filename: str
    content_type: str
    size_bytes: int
    uploaded_at: datetime
    image_type: str | None
    game_slug: str | None
    uploaded_by: str | None
    metadata: dict[str, Any]


@dataclass(frozen=True)
class GridFSDownload:
    file_id: str
    filename: str
    content_type: str
    size_bytes: int
    uploaded_at: datetime
    metadata: dict[str, Any]
    stream: AsyncIterator[bytes]


class GridFSStorageService:
    def __init__(
        self,
        database: AsyncDatabase,
        *,
        bucket_name: str = DEFAULT_BUCKET_NAME,
        max_image_size_bytes: int = DEFAULT_MAX_IMAGE_SIZE_BYTES,
        chunk_size_bytes: int = DEFAULT_CHUNK_SIZE_BYTES,
    ) -> None:
        if max_image_size_bytes <= 0:
            raise ValueError(
                "max_image_size_bytes must be greater than zero."
            )
        if chunk_size_bytes <= 0:
            raise ValueError(
                "chunk_size_bytes must be greater than zero."
            )

        normalized_bucket_name = str(bucket_name or "").strip()
        if not normalized_bucket_name:
            raise ValueError("bucket_name must not be empty.")

        self.database = database
        self.bucket_name = normalized_bucket_name
        self.max_image_size_bytes = max_image_size_bytes
        self.chunk_size_bytes = chunk_size_bytes
        self.bucket = AsyncGridFSBucket(
            database,
            bucket_name=normalized_bucket_name,
            chunk_size_bytes=chunk_size_bytes,
        )
        self.files_collection = database[
            f"{normalized_bucket_name}.files"
        ]
        self.chunks_collection = database[
            f"{normalized_bucket_name}.chunks"
        ]

    @staticmethod
    def _utc_now() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def _to_object_id(file_id: str | ObjectId) -> ObjectId:
        if isinstance(file_id, ObjectId):
            return file_id

        normalized = str(file_id or "").strip()
        if not ObjectId.is_valid(normalized):
            raise GridFSInvalidFileError(
                "Invalid GridFS file ID."
            )
        return ObjectId(normalized)

    @staticmethod
    def _normalize_image_type(image_type: str) -> str:
        normalized = str(image_type or "").strip().lower()
        if normalized not in ALLOWED_IMAGE_TYPES:
            allowed = ", ".join(sorted(ALLOWED_IMAGE_TYPES))
            raise GridFSInvalidFileError(
                f"Invalid image type. Allowed values: {allowed}."
            )
        return normalized

    @staticmethod
    def _normalize_content_type(content_type: str | None) -> str:
        normalized = str(content_type or "").strip().lower()
        normalized = CONTENT_TYPE_ALIASES.get(
            normalized,
            normalized,
        )
        if normalized not in ALLOWED_IMAGE_CONTENT_TYPES:
            raise GridFSInvalidFileError(
                "Only JPG, PNG, and WEBP image files are allowed."
            )
        return normalized

    @staticmethod
    def _validate_signature(
        content: bytes,
        content_type: str,
    ) -> None:
        is_valid = False

        if content_type == "image/jpeg":
            is_valid = (
                len(content) >= 3
                and content[:3] == b"\xff\xd8\xff"
            )
        elif content_type == "image/png":
            is_valid = content.startswith(
                b"\x89PNG\r\n\x1a\n"
            )
        elif content_type == "image/webp":
            is_valid = (
                len(content) >= 12
                and content[:4] == b"RIFF"
                and content[8:12] == b"WEBP"
            )

        if not is_valid:
            raise GridFSInvalidFileError(
                "The uploaded file content does not match "
                "its declared image type."
            )

    @staticmethod
    def _sanitize_filename(
        filename: str,
        extension: str,
    ) -> str:
        original = Path(filename or "image").name.strip()
        stem = Path(original).stem.strip() or "image"

        safe_stem = "".join(
            character
            if character.isalnum() or character in {"-", "_"}
            else "-"
            for character in stem
        )

        while "--" in safe_stem:
            safe_stem = safe_stem.replace("--", "-")

        safe_stem = safe_stem.strip("-_") or "image"
        return f"{safe_stem}{extension}"

    async def create_indexes(self) -> None:
        await self.files_collection.create_index(
            [
                ("metadata.game_slug", 1),
                ("metadata.image_type", 1),
            ],
            name="idx_game_images_slug_type",
        )
        await self.files_collection.create_index(
            [
                ("metadata.game_id", 1),
                ("metadata.image_type", 1),
            ],
            name="idx_game_images_game_id_type",
        )
        await self.files_collection.create_index(
            [
                ("metadata.uploaded_by", 1),
                ("uploadDate", -1),
            ],
            name="idx_game_images_uploader_date",
        )
        await self.files_collection.create_index(
            [("metadata.content_type", 1)],
            name="idx_game_images_content_type",
        )
        await self.files_collection.create_index(
            [("uploadDate", -1)],
            name="idx_game_images_upload_date",
        )

    async def upload_image(
        self,
        *,
        file: UploadFile,
        image_type: str,
        game_slug: str | None = None,
        uploaded_by: str | None = None,
        extra_metadata: dict[str, Any] | None = None,
    ) -> GridFSFileMetadata:
        normalized_image_type = self._normalize_image_type(
            image_type
        )

        try:
            content_type = self._normalize_content_type(
                file.content_type
            )
            extension = ALLOWED_IMAGE_CONTENT_TYPES[
                content_type
            ]
            safe_filename = self._sanitize_filename(
                file.filename or "image",
                extension,
            )
            content = await file.read(
                self.max_image_size_bytes + 1
            )

            if not content:
                raise GridFSInvalidFileError(
                    "Uploaded image is empty."
                )
            if len(content) > self.max_image_size_bytes:
                max_size_mb = (
                    self.max_image_size_bytes
                    / (1024 * 1024)
                )
                raise GridFSFileTooLargeError(
                    f"Image size must not exceed "
                    f"{max_size_mb:g} MB."
                )

            self._validate_signature(content, content_type)

            normalized_slug = (
                str(game_slug).strip().lower()
                if game_slug
                else None
            )
            normalized_uploader = (
                str(uploaded_by).strip()
                if uploaded_by
                else None
            )
            uploaded_at = self._utc_now()

            metadata: dict[str, Any] = {
                "content_type": content_type,
                "image_type": normalized_image_type,
                "game_slug": normalized_slug,
                "uploaded_by": normalized_uploader,
                "uploaded_at": uploaded_at,
                "original_filename": Path(
                    file.filename or safe_filename
                ).name,
            }

            if extra_metadata:
                safe_extra = dict(extra_metadata)
                metadata["extra"] = safe_extra

                game_id = safe_extra.get("game_id")
                if game_id:
                    metadata["game_id"] = str(game_id)

                game_name = safe_extra.get("game_name")
                if game_name:
                    metadata["game_name"] = str(game_name)

            try:
                file_id = await self.bucket.upload_from_stream(
                    safe_filename,
                    content,
                    metadata=metadata,
                )
            except Exception as error:
                raise GridFSStorageError(
                    "Image could not be stored in GridFS."
                ) from error

            stored = await self.files_collection.find_one(
                {"_id": file_id}
            )
            if stored is None:
                try:
                    await self.bucket.delete(file_id)
                except Exception:
                    pass
                raise GridFSStorageError(
                    "Image was uploaded but its metadata "
                    "could not be loaded."
                )

            return self._serialize_file_document(stored)
        finally:
            await file.close()

    async def get_metadata(
        self,
        file_id: str | ObjectId,
    ) -> GridFSFileMetadata:
        object_id = self._to_object_id(file_id)
        document = await self.files_collection.find_one(
            {"_id": object_id}
        )
        if document is None:
            raise GridFSFileNotFoundError(
                "GridFS image not found."
            )
        return self._serialize_file_document(document)

    async def exists(
        self,
        file_id: str | ObjectId,
    ) -> bool:
        try:
            object_id = self._to_object_id(file_id)
        except GridFSInvalidFileError:
            return False

        return (
            await self.files_collection.count_documents(
                {"_id": object_id},
                limit=1,
            )
            > 0
        )

    async def delete_file(
        self,
        file_id: str | ObjectId,
    ) -> None:
        object_id = self._to_object_id(file_id)

        try:
            await self.bucket.delete(object_id)
        except NoFile as error:
            raise GridFSFileNotFoundError(
                "GridFS image not found."
            ) from error

    async def delete_many(
        self,
        file_ids: list[str | ObjectId],
        *,
        ignore_missing: bool = True,
    ) -> dict[str, list[str]]:
        deleted: list[str] = []
        missing: list[str] = []
        failed: list[str] = []
        seen: set[str] = set()

        for raw_file_id in file_ids:
            normalized = str(raw_file_id)
            if normalized in seen:
                continue
            seen.add(normalized)

            try:
                await self.delete_file(raw_file_id)
                deleted.append(normalized)
            except (
                GridFSFileNotFoundError,
                GridFSInvalidFileError,
            ):
                missing.append(normalized)
                if not ignore_missing:
                    raise
            except Exception:
                failed.append(normalized)

        return {
            "deleted": deleted,
            "missing": missing,
            "failed": failed,
        }

    async def open_download(
        self,
        file_id: str | ObjectId,
        *,
        chunk_size_bytes: int = 64 * 1024,
    ) -> GridFSDownload:
        if chunk_size_bytes <= 0:
            raise ValueError(
                "chunk_size_bytes must be greater than zero."
            )

        object_id = self._to_object_id(file_id)

        try:
            grid_out = await self.bucket.open_download_stream(
                object_id
            )
        except NoFile as error:
            raise GridFSFileNotFoundError(
                "GridFS image not found."
            ) from error

        metadata = dict(grid_out.metadata or {})
        content_type = (
            metadata.get("content_type")
            or "application/octet-stream"
        )

        async def stream_file() -> AsyncIterator[bytes]:
            try:
                while True:
                    chunk = await grid_out.read(
                        chunk_size_bytes
                    )
                    if not chunk:
                        break
                    yield chunk
            finally:
                grid_out.close()

        return GridFSDownload(
            file_id=str(grid_out._id),
            filename=grid_out.filename or "image",
            content_type=content_type,
            size_bytes=int(grid_out.length),
            uploaded_at=(
                grid_out.upload_date
                or metadata.get("uploaded_at")
                or self._utc_now()
            ),
            metadata=metadata,
            stream=stream_file(),
        )

    async def read_bytes(
        self,
        file_id: str | ObjectId,
    ) -> tuple[bytes, GridFSFileMetadata]:
        object_id = self._to_object_id(file_id)

        try:
            grid_out = await self.bucket.open_download_stream(
                object_id
            )
        except NoFile as error:
            raise GridFSFileNotFoundError(
                "GridFS image not found."
            ) from error

        try:
            content = await grid_out.read()
        finally:
            grid_out.close()

        metadata = await self.get_metadata(object_id)
        return content, metadata

    async def list_for_game(
        self,
        *,
        game_slug: str,
        image_type: str | None = None,
        limit: int = 50,
    ) -> list[GridFSFileMetadata]:
        if limit < 1 or limit > 200:
            raise ValueError(
                "limit must be between 1 and 200."
            )

        normalized_slug = str(game_slug or "").strip().lower()
        if not normalized_slug:
            raise ValueError("game_slug must not be empty.")

        query: dict[str, Any] = {
            "metadata.game_slug": normalized_slug
        }

        if image_type:
            query["metadata.image_type"] = (
                self._normalize_image_type(image_type)
            )

        cursor = (
            self.files_collection.find(query)
            .sort("uploadDate", -1)
            .limit(limit)
        )
        documents = await cursor.to_list(length=limit)
        return [
            self._serialize_file_document(document)
            for document in documents
        ]

    async def delete_for_game(
        self,
        game_slug: str,
    ) -> dict[str, list[str]]:
        files = await self.list_for_game(
            game_slug=game_slug,
            limit=200,
        )
        return await self.delete_many(
            [item.file_id for item in files],
            ignore_missing=True,
        )

    @staticmethod
    def _serialize_file_document(
        document: dict[str, Any],
    ) -> GridFSFileMetadata:
        metadata = dict(document.get("metadata") or {})
        upload_date = (
            document.get("uploadDate")
            or metadata.get("uploaded_at")
            or datetime.now(timezone.utc)
        )

        return GridFSFileMetadata(
            file_id=str(document["_id"]),
            filename=document.get("filename") or "image",
            content_type=metadata.get(
                "content_type",
                "application/octet-stream",
            ),
            size_bytes=int(document.get("length", 0)),
            uploaded_at=upload_date,
            image_type=metadata.get("image_type"),
            game_slug=metadata.get("game_slug"),
            uploaded_by=metadata.get("uploaded_by"),
            metadata=metadata,
        )


__all__ = [
    "ALLOWED_IMAGE_CONTENT_TYPES",
    "DEFAULT_BUCKET_NAME",
    "DEFAULT_CHUNK_SIZE_BYTES",
    "DEFAULT_MAX_IMAGE_SIZE_BYTES",
    "GridFSDownload",
    "GridFSFileMetadata",
    "GridFSFileNotFoundError",
    "GridFSFileTooLargeError",
    "GridFSInvalidFileError",
    "GridFSStorageError",
    "GridFSStorageService",
]