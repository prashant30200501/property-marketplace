CREATE TABLE IF NOT EXISTS property_photos (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL
        REFERENCES properties(id) ON DELETE CASCADE,
    object_name VARCHAR(500) NOT NULL UNIQUE,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_property_photos_property_id
ON property_photos(property_id);