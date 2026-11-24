
from google.cloud import storage

from app.config import settings


def get_storage_client() -> storage.Client:
    """Create a GCS client using Application Default Credentials."""
    return storage.Client(project="project-1fd5bd57-baba-458d-893")


def get_photos_bucket():
    """Return the configured private property photos bucket."""
    client = get_storage_client()
    return client.bucket(settings.property_photos_bucket)


def upload_photo(
    file_obj,
    object_name: str,
    content_type: str,
) -> None:
    """Upload an image file to the private GCS bucket."""
    bucket = get_photos_bucket()
    blob = bucket.blob(object_name)
    blob.upload_from_file(
        file_obj,
        content_type=content_type,
        rewind=True,
    )


def delete_photo(object_name: str) -> None:
    """Delete an image from the private GCS bucket."""
    bucket = get_photos_bucket()
    bucket.blob(object_name).delete()
