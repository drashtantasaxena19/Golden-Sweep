from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Final
from uuid import uuid4

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile

from app.core.config import settings


ALLOWED_IMAGE_TYPES: Final[dict[str, str]] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_IMAGE_SIZE: Final[int] = 5 * 1024 * 1024


@dataclass(frozen=True)
class StoredObject:
    public_url: str
    storage_key: str
    original_filename: str
    content_type: str
    size_bytes: int


class ObjectStorageService:
    def __init__(self) -> None:
        self.bucket = settings.OBJECT_STORAGE_BUCKET
        self.region = settings.OBJECT_STORAGE_REGION
        self.endpoint_url = settings.OBJECT_STORAGE_ENDPOINT_URL or None
        self.public_base_url = (
            settings.OBJECT_STORAGE_PUBLIC_BASE_URL.rstrip("/")
            if settings.OBJECT_STORAGE_PUBLIC_BASE_URL
            else ""
        )

        if not self.bucket:
            raise RuntimeError("OBJECT_STORAGE_BUCKET is not configured.")

        self.client = boto3.client(
            "s3",
            region_name=self.region or None,
            endpoint_url=self.endpoint_url,
            aws_access_key_id=settings.OBJECT_STORAGE_ACCESS_KEY,
            aws_secret_access_key=settings.OBJECT_STORAGE_SECRET_KEY,
            config=Config(
                signature_version="s3v4",
                retries={
                    "max_attempts": 3,
                    "mode": "standard",
                },
            ),
        )

    @staticmethod
    def _safe_slug(value: str) -> str:
        value = value.strip().lower()
        value = re.sub(r"[^a-z0-9-]+", "-", value)
        value = re.sub(r"-{2,}", "-", value).strip("-")
        return value or "game"

    def _build_public_url(self, storage_key: str) -> str:
        if self.public_base_url:
            return f"{self.public_base_url}/{storage_key}"

        if self.endpoint_url:
            return (
                f"{self.endpoint_url.rstrip('/')}/"
                f"{self.bucket}/{storage_key}"
            )

        if self.region:
            return (
                f"https://{self.bucket}.s3.{self.region}.amazonaws.com/"
                f"{storage_key}"
            )

        return f"https://{self.bucket}.s3.amazonaws.com/{storage_key}"

    async def upload_game_image(
        self,
        *,
        file: UploadFile,
        game_slug: str,
        image_kind: str,
    ) -> StoredObject:
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise ValueError("Only JPG, PNG and WEBP images are allowed.")

        content = await file.read(MAX_IMAGE_SIZE + 1)

        if not content:
            raise ValueError("Uploaded image is empty.")

        if len(content) > MAX_IMAGE_SIZE:
            raise ValueError("Image size must not exceed 5 MB.")

        extension = ALLOWED_IMAGE_TYPES[file.content_type]
        safe_slug = self._safe_slug(game_slug)
        storage_key = (
            f"games/{safe_slug}/{image_kind}/"
            f"{uuid4().hex}{extension}"
        )

        extra_args = {
            "ContentType": file.content_type,
            "CacheControl": "public, max-age=31536000, immutable",
        }

        if settings.OBJECT_STORAGE_PUBLIC_READ:
            extra_args["ACL"] = "public-read"

        try:
            await asyncio.to_thread(
                self.client.put_object,
                Bucket=self.bucket,
                Key=storage_key,
                Body=content,
                **extra_args,
            )
        except (BotoCoreError, ClientError) as error:
            raise RuntimeError(
                "Could not upload image to object storage."
            ) from error

        return StoredObject(
            public_url=self._build_public_url(storage_key),
            storage_key=storage_key,
            original_filename=Path(file.filename or "image").name,
            content_type=file.content_type,
            size_bytes=len(content),
        )

    async def delete_object(self, storage_key: str) -> None:
        clean_key = storage_key.strip().lstrip("/")

        if not clean_key.startswith("games/"):
            raise ValueError("Invalid game image storage key.")

        try:
            await asyncio.to_thread(
                self.client.delete_object,
                Bucket=self.bucket,
                Key=clean_key,
            )
        except (BotoCoreError, ClientError) as error:
            raise RuntimeError(
                "Could not delete image from object storage."
            ) from error
